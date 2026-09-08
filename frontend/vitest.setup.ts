import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// Sem globals, o Testing Library não registra a limpeza sozinho e as
// renderizações se acumulam entre testes.
afterEach(cleanup);

// O jsdom não implementa IntersectionObserver, e sem ele qualquer seção com
// `useScrollReveal` quebra na montagem antes do teste chegar a asserir.
vi.stubGlobal(
  "IntersectionObserver",
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  },
);

// O jsdom não implementa scrollTo em elemento; o carrossel do FAQ o chama para
// manter o card ativo à vista.
Element.prototype.scrollTo = () => {};

// Nem matchMedia, consultado para não animar quando o sistema pede menos movimento.
vi.stubGlobal("matchMedia", (query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addEventListener: () => {},
  removeEventListener: () => {},
  addListener: () => {},
  removeListener: () => {},
  dispatchEvent: () => false,
}));
