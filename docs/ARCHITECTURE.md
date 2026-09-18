# Arquitetura Autoonn V1

## Princípio
O navegador nunca recebe client secret. OAuth e chamadas que exigem segredo passam por backend.

## Fluxo
1. Produto entra manualmente/importado.
2. Score prioriza comissão, demanda, prova e facilidade de conteúdo.
3. Conteúdo gera variações de gancho/CTA.
4. Fila mantém estado: draft, approved, publishing, published, failed.
5. Adaptador TikTok publica apenas por endpoints oficialmente liberados.
6. Métricas alimentam score de performance e decisão de repetir/parar.

## Backend planejado
- GET /api/tiktok/auth/start
- GET /api/tiktok/auth/callback
- GET /api/tiktok/status
- POST /api/tiktok/publish
- GET /api/tiktok/posts/:id/status
- POST /api/metrics/sync

## Segurança
Tokens no servidor, criptografados/secret store. Nunca localStorage, VITE_* ou Git.
