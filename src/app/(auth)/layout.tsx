export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactElement {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-[1.5rem]">
      <div className="w-full max-w-[22rem]">{children}</div>
    </div>
  );
}
