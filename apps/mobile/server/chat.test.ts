import { beforeEach, describe, expect, it, vi } from 'vitest';
import { buildSystemPrompt, handleChat, resetRateLimit } from './chat';

const req = (body: unknown, method = 'POST') =>
  new Request('https://x.test/api/chat', { method, headers: { 'content-type': 'application/json', 'x-forwarded-for': '1.2.3.4' }, body: method === 'POST' ? JSON.stringify(body) : undefined });
const ok = { messages: [{ role: 'user', content: 'Quel est le prix de L\'Excellence ?' }] };

describe('chat', () => {
  beforeEach(() => resetRateLimit());
  it('le prompt contient les vrais prix et renvoie vers Planity', () => {
    const p = buildSystemPrompt();
    expect(p).toContain("L'Excellence : 1h30, 150 €");
    expect(p).toContain('onglet « Réservation »');
    expect(p).toContain('Mardi – samedi 10h30–18h30');
  });
  it('503 sans clé API (aucune réponse inventée)', async () => {
    expect((await handleChat(req(ok), {})).status).toBe(503);
  });
  it('400 si la requête est invalide', async () => {
    expect((await handleChat(req({ messages: [] }), { ANTHROPIC_API_KEY: 'k' })).status).toBe(400);
  });
  it('405 hors POST', async () => {
    expect((await handleChat(req(null, 'GET'), { ANTHROPIC_API_KEY: 'k' })).status).toBe(405);
  });
  it('renvoie la réponse du modèle et n\'expose pas la clé', async () => {
    const f = vi.fn().mockResolvedValue(new Response(JSON.stringify({ content: [{ type: 'text', text: '150 €.' }] }), { status: 200 }));
    const r = await handleChat(req(ok), { ANTHROPIC_API_KEY: 'secret-key' }, f as unknown as typeof fetch);
    expect(r.status).toBe(200);
    const text = await r.text();
    expect(JSON.parse(text)).toEqual({ reply: '150 €.' });
    expect(text).not.toContain('secret-key');
    expect((f.mock.calls[0]![1] as RequestInit).headers).toMatchObject({ 'x-api-key': 'secret-key' });
  });
  it('502 si le fournisseur échoue', async () => {
    const f = vi.fn().mockResolvedValue(new Response('boom', { status: 500 }));
    expect((await handleChat(req(ok), { ANTHROPIC_API_KEY: 'k' }, f as unknown as typeof fetch)).status).toBe(502);
  });
  it('429 après trop de requêtes', async () => {
    const f = vi.fn().mockImplementation(async () => new Response(JSON.stringify({ content: [{ type: 'text', text: 'ok' }] })));
    let last = 200;
    for (let i = 0; i < 21; i++) last = (await handleChat(req(ok), { ANTHROPIC_API_KEY: 'k' }, f as unknown as typeof fetch)).status;
    expect(last).toBe(429);
  });
});
