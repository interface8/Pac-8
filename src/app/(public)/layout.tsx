import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import { getCurrentUser } from "@/lib/auth";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header user={user ? { name: user.name, email: user.email, roles: user.roles } : null} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
