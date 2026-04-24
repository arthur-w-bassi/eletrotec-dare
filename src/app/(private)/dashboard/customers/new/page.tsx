import Link from "next/link";

import { CustomerCreateForm } from "./customer-create-form";

export default function NewCustomerPage(): React.ReactElement {
  return (
    <div className="flex flex-col gap-[1rem]">
      <div className="flex flex-wrap items-center gap-[0.75rem]">
        <Link
          className="text-[0.875rem] text-zinc-500 underline hover:text-foreground"
          href="/dashboard/customers"
        >
          Voltar à lista
        </Link>
      </div>
      <h2 className="text-[1.125rem] font-semibold leading-[1.5rem]">Novo cliente</h2>
      <CustomerCreateForm />
    </div>
  );
}
