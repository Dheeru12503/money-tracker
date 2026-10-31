import { Sidebar } from "@/components/Sidebar";
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Sidebar admin />
      <main className="min-h-screen bg-[#f7f8fc] lg:ml-64">{children}</main>
    </>
  );
}
