export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 via-yellow-50 to-white px-4 py-8">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
