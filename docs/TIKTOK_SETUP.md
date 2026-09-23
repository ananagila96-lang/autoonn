# TikTok — checklist de integração

A publicação real fica desligada até o app e a conta terem autorização oficial adequada.

Precisaremos confirmar no portal TikTok Developers: Client Key, Redirect URI cadastrada, produtos/scopes aprovados e domínio/URL de produção. O Client Secret deve ser configurado diretamente no secret store do deploy, nunca enviado em chat ou commitado.

Depois da autorização, o backend troca o authorization code por tokens e guarda-os no servidor. A UI apenas consulta o estado da conexão.

## Sandbox Autoonn

- Produtos: Login Kit, Share Kit e Content Posting API.
- Scopes: `user.info.basic` e `video.upload`.
- Modo de envio: Upload to TikTok (`FILE_UPLOAD`), sem Direct Post.
- Conta de teste: `@ananagilas`.

O redirect URI precisa apontar para o backend HTTPS em `/api/tiktok/auth/callback`. O frontend no GitHub Pages usa `VITE_API_BASE_URL` para acessar esse backend.
