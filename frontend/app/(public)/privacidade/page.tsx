import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import ContatoForm from "@/components/privacidade/ContatoForm";

export const metadata: Metadata = {
  title: "Política de Privacidade — VesteAí",
  description:
    "Quais dados o VesteAí coleta, com quem compartilha, com que finalidade, sob qual base legal da LGPD e como exercer seus direitos.",
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
    dado: "Avatar, bio e nome de usuário",
    finalidade: "Personalização do perfil público",
    base: "Consentimento — art. 7º, I",
  },
  {
    dado: "E-mail e texto enviados no formulário desta página",
    finalidade: "Atender ao seu pedido e responder no prazo",
    base: "Cumprimento de obrigação legal — art. 7º, II",
  },
];

const COMPARTILHAMENTO = [
  {
    servico: "Brevo",
    uso: "Envia os e-mails da plataforma. Recebe nome e e-mail para as mensagens de boas-vindas e de recuperação de senha, e o e-mail e o texto enviados pelo formulário desta página.",
  },
  {
    servico: "Amazon Web Services (AWS)",
    uso: "Hospeda a API, o banco de dados e as imagens dos looks, nos Estados Unidos, na região de Ohio (us-east-2). É onde ficam os dados da conta e o que você publica, o que configura transferência internacional de dados (LGPD, art. 33).",
  },
  {
    servico: "Google Gemini",
    uso: "Gera a imagem do look por IA, só quando você pede. Recebe as fotos das peças, a descrição do look (ou o título, se não houver descrição) e, se você escolher, o gênero e o cabelo do modelo.",
  },
  {
    servico: "Google Safe Browsing",
    uso: "Confere o link de compra quando uma peça é cadastrada. Recebe só o endereço do link, para checar se ele é conhecido por malware ou phishing.",
  },
  {
    servico: "Vercel",
    uso: "Hospeda o site: as páginas que você abre são entregues por ela.",
  },
];

export default function PrivacidadePage() {
  return (
    <>
      <header className="border-b border-navy/10">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-6 py-5">
          <Link
            href="/"
            aria-label="VesteAí — voltar para a página inicial"
            className="rounded-full text-lg font-bold tracking-[-0.02em] focus-visible:ring-2 focus-visible:ring-purple/40"
          >
            <span className="text-navy">Veste</span>
            <span className="text-purple">Aí</span>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-navy/15 px-4 py-2 text-sm font-semibold text-navy transition hover:border-purple hover:text-purple focus-visible:ring-2 focus-visible:ring-purple/40"
          >
            <ArrowLeft size={16} aria-hidden />
            Voltar
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-16 lg:py-24">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-purple">
          Privacidade
        </p>
        <h1 className="mt-5 text-3xl font-bold leading-[1.1] tracking-[-0.03em] text-navy sm:text-5xl">
          Política de Privacidade
        </h1>
        <p className="mt-5 leading-relaxed text-navy/65">
          Esta página descreve quais dados pessoais o VesteAí trata, com que
          finalidade e sob qual base legal da Lei Geral de Proteção de Dados
          (Lei nº 13.709/2018).
        </p>

        <h2 className="mt-14 text-2xl font-bold tracking-[-0.02em] text-navy">
          Dados que coletamos
        </h2>
        <p className="mt-4 leading-relaxed text-navy/65">
          Hoje a plataforma trata apenas o que a conta exige para existir:
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
          O VesteAí <strong>não coleta</strong> dados de cartão de crédito,
          dados bancários nem informações de compra. A transação acontece na
          loja externa, e a plataforma não participa dela.
        </p>

        <h2 className="mt-14 text-2xl font-bold tracking-[-0.02em] text-navy">
          Como os dados são guardados
        </h2>
        <p className="mt-4 leading-relaxed text-navy/65">
          Os dados ficam em banco PostgreSQL com acesso restrito ao serviço da
          aplicação. As senhas são guardadas como{" "}
          <strong>hash bcrypt</strong> e nunca em texto legível — nem quem opera a
          plataforma consegue lê-las.
        </p>

        <section aria-labelledby="compartilhamento">
          <h2
            id="compartilhamento"
            className="mt-14 text-2xl font-bold tracking-[-0.02em] text-navy"
          >
            Com quem compartilhamos
          </h2>
          <p className="mt-4 leading-relaxed text-navy/65">
            Para funcionar, o VesteAí depende dos serviços abaixo. Cada um recebe só o
            que a própria tarefa exige:
          </p>
          <dl className="mt-6 space-y-5">
            {COMPARTILHAMENTO.map((item) => (
              <div key={item.servico}>
                <dt className="font-semibold text-navy">{item.servico}</dt>
                <dd className="mt-1 leading-relaxed text-navy/65">{item.uso}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-6 leading-relaxed text-navy/65">
            Ao seguir um link de compra, você sai do VesteAí e vai para o site da loja; a
            partir dali vale a política de privacidade dela.
          </p>
        </section>

        <h2 className="mt-14 text-2xl font-bold tracking-[-0.02em] text-navy">
          Seus direitos
        </h2>
        <p className="mt-4 leading-relaxed text-navy/65">
          A LGPD garante a você, a qualquer momento, o direito de acessar,
          corrigir e excluir seus dados, além de revogar consentimento e
          solicitar a portabilidade.
        </p>
        <ul className="mt-5 space-y-3 leading-relaxed text-navy/65">
          <li>
            <strong className="text-navy">Corrigir</strong> nome e bio,{" "}
            <strong className="text-navy">baixar</strong> uma cópia dos seus dados ou{" "}
            <strong className="text-navy">excluir</strong> a conta: nas configurações da
            sua conta, sem depender de ninguém e sem prazo de espera.
          </li>
          <li>
            Se você <strong className="text-navy">perdeu acesso</strong> à conta e ainda
            assim quer exercer esses direitos, use o contato abaixo.
          </li>
        </ul>
        <p className="mt-5 leading-relaxed text-navy/65">
          Se você perdeu o acesso à conta, ou quer falar com quem responde pelos dados,
          use o formulário abaixo. Respondemos em até{" "}
          <strong className="text-navy">15 dias corridos</strong>, conforme a LGPD.
        </p>

        <div id="contato">
          <ContatoForm />
        </div>

        <h2 className="mt-14 text-2xl font-bold tracking-[-0.02em] text-navy">
          Retenção
        </h2>
        <p className="mt-4 leading-relaxed text-navy/65">
          Os dados da conta são mantidos enquanto ela existir; depois da exclusão, são
          removidos. O que você envia pelo formulário desta página fica guardado
          apenas na caixa de quem responde, pelo tempo necessário para atender ao
          pedido e comprovar que ele foi atendido — não entra no banco da
          plataforma nem se liga à sua conta. O clique num link de compra é contado
          sem guardar quem clicou. Esta página descreve o tratamento que a
          plataforma faz hoje e é atualizada quando ele muda.
        </p>

        <h2 className="mt-14 text-2xl font-bold tracking-[-0.02em] text-navy">
          Cookies
        </h2>
        <p className="mt-4 leading-relaxed text-navy/65">
          O VesteAí usa um único cookie, estritamente necessário para manter
          você autenticado depois do login. Não há cookie de publicidade, de
          rastreamento de terceiros nem de analytics — por isso não existe
          banner de consentimento: cookie estritamente necessário não depende de
          consentimento prévio.
        </p>

        <p className="mt-16 border-t border-navy/10 pt-8 text-sm text-navy/65">
          Última atualização em novembro de 2026.
        </p>
      </main>
    </>
  );
}
