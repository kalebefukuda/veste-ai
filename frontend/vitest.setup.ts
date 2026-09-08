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
