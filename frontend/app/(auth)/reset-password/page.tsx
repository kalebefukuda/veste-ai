"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FORGOT_PASSWORD, LOGIN } from "@/lib/routes";
import { resetPassword } from "@/lib/api";

const MINIMO = 8;

function ResetPasswordForm() {
  const token = useSearchParams().get("token");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    // Validar antes de chamar: o token é de uso único, e gastá-lo num erro de
    // digitação obrigaria o usuário a pedir tudo de novo.
    if (password.length < MINIMO) {
      setError(`A senha precisa ter ao menos ${MINIMO} caracteres.`);
      return;
    }

    if (password !== confirmation) {
      setError("As senhas não coincidem.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await resetPassword(token as string, password);
      setDone(true);
    } catch (failure) {
      setError((failure as Error).message);
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <>
        <h1 className="text-center text-3xl font-bold tracking-[-0.03em]">Link incompleto</h1>

        <p role="alert" className="mt-6 rounded-xl bg-rose/10 px-4 py-3 text-center text-sm text-navy">
          Este link não traz o código de recuperação. Ele pode ter sido cortado ao copiar —
          peça um novo e abra direto pelo e-mail.
        </p>

        <p className="mt-8 text-center text-sm text-navy/60">
          <Link
            href={FORGOT_PASSWORD}
            className="rounded font-semibold text-purple underline-offset-4 hover:underline
              focus-visible:ring-2 focus-visible:ring-purple/40"
          >
            Pedir um link novo
          </Link>
        </p>
      </>
    );
  }

  if (done) {
    return (
      <>
        <h1 className="text-center text-3xl font-bold tracking-[-0.03em]">Tudo certo</h1>

        <p
          role="status"
          className="mt-6 rounded-xl bg-purple-light/20 px-4 py-3 text-center text-sm text-navy"
        >
          Senha alterada. Use a senha nova para entrar.
        </p>

        <p className="mt-8 text-center text-sm text-navy/60">
          <Link
            href={LOGIN}
            className="rounded font-semibold text-purple underline-offset-4 hover:underline
              focus-visible:ring-2 focus-visible:ring-purple/40"
          >
            Entrar
          </Link>
        </p>
      </>
    );
  }

  return (
    <>
      <h1 className="text-center text-3xl font-bold tracking-[-0.03em]">Criar uma senha nova</h1>

      <form onSubmit={handleSubmit} noValidate className="mt-10 space-y-5">
        <Input
          label="Nova senha"
          type="password"
          name="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        <Input
          label="Confirme a nova senha"
          type="password"
          name="confirmation"
          autoComplete="new-password"
          required
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
        />

        {error && (
          <p role="alert" className="rounded-xl bg-rose/10 px-4 py-3 text-sm text-navy">
            {error}
          </p>
        )}

        <Button type="submit" loading={loading} loadingLabel="Salvando…">
          Salvar nova senha
        </Button>
      </form>
    </>
  );
}

// `useSearchParams` obriga a fronteira de Suspense: sem ela o build de produção falha
// ao pré-renderizar. O fallback tem a forma do formulário, não um spinner solto.
function Skeleton() {
  return (
    <div aria-hidden className="animate-pulse space-y-5">
      <div className="mx-auto h-9 w-64 rounded-lg bg-navy/10" />
      <div className="h-[4.5rem] rounded-2xl bg-navy/5" />
      <div className="h-[4.5rem] rounded-2xl bg-navy/5" />
      <div className="h-[3.4rem] rounded-2xl bg-navy/10" />
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<Skeleton />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
