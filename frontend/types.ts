export interface NavLink {
  label: string;
  href: string;
}

export interface OnboardingStep {
  number: string;
  title: string;
  description: string;
}

export interface PricingPlan {
  name: string;
  price: string;
  period: string;
  highlight: boolean;
  badge?: string;
  features: string[];
  cta: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FooterLinkGroup {
  title: string;
  links: NavLink[];
}

export type PassoDoFluxo = {
  numero: string;
  titulo: string;
  descricao: string;
};
