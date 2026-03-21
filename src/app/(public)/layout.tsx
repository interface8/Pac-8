export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen  bg-linear-to-br from-orange-50 via-yellow-50 to-white px-4 py-8">
      <div className="w-full ">{children}</div>
    </div>
  );
}
