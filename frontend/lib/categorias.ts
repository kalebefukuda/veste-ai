import { Briefcase, Dumbbell, Martini, PartyPopper, Shirt, Sun } from "lucide-react";

// Um eixo só, de ocasião — não dois com estação junto. Praia já carrega verão dentro,
// festa já carrega noite, e dois campos dobrariam o atrito de quem monta o look.
// Valor em inglês porque é nome de domínio; rótulo em português porque é tela.
export const CATEGORIAS = [
  { valor: "work", rotulo: "Trabalho", Icone: Briefcase },
  { valor: "casual", rotulo: "Dia a dia", Icone: Shirt },
  { valor: "social", rotulo: "Social", Icone: Martini },
  { valor: "party", rotulo: "Festa", Icone: PartyPopper },
  { valor: "beach", rotulo: "Praia", Icone: Sun },
  { valor: "sport", rotulo: "Esporte", Icone: Dumbbell },
] as const;

export type Categoria = (typeof CATEGORIAS)[number]["valor"];

export function acharCategoria(valor: string | null | undefined) {
  return CATEGORIAS.find((c) => c.valor === valor) ?? null;
}
