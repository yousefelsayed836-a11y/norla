import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import AdminSidebar from "@/components/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  return (
    <div className="flex min-h-screen bg-[#f7f3f4]">
      <AdminSidebar name={session.name} />
      <main className="flex-1 p-8 overflow-x-auto">{children}</main>
    </div>
  );
}
