# Segurança

Não abra issues ou commits contendo tokens, senhas, client secrets ou cookies. Revogue imediatamente qualquer segredo que tenha sido publicado no passado.

O frontend só pode receber estado da conexão e dados necessários à UI. Credenciais TikTok ficam no backend/secret store. OAuth state deve ser validado no callback antes de trocar o code por token.
