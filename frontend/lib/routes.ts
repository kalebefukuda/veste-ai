export const LOGIN = "/login";
export const REGISTER = "/register";
export const FORGOT_PASSWORD = "/forgot-password";
export const RESET_PASSWORD = "/reset-password";

export const COMECAR = "/comecar";
export const INICIO = "/inicio";
export const NOVO_LOOK = "/looks/novo";
export const CONFIGURACOES = "/configuracoes";

// Quem acabou de criar conta não pode cair numa tela cujo rodapé é "Excluir minha
// conta". O onboarding de verdade entra quando o editor de look existir.
export const AFTER_AUTH = INICIO;
