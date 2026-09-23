# Autoonn

MVP reconstruído do zero para reduzir trabalho manual na operação de conteúdo e afiliados do TikTok.

## Objetivo
Fluxo: **produto → score → roteiro → fila → publicação oficial → métricas → repetir vencedores**.

## V1
- Dashboard operacional responsivo
- Ranking de produtos e comissão
- Fila de conteúdo
- Estrutura de métricas
- Tela de integração TikTok
- Segredos excluídos do Git
- OAuth TikTok com validação de `state` e renovação de token
- Envio oficial de vídeo como rascunho pelo Content Posting API
- Consulta do status de processamento do TikTok

## Rodar
```bash
npm install
npm run dev
```
Build: `npm run build`.

## Segurança
Nunca coloque access token, client secret ou credenciais no Git. Use variáveis de ambiente no backend/deploy.

## Integração TikTok

O frontend usa `VITE_API_BASE_URL`. O backend precisa de HTTPS público e das variáveis documentadas em `.env.server.example`. O Client Secret e os tokens nunca vão para o GitHub Pages.

O Autoonn envia o vídeo como rascunho; a revisão e a publicação final acontecem dentro do aplicativo TikTok.
