export function FooterSection(): React.ReactElement {
  return (
    <footer className="mt-[2.5rem] border-t border-zinc-200 pt-[1.5rem]">
      <div className="flex flex-col gap-[1.25rem] sm:flex-row sm:items-start sm:justify-between sm:gap-[2.5rem]">
        <div className="relative min-w-0 flex-1 pl-[0.875rem]">
          <div
            className="absolute bottom-0 left-0 top-0 w-[0.125rem] rounded-full bg-[var(--eletrotec-orange)]/50"
            aria-hidden
          />

          <p className="text-[0.75rem] font-medium leading-snug text-zinc-700">
            5 anos de garantia do serviço
          </p>

          <div className="mt-[0.5rem] flex flex-col gap-[0.125rem] text-[0.6875rem] leading-[1.25rem] text-zinc-500">
            <p>Técnico em Eletrotécnica · SATC</p>
            <p>Graduando em Engenharia Mecânica</p>
          </div>
        </div>

        <div className="shrink-0 sm:pt-[0.125rem] sm:text-right">
          <p className="text-[0.6875rem] text-zinc-400">Avalie o nosso Instagram</p>
          <p className="mt-[0.125rem] text-[0.75rem] font-semibold tracking-wide text-[var(--eletrotec-orange)]">
            @eletrrotec
          </p>
        </div>
      </div>
    </footer>
  );
}
