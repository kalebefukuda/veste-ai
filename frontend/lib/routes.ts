export const LOGIN = "/login";
export const REGISTER = "/register";
export const FORGOT_PASSWORD = "/forgot-password";
export const RESET_PASSWORD = "/reset-password";

export const CONFIGURACOES = "/configuracoes";

// Destino depois de autenticar. Aponta para as configurações enquanto o feed não
// existe — quando ele entrar, muda só aqui.
export const AFTER_AUTH = CONFIGURACOES;
