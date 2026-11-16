import { describe, expect, it } from 'vitest';
import { handlePush, parsePush } from './push';

const env = { SUPABASE_URL: 'https://x.supabase.co', SUPABASE_ANON_KEY: 'anon' };
const req = (body: unknown, auth: string | null = 'Bearer jwt') =>
  new Request('https://app/api/push', { method: 'POST', headers: { ...(auth ? { authorization: auth } : {}), 'content-type': 'application/json' }, body: JSON.stringify(body) });
const ok = { title: 'Nouveau', body: 'Une pause pour vous.' };

function fakeFetch(opts: { admin: boolean; tokens?: string[] }) {
  const calls: string[] = [];
  const f = (async (url: string | URL | Request, init?: RequestInit) => {
    const u = String(url); calls.push(`${init?.method ?? 'GET'} ${u}`);
    if (u.includes('/rpc/has_role')) return new Response(JSON.stringify(opts.admin), { status: 200 });
    if (u.includes('/push_devices?select')) return new Response(JSON.stringify((opts.tokens ?? []).map((token) => ({ token }))), { status: 200 });
    if (u.startsWith('https://exp.host')) {
      const msgs = JSON.parse(String(init?.body)) as { to: string }[];
      return new Response(JSON.stringify({ data: msgs.map((m) => (m.to.includes('Dead') ? { status: 'error', details: { error: 'DeviceNotRegistered' } } : { status: 'ok' })) }), { status: 200 });
    }
    return new Response('{}', { status: 200 });
  }) as typeof fetch;
  return { f, calls };
}

describe('api/push', () => {
  it('valide les entrées', () => {
    expect(parsePush(ok)).toEqual({ ...ok, postId: undefined });
    expect(parsePush({ title: 'x', body: 'ok ok' })).toBeUndefined();
    expect(parsePush({ ...ok, postId: 'pas-un-uuid' })).toBeUndefined();
  });
  it('refuse sans jeton et sans configuration', async () => {
    expect((await handlePush(req(ok, null), env, fakeFetch({ admin: true }).f)).status).toBe(401);
    expect((await handlePush(req(ok), {}, fakeFetch({ admin: true }).f)).status).toBe(503);
  });
  it('refuse une non-administratrice, sans rien lire ni envoyer', async () => {
    const { f, calls } = fakeFetch({ admin: false, tokens: ['ExponentPushToken[aaaaaaaaaaaa]'] });
    expect((await handlePush(req(ok), env, f)).status).toBe(403);
    expect(calls.some((c) => c.includes('exp.host') || c.includes('push_devices'))).toBe(false);
  });
  it('envoie, nettoie les appareils morts et marque le post', async () => {
    const { f, calls } = fakeFetch({ admin: true, tokens: ['ExponentPushToken[aaaaaaaaaaaa]', 'ExponentPushToken[DeadDeadDead]'] });
    const res = await handlePush(req({ ...ok, postId: '11111111-1111-1111-1111-111111111111' }), env, f);
    expect(await res.json()).toEqual({ sent: 1, devices: 2 });
    expect(calls.some((c) => c.startsWith('DELETE') && c.includes('DeadDeadDead'))).toBe(true);
    expect(calls.some((c) => c.startsWith('PATCH') && c.includes('journal_posts'))).toBe(true);
  });
  it('sans appareil inscrit, ne marque pas le post', async () => {
    const { f, calls } = fakeFetch({ admin: true, tokens: [] });
    expect(await (await handlePush(req({ ...ok, postId: '11111111-1111-1111-1111-111111111111' }), env, f)).json()).toEqual({ sent: 0, devices: 0 });
    expect(calls.some((c) => c.startsWith('PATCH'))).toBe(false);
  });
});
