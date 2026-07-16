export default function Footer() {
  return (
    <footer className="border-t border-navy/10 py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-sm text-navy/50 sm:flex-row">
        <div className="flex items-center font-semibold text-navy">
          <span>Veste</span>
          <span className="text-purple">Aí</span>
        </div>
        <div className="flex flex-wrap justify-center gap-5">
          <a href="#" className="hover:text-purple">
            Termos de Uso
          </a>
          <a href="#" className="hover:text-purple">
            Privacidade
          </a>
          <a href="#" className="hover:text-purple">
            Contato
          </a>
        </div>
        <p>&copy; {new Date().getFullYear()} VesteAí. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
}
