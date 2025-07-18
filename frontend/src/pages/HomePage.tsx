import React, { useState } from "react";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/Slugtistics/app-sidebar";
import GradesPage from "@/pages/Grades";
import ComparePage from "@/pages/Compare";

export default function Dashboard() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentPage, setCurrentPage] = useState("grades");

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "grades":
        return (
          <GradesPage isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
        );
      case "compare":
        return (
          <ComparePage isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
        );
      default:
        return (
          <GradesPage isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
        );
    }
  };

  return (
    <div className={` ${isDarkMode ? "dark" : ""}`}>
      <div className="flex bg-background">
        <div className="flex-1 flex flex-col overflow-hidden">
          <SidebarProvider>
            <AppSidebar
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
            <SidebarInset>{renderCurrentPage()}</SidebarInset>
          </SidebarProvider>
        </div>
      </div>
    </div>
  );
}
