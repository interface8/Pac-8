import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import { getCurrentUser } from "@/lib/auth";
import { AuthProvider } from "@/components/providers/auth-provider";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <AuthProvider user={user}>
      <div className="min-h-screen bg-background flex flex-col">
        <Header user={user ? { name: user.name, email: user.email, roles: user.roles } : null} />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </AuthProvider>
  );
}
