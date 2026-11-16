/**
 * Envoi d'une notification « nouveau contenu du Journal » aux appareils inscrits.
 * Sécurité : aucune clé secrète. L'appelante envoie son jeton de session ; on vérifie qu'elle a le rôle admin
 * (fonction has_role) et on lit la table des appareils avec ce même jeton, donc sous la RLS (admin uniquement).
 */
type Env = { SUPABASE_URL?: string; SUPABASE_ANON_KEY?: string };

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EXPO_URL = 'https://exp.host/--/api/v2/push/send';

export interface PushInput { title: string; body: string; postId?: string }

export function parsePush(raw: unknown): PushInput | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const { title, body, postId } = raw as Record<string, unknown>;
  if (typeof title !== 'string' || typeof body !== 'string') return undefined;
  const t = title.trim(); const b = body.trim();
  if (t.length < 2 || t.length > 60 || b.length < 2 || b.length > 170) return undefined;
  if (postId !== undefined && (typeof postId !== 'string' || !UUID.test(postId))) return undefined;
  return { title: t, body: b, postId };
}

export async function handlePush(req: Request, env: Env, fetchImpl: typeof fetch = fetch): Promise<Response> {
  if (req.method !== 'POST') return json(405, { error: 'method_not_allowed' });
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) return json(503, { error: 'push_unavailable' });
  const auth = req.headers.get('authorization') ?? '';
  if (!/^Bearer\s+\S+$/.test(auth)) return json(401, { error: 'unauthorized' });

  let input: PushInput | undefined;
  try { input = parsePush(await req.json()); } catch { input = undefined; }
  if (!input) return json(400, { error: 'invalid_request' });

  const base = env.SUPABASE_URL.replace(/\/$/, '');
  const headers = { apikey: env.SUPABASE_ANON_KEY, authorization: auth, 'content-type': 'application/json' };

  const role = await fetchImpl(`${base}/rest/v1/rpc/has_role`, { method: 'POST', headers, body: JSON.stringify({ _role: 'admin' }) });
  if (!role.ok || (await role.json()) !== true) return json(403, { error: 'forbidden' });

  const list = await fetchImpl(`${base}/rest/v1/push_devices?select=token&topics=cs.%7Bjournal%7D&limit=10000`, { headers });
  if (!list.ok) return json(502, { error: 'devices_unavailable' });
  const tokens = ((await list.json()) as { token: string }[]).map((d) => d.token);
  if (tokens.length === 0) return json(200, { sent: 0, devices: 0 });

  let sent = 0;
  const dead: string[] = [];
  for (let i = 0; i < tokens.length; i += 100) {
    const chunk = tokens.slice(i, i + 100);
    const res = await fetchImpl(EXPO_URL, {
      method: 'POST', headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify(chunk.map((to) => ({ to, title: input.title, body: input.body, sound: 'default', data: { postId: input.postId } }))),
    });
    if (!res.ok) continue;
    const tickets = ((await res.json()) as { data?: { status: string; details?: { error?: string } }[] }).data ?? [];
    tickets.forEach((t, idx) => {
      if (t.status === 'ok') sent++;
      else if (t.details?.error === 'DeviceNotRegistered') { const tk = chunk[idx]; if (tk) dead.push(tk); }
    });
  }
  // Nettoyage des appareils désinstallés.
  for (const tk of dead) await fetchImpl(`${base}/rest/v1/push_devices?token=eq.${encodeURIComponent(tk)}`, { method: 'DELETE', headers });
  if (input.postId && sent > 0) {
    await fetchImpl(`${base}/rest/v1/journal_posts?id=eq.${input.postId}`, { method: 'PATCH', headers, body: JSON.stringify({ notified_at: new Date().toISOString() }) });
  }
  return json(200, { sent, devices: tokens.length });
}
