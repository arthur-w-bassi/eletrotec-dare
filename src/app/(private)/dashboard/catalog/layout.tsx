import Link from "next/link";

export default function CatalogLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactElement {
  return (
    <div className="mx-auto flex w-full max-w-[56rem] flex-1 flex-col gap-[1.25rem] p-[1.5rem]">
      <div className="flex flex-wrap items-center justify-between gap-[0.75rem]">
        <div className="flex flex-wrap items-center gap-[0.75rem]">
          <h1 className="text-[1.375rem] font-semibold leading-[1.75rem]">Catálogo</h1>
          <Link
            className="text-[0.875rem] text-zinc-500 underline hover:text-foreground"
            href="/dashboard"
          >
            Painel
          </Link>
        </div>
      </div>
      {children}
    </div>
  );
}
