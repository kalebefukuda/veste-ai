export const LOGIN = "/login";
export const REGISTER = "/register";
export const FORGOT_PASSWORD = "/forgot-password";
export const RESET_PASSWORD = "/reset-password";

export const COMECAR = "/comecar";
// A casa da plataforma é a vitrine de todo mundo, não a estante da pessoa: quem entra
// chega no que os outros publicaram, e o próprio trabalho fica atrás do avatar.
export const FEED = "/feed";
export const MEUS_LOOKS = "/meus-looks";
export const NOVO_LOOK = "/looks/novo";
export const CONFIGURACOES = "/configuracoes";

export const lookPublico = (id: string) => `${FEED}/${id}`;

export const AFTER_AUTH = FEED;
