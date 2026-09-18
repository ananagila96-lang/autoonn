# Go-live

Quando a conta estiver autorizada:

1. Configure Client Key/Secret no secret store do host.
2. Configure Redirect URI idêntica à cadastrada no TikTok Developers.
3. Abra /api/tiktok/auth/start e conclua consentimento.
4. Callback valida state e troca code por token no servidor.
5. Consulte creator_info antes de qualquer publicação.
6. Só habilite publicação depois de confirmar os scopes realmente concedidos.
7. Faça um único post de teste e confirme status antes de liberar fila.

Não automatize upload/publicação fora das APIs e permissões oficiais disponíveis para o app.
