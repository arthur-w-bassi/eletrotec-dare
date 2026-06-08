export function ServicesEmptyState(): React.ReactElement {
  return (
    <div className="flex flex-col items-center justify-center gap-[0.75rem] px-[1.5rem] py-[2.5rem] text-center">
      <svg
        width="120"
        height="80"
        viewBox="0 0 120 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
        className="text-zinc-300"
      >
        <rect x="8" y="12" width="48" height="56" rx="4" stroke="currentColor" strokeWidth="1.5" />
        <rect x="64" y="20" width="48" height="48" rx="4" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" />
        <path d="M20 28h24M20 36h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M76 36l8 8 16-16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <p className="max-w-[16rem] text-[0.8125rem] leading-[1.375rem] text-zinc-500">
        Arraste serviços do painel esquerdo para começar a montar sua proposta
      </p>
    </div>
  );
}
