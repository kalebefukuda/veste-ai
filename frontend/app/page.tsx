import { redirect } from "next/navigation";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import Features from "@/components/sections/Features";
import HowItWorks from "@/components/sections/HowItWorks";
import Acesso from "@/components/sections/Acesso";
import Pricing from "@/components/sections/Pricing";
import Faq from "@/components/sections/Faq";
import CtaBanner from "@/components/sections/CtaBanner";

import { FEED } from "@/lib/routes";
import { readSession } from "@/lib/session";

export default function HomePage() {
  // Quem já tem sessão não precisa da página de venda: a casa dessa pessoa é a
  // vitrine. Só a presença do cookie basta — o feed sabe se virar com token velho.
  if (readSession()) redirect(FEED);

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Acesso />
        <Pricing />
        <Faq />
        <CtaBanner />
      </main>
      <Footer />
    </>
  );
}
