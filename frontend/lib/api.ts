export type ApiError = { detail: string; code?: string };

export type User = {
  id: string;
  name: string;
  email: string;
  plan: string;
};

// O cadastro pode criar a conta e ainda assim não abrir sessão; quem chama precisa
// saber disso para mandar o usuário ao login em vez da área logada.
export type RegisterResult = User & { authenticated: boolean };

// Único ponto do frontend que fala com a API. As rotas /api/auth/* são handlers do
// próprio Next: o token vive num cookie httpOnly e nunca chega ao JavaScript.
async function post<T>(path: string, body: unknown): Promise<T> {
  let response: Response;

  try {
    response = await fetch(path, {
      method: "POST",
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

function messageFor(status: number, data: ApiError | null): string {
  if (data?.code === "EMAIL_ALREADY_REGISTERED") {
    return "Este e-mail já está cadastrado. Tente entrar.";
  }

  if (data?.code === "INVALID_CREDENTIALS") {
    return "E-mail ou senha incorretos.";
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
