import { Header } from "@/components/layout/Header";
import DashboardPage from "@/components/dashboard/DashboardPage";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <DashboardPage />
      </main>
      <footer className="text-center p-4 text-sm text-muted-foreground border-t">
        © {new Date().getFullYear()} RupeeTrack. All rights reserved.
      </footer>
    </div>
  );
}
