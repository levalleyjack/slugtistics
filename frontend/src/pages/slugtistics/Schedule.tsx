import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface ComparePageProps {
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
}

export default function ComparePage({
  isDarkMode,
  setIsDarkMode,
}: ComparePageProps) {
  return (
    <>
      <header className="bg-card border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="text-foreground" />
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Grade Distribution Overview
              </h2>
              <p className="text-muted-foreground">
                Analyze and compare course performance across different
                instructors and terms
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDarkMode(!isDarkMode)}
            >
              {isDarkMode ? (
                <Sun className="h-4 w-4 text-foreground" />
              ) : (
                <Moon className="h-4 w-4 text-foreground" />
              )}
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 p-6 flex flex-col overflow-y-auto">
        <div className="space-y-6 flex-1 flex flex-col">
          <Card>
            <CardHeader>
              <CardTitle>Scheduler</CardTitle>
              <CardDescription>Coming Soon</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="min-h-[400px] flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <h3 className="text-lg font-semibold mb-2">Scheduler Page</h3>
                  <p>This page will contain a scheduler</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
