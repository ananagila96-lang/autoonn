# Autoonn API

Backend mínimo para manter credenciais fora do navegador e enviar vídeos ao rascunho do TikTok.

Rodar: `npm run api`.

Variáveis: `TIKTOK_CLIENT_KEY`, `TIKTOK_CLIENT_SECRET`, `TIKTOK_REDIRECT_URI`, `TIKTOK_SCOPES`, `APP_ORIGIN` e `MAX_VIDEO_BYTES`.

Endpoints principais:

- `GET /api/tiktok/auth/start`: inicia o OAuth oficial.
- `GET /api/tiktok/auth/callback`: valida `state` e troca o código por tokens.
- `POST /api/tiktok/upload`: recebe MP4, MOV ou WebM e envia como rascunho pelo `video.upload`.
- `GET /api/tiktok/posts/:publishId/status`: consulta o processamento do TikTok.

O fluxo não usa Direct Post. Depois do upload, o usuário abre a notificação no aplicativo TikTok para revisar e publicar.
