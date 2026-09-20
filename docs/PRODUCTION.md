# Produção

O backend atual mantém tokens e dados em memória apenas para desenvolvimento. Antes de uso real, o host deve fornecer HTTPS, secret store e banco persistente. O fluxo OAuth exige Redirect URI pública e idêntica à registrada no TikTok Developers.

Checklist: domínio HTTPS, APP_ORIGIN, Client Key/Secret no secret store, banco persistente, logs sem tokens, política de privacidade/termos, scopes aprovados e teste controlado de publicação.
