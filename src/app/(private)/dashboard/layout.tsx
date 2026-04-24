import { redirect } from "next/navigation";

import { getServerAuthUser } from "@/lib/auth/guards";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): Promise<React.ReactElement> {
  const user = await getServerAuthUser();
  if (!user) {
    redirect("/login");
  }
  return <>{children}</>;
}
