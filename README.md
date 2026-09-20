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
- Preparado para backend/API e OAuth

## Rodar
```bash
npm install
npm run dev
```
Build: `npm run build`.

## Segurança
Nunca coloque access token, client secret ou credenciais no Git. Use variáveis de ambiente no backend/deploy.

## Próxima etapa
Conectar o app aprovado no TikTok Developers via OAuth e implementar no backend somente os endpoints liberados para a conta/app. Até essa autorização, o Autoonn não finge publicação real.
