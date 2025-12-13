import React from "react";
import GradesPage from "@/pages/slugtistics/Grades";

export default function Dashboard() {
  return (
    <div className="flex-1 bg-background">
      <div className="flex-1 flex flex-col overflow-hidden">
        <GradesPage />
      </div>
    </div>
  );
}
