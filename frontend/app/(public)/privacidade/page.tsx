import type { Metadata } from "next";
import Link from "next/link";

import { CONTATO_LGPD } from "@/lib/contato";

export const metadata: Metadata = {
  title: "Política de Privacidade — VesteAí",
  description:
    "Quais dados o VesteAí coleta, com que finalidade, sob qual base legal da LGPD e como exercer seus direitos.",
};

const DADOS = [
  {
    dado: "Nome e e-mail",
    finalidade: "Identificação e autenticação",
    base: "Execução de contrato — art. 7º, V",
  },
  {
    dado: "Senha (hash bcrypt)",
    finalidade: "Autenticação segura",
    base: "Execução de contrato — art. 7º, V",
  },
  {
    dado: "Avatar e bio",
    finalidade: "Personalização do perfil público",
    base: "Consentimento — art. 7º, I",
  },
  {
    dado: "Looks e peças publicados",
    finalidade: "Conteúdo da plataforma",
    base: "Execução de contrato — art. 7º, V",
  },
  {
    dado: "Cliques em links (IP apenas como hash)",
    finalidade: "Métricas de desempenho para quem publicou",
    base: "Legítimo interesse — art. 7º, IX",
  },
];

export default function PrivacidadePage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-20 lg:py-28">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-purple">
        Privacidade
      </p>
      <h1 className="mt-5 text-3xl font-bold leading-[1.1] tracking-[-0.03em] text-navy sm:text-5xl">
        Política de Privacidade
      </h1>
      <p className="mt-5 leading-relaxed text-navy/65">
        Esta página descreve quais dados pessoais o VesteAí trata, com que
        finalidade e sob qual base legal da Lei Geral de Proteção de Dados (Lei
        nº 13.709/2018).
      </p>

      <h2 className="mt-14 text-2xl font-bold tracking-[-0.02em] text-navy">
        Dados que coletamos
      </h2>
      <p className="mt-4 leading-relaxed text-navy/65">
        Apenas o necessário para a plataforma funcionar:
      </p>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-navy/15">
              <th scope="col" className="py-3 pr-4 font-semibold text-navy">
                Dado
              </th>
              <th scope="col" className="py-3 pr-4 font-semibold text-navy">
                Finalidade
              </th>
              <th scope="col" className="py-3 font-semibold text-navy">
                Base legal
              </th>
            </tr>
          </thead>
          <tbody>
            {DADOS.map((linha) => (
              <tr
                key={linha.dado}
                className="border-b border-navy/10 align-top"
              >
                <td className="py-3 pr-4 text-navy">{linha.dado}</td>
                <td className="py-3 pr-4 text-navy/65">{linha.finalidade}</td>
                <td className="py-3 text-navy/65">{linha.base}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-6 rounded-2xl bg-purple-light/15 px-5 py-4 text-sm leading-relaxed text-navy">
        O VesteAí <strong>não coleta</strong> dados de cartão de crédito, dados
        bancários nem informações de compra. A transação acontece na loja
        externa, e a plataforma não participa dela.
      </p>

      <h2 className="mt-14 text-2xl font-bold tracking-[-0.02em] text-navy">
        Como os dados são guardados
      </h2>
      <p className="mt-4 leading-relaxed text-navy/65">
        Os dados ficam em banco PostgreSQL com acesso restrito ao serviço da
        aplicação. O endereço IP de quem clica em um link de compra é gravado{" "}
        <strong>apenas como hash SHA-256</strong> — o IP original nunca é
        armazenado, o que reduz a retenção de dado pessoal identificável. As
        senhas são guardadas como hash bcrypt e nunca em texto legível.
      </p>

      <h2 className="mt-14 text-2xl font-bold tracking-[-0.02em] text-navy">
        Seus direitos
      </h2>
      <p className="mt-4 leading-relaxed text-navy/65">
        A LGPD garante a você, a qualquer momento, o direito de acessar,
        corrigir e excluir seus dados, além de revogar consentimento e solicitar
        a portabilidade.
      </p>
      <ul className="mt-5 space-y-3 leading-relaxed text-navy/65">
        <li>
          <strong className="text-navy">Corrigir</strong> nome, avatar e bio:
          direto nas configurações do seu perfil.
        </li>
        <li>
          <strong className="text-navy">Acessar, exportar ou excluir</strong>{" "}
          seus dados: por solicitação no e-mail abaixo. Ainda não há botão de
          autoatendimento para isso — o pedido é atendido manualmente, no prazo
          legal.
        </li>
      </ul>
      <p className="mt-5 leading-relaxed text-navy/65">
        Pedidos devem ser enviados para{" "}
        <a
          href={`mailto:${CONTATO_LGPD}`}
          className="rounded font-semibold text-purple underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-purple/40"
        >
          {CONTATO_LGPD}
        </a>{" "}
        e são respondidos em até{" "}
        <strong className="text-navy">15 dias corridos</strong>, conforme a
        LGPD. A exclusão da conta remove os dados pessoais e os looks
        publicados.
      </p>

      <h2 className="mt-14 text-2xl font-bold tracking-[-0.02em] text-navy">
        Retenção
      </h2>
      <p className="mt-4 leading-relaxed text-navy/65">
        Os dados são mantidos enquanto a conta existir. Depois da exclusão, os
        dados pessoais são removidos. Registros de clique já anonimizados, sem
        vínculo com pessoa identificável, podem ser mantidos de forma agregada
        para estatística.
      </p>

      <h2 className="mt-14 text-2xl font-bold tracking-[-0.02em] text-navy">
        Cookies
      </h2>
      <p className="mt-4 leading-relaxed text-navy/65">
        O VesteAí usa um único cookie, estritamente necessário para manter você
        autenticado depois do login. Não há cookie de publicidade, de
        rastreamento de terceiros nem de analytics — por isso não existe banner
        de consentimento: cookie estritamente necessário não depende de
        consentimento prévio.
      </p>

      <p className="mt-16 border-t border-navy/10 pt-8 text-sm text-navy/50">
        Projeto acadêmico de Engenharia de Software — Católica SC.{" "}
        <Link
          href="/"
          className="rounded font-medium text-purple underline-offset-4 hover:underline"
        >
          Voltar para a página inicial
        </Link>
      </p>
    </main>
  );
}
