import React, { useState } from "react";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/Slugtistics/app-sidebar";
import GradesPage from "@/pages/slugtistics/Grades";
import SchedulePage from "@/pages/slugtistics/Schedule";
import DepartmentGradeDashboard from "./Department";
import { useTheme } from "next-themes";

export default function Dashboard() {
  const [currentPage, setCurrentPage] = useState("grades");

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "grades":
        return <GradesPage />;
      case "department":
        return <DepartmentGradeDashboard />;
      default:
        return <GradesPage />;
    }
  };

  return (
    <div className="flex-1 bg-background">
      <div className="flex-1 flex flex-col overflow-hidden">
        <SidebarProvider>
          <AppSidebar currentPage={currentPage} onPageChange={setCurrentPage} />
          <SidebarInset>{renderCurrentPage()}</SidebarInset>
        </SidebarProvider>
      </div>
    </div>
  );
}
