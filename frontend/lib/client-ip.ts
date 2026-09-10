// O backend limita por IP lendo o ÚLTIMO item de `X-Forwarded-For` (ver
// ADR-0018 e app/core/rate_limit.py). Como quem chama a API é este servidor, sem
// repassar nada ele via sempre o mesmo IP: as seis rotas com freio dividiam um
// balde só, e três pedidos bloqueavam o canal para todos os visitantes.
//
// O valor NÃO pode sair do que o cliente mandou: aí ele trocaria de identidade a
// cada requisição e o freio deixaria de existir. Sai do que a borda observou —
// `x-real-ip` na Vercel — e vai como valor único, para ser o último da lista.
export function cabecalhoDeIp(request: Request): Record<string, string> {
  const observado = request.headers.get("x-real-ip");

  return observado ? { "X-Forwarded-For": observado } : {};
}
