"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { login } from "@/lib/api";

export default function EntrarPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      router.push("/");
    } catch (failure) {
      setError((failure as Error).message);
      setLoading(false);
    }
  }

  return (
    <>
      <h1 className="text-center text-3xl font-bold tracking-[-0.03em]">Entre na sua conta</h1>

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

        <Input
          label="Senha"
          type="password"
          name="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        {error && (
          <p role="alert" className="rounded-xl bg-rose/10 px-4 py-3 text-sm text-navy">
            {error}
          </p>
        )}

        <Button type="submit" loading={loading} loadingLabel="Entrando…">
          Entrar
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-navy/60">
        Não tem conta?{" "}
        <Link
          href="/cadastrar"
          className="rounded font-semibold text-purple underline-offset-4 hover:underline
            focus-visible:ring-2 focus-visible:ring-purple/40"
        >
          Cadastre-se
        </Link>
      </p>
    </>
  );
}
