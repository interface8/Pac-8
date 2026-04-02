import { redirect } from "next/navigation";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import { getCurrentUser } from "@/lib/auth";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?callbackUrl=/account");
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header user={{ name: user.name, email: user.email, roles: user.roles }} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
