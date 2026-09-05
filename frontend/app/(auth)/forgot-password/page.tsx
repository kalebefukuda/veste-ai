"use client";

import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { LOGIN } from "@/lib/routes";
import { forgotPassword } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await forgotPassword(email);
      setSent(true);
    } catch (failure) {
      setError((failure as Error).message);
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <>
        <h1 className="text-center text-3xl font-bold tracking-[-0.03em]">Confira seu e-mail</h1>

        {/* A confirmação não repete o endereço nem diz se a conta existe: seria
            enumeração de usuários, e o backend responde 202 genérico pelo mesmo motivo. */}
        <p
          role="status"
          className="mt-6 rounded-xl bg-purple-light/20 px-4 py-3 text-center text-sm text-navy"
        >
          Se houver uma conta com esse e-mail, enviamos um link para criar uma senha nova.
          O link vale por 1 hora.
        </p>

        <p className="mt-8 text-center text-sm text-navy/60">
          <Link
            href={LOGIN}
            className="rounded font-semibold text-purple underline-offset-4 hover:underline
              focus-visible:ring-2 focus-visible:ring-purple/40"
          >
            Voltar para entrar
          </Link>
        </p>
      </>
    );
  }

  return (
    <>
      <h1 className="text-center text-3xl font-bold tracking-[-0.03em]">Esqueceu a senha?</h1>

      <p className="mt-3 text-center text-sm text-navy/60">
        Digite seu e-mail e enviamos um link para você criar uma senha nova.
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-10 space-y-5">
        <Input
          label="E-mail"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="nome@exemplo.com"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        {error && (
          <p role="alert" className="rounded-xl bg-rose/10 px-4 py-3 text-sm text-navy">
            {error}
          </p>
        )}

        <Button type="submit" loading={loading} loadingLabel="Enviando…">
          Enviar link
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-navy/60">
        Lembrou a senha?{" "}
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
