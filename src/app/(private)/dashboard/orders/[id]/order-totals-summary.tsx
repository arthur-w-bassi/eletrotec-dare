"use client";

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function formatMoney(value: string): string {
  const n = Number.parseFloat(value);
  if (Number.isNaN(n)) return "—";
  return money.format(n);
}

export function OrderTotalsSummary({
  subtotal,
  discount,
  total,
}: {
  subtotal: string;
  discount: string;
  total: string;
}): React.ReactElement {
  return (
    <dl className="grid gap-[0.5rem] rounded-[0.75rem] border border-zinc-200 p-[1rem] dark:border-zinc-800 sm:grid-cols-3">
      <div>
        <dt className="text-[0.75rem] font-medium uppercase tracking-wide text-zinc-500">Subtotal</dt>
        <dd className="mt-[0.125rem] text-[1rem] font-medium">{formatMoney(subtotal)}</dd>
      </div>
      <div>
        <dt className="text-[0.75rem] font-medium uppercase tracking-wide text-zinc-500">Desconto</dt>
        <dd className="mt-[0.125rem] text-[1rem]">{formatMoney(discount)}</dd>
      </div>
      <div>
        <dt className="text-[0.75rem] font-medium uppercase tracking-wide text-zinc-500">Total</dt>
        <dd className="mt-[0.125rem] text-[1.125rem] font-semibold">{formatMoney(total)}</dd>
      </div>
    </dl>
  );
}
