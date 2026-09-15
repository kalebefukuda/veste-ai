export type ApiError = { detail: string; code?: string };

export type Intent = "creator" | "shopper";

export type User = {
  id: string;
  name: string;
  email: string;
  plan: string;
  avatar?: string | null;
  bio?: string | null;
  username?: string | null;
  onboarded_at?: string | null;
  intent?: Intent | null;
};

export type Peca = {
  id: string;
  name: string;
  purchase_url: string;
  store?: string | null;
  price?: string | null;
  image_url?: string | null;
};

export type Look = {
  id: string;
  title: string;
  description?: string | null;
  category?: Categoria | null;
  image_url?: string | null;
  ai_generated: boolean;
  status: "draft" | "published";
  created_at: string;
  pieces: Peca[];
};

import type { Categoria } from "@/lib/categorias";

export type Criador = {
  name: string;
  username?: string | null;
  avatar?: string | null;
};

// O que a vitrine mostra de um look de outra pessoa: sem `status`, sem dono, sem nada
// que só interesse a quem edita.
export type LookPublico = {
  id: string;
  title: string;
  description?: string | null;
  category?: Categoria | null;
  image_url?: string | null;
  created_at: string;
  creator: Criador;
  pieces: Peca[];
};

export type PaginaDoFeed = {
  items: LookPublico[];
  next_page: number | null;
};

export type PecaNova = {
  name: string;
  purchase_url: string;
  store?: string;
  image_url?: string;
  price?: string;
};

export type PerfilPatch = {
  name?: string;
  bio?: string | null;
  intent?: Intent;
  username?: string;
};

// O cadastro pode criar a conta e ainda assim não abrir sessão; quem chama precisa
// saber disso para mandar o usuário ao login em vez da área logada.
export type RegisterResult = User & { authenticated: boolean };

// Único ponto do frontend que fala com a API. As rotas /api/auth/* são handlers do
// próprio Next: o token vive num cookie httpOnly e nunca chega ao JavaScript.
async function send<T>(method: string, path: string, body: unknown): Promise<T> {
  let response: Response;

  try {
    response = await fetch(path, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("Não foi possível conectar. Verifique sua internet e tente de novo.");
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(messageFor(response.status, data));
  }

  return data as T;
}

const post = <T,>(path: string, body: unknown) => send<T>("POST", path, body);

function messageFor(status: number, data: ApiError | null): string {
  if (data?.code === "EMAIL_ALREADY_REGISTERED") {
    return "Este e-mail já está cadastrado. Tente entrar.";
  }

  if (data?.code === "INVALID_CREDENTIALS") {
    return "E-mail ou senha incorretos.";
  }

  if (status === 429) {
    return "Muitas tentativas. Tente de novo daqui a pouco.";
  }

  if (status === 502) {
    return "Não conseguimos enviar agora. Tente de novo em alguns minutos.";
  }

  if (data?.code === "LOOK_WITHOUT_PIECE") {
    return "Adicione ao menos uma peça com link de compra antes de publicar.";
  }

  if (data?.code === "LOOK_WITHOUT_CATEGORY") {
    return "Escolha a ocasião do look antes de publicar.";
  }

  if (data?.code === "LOOK_WITHOUT_IMAGE") {
    return "O look precisa de uma imagem para ser publicado — e para continuar publicado.";
  }

  if (data?.code === "USERNAME_ALREADY_TAKEN") {
    return "Este nome de usuário já está em uso. Escolha outro.";
  }

  if (status === 422) {
    return "Confira os dados preenchidos e tente de novo.";
  }

  return data?.detail ?? "Algo deu errado. Tente de novo em instantes.";
}

export function login(email: string, password: string): Promise<User> {
  return post<User>("/api/auth/login", { email, password });
}

export function register(
  name: string,
  email: string,
  password: string,
): Promise<RegisterResult> {
  return post<RegisterResult>("/api/auth/register", { name, email, password });
}

// A resposta é 202 genérica de propósito: dizer se a conta existe seria enumeração
// de usuários. Quem chama não recebe nada porque não há nada que possa contar.
export async function forgotPassword(email: string): Promise<void> {
  await post<null>("/api/auth/forgot-password", { email });
}

export async function resetPassword(token: string, password: string): Promise<void> {
  await post<null>("/api/auth/reset-password", { token, password });
}

export function updateMe(dados: PerfilPatch): Promise<User> {
  return send<User>("PATCH", "/api/users/me", dados);
}

export async function deleteMe(password: string): Promise<void> {
  const response = await fetch("/api/users/me", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });

  if (!response.ok) {
    throw new Error(messageFor(response.status, await response.json().catch(() => null)));
  }
}

export function marcarOnboarding(): Promise<User> {
  return send<User>("POST", "/api/users/me/onboarding", undefined);
}

export function limparOnboarding(): Promise<User> {
  return send<User>("DELETE", "/api/users/me/onboarding", undefined);
}

export async function enviarContato(email: string, message: string): Promise<void> {
  await send<{ detail: string }>("POST", "/api/contact", { email, message });
}

export function carregarMaisDoFeed(
  page: number,
  busca?: string,
  categoria?: string,
): Promise<PaginaDoFeed> {
  const alvo = new URLSearchParams({ page: String(page) });
  if (busca) alvo.set("q", busca);
  if (categoria) alvo.set("categoria", categoria);

  return send<PaginaDoFeed>("GET", `/api/feed?${alvo}`, undefined);
}

export function criarLook(title: string, description?: string): Promise<Look> {
  return send<Look>("POST", "/api/looks", { title, ...(description ? { description } : {}) });
}

export function atualizarLook(id: string, dados: Partial<Look>): Promise<Look> {
  return send<Look>("PATCH", `/api/looks/${id}`, dados);
}

export function adicionarPeca(lookId: string, peca: PecaNova): Promise<Peca> {
  return send<Peca>("POST", `/api/looks/${lookId}/pieces`, peca);
}

export function publicarLook(id: string): Promise<Look> {
  return send<Look>("POST", `/api/looks/${id}/publish`, undefined);
}

// Sem corpo na resposta: 204 não passa pelo `send`, que faz `.json()`.
async function remove(path: string): Promise<void> {
  const resposta = await fetch(path, { method: "DELETE" });

  if (!resposta.ok) {
    throw new Error(messageFor(resposta.status, await resposta.json().catch(() => null)));
  }
}

export const removerLook = (id: string) => remove(`/api/looks/${id}`);

export const removerPeca = (lookId: string, pecaId: string) =>
  remove(`/api/looks/${lookId}/pieces/${pecaId}`);
