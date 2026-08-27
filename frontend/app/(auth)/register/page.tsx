"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { AFTER_AUTH, LOGIN } from "@/lib/routes";
import { register } from "@/lib/api";

const MIN_PASSWORD = 8;

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const passwordTooShort = password.length > 0 && password.length < MIN_PASSWORD;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await register(name, email, password);
      router.push(AFTER_AUTH);
    } catch (failure) {
      setError((failure as Error).message);
      setLoading(false);
    }
  }

  return (
    <>
      <h1 className="text-center text-3xl font-bold tracking-[-0.03em]">Crie sua conta</h1>

      <form onSubmit={handleSubmit} noValidate className="mt-10 space-y-5">
        <Input
          label="Nome"
          name="name"
          autoComplete="name"
          placeholder="Como você quer ser chamado"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
        />

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

        <Input
          label="Senha"
          type="password"
          name="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={passwordTooShort ? `Use ao menos ${MIN_PASSWORD} caracteres.` : undefined}
        />

        {error && (
          <p role="alert" className="rounded-xl bg-rose/10 px-4 py-3 text-sm text-navy">
            {error}
          </p>
        )}

        <Button type="submit" loading={loading} loadingLabel="Criando conta…" disabled={passwordTooShort}>
          Criar conta
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-navy/60">
        Já tem conta?{" "}
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
