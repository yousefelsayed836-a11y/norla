import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import AdminSidebar from "@/components/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#f7f3f4]">
      <AdminSidebar name={session.name} />
      <main className="flex-1 p-4 md:p-8 overflow-x-auto min-w-0">{children}</main>
    </div>
  );
}
