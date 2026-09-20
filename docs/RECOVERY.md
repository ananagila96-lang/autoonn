# Backup e recuperação

Enquanto o MVP usa persistência local para dados operacionais não sensíveis, exporte um backup JSON antes de limpar dados do navegador ou trocar de computador. Tokens TikTok não entram nesse backup e permanecem exclusivamente no servidor.

A evolução para produção deve mover produtos, fila e métricas para banco persistente no backend antes de uso multi-dispositivo.
