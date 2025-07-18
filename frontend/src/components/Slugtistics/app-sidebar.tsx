import * as React from "react";
import {
  BarChart3,
  GraduationCap,
  Settings,
  Users,
  TrendingUp,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

const sidebarItems = [
  { id: "overview", icon: BarChart3, label: "Overview", active: true },
  { id: "classes", icon: GraduationCap, label: "Compare" },
  /*
  { id: "instructors", icon: Users, label: "Instructors" },
  { id: "trends", icon: TrendingUp, label: "Trends" },
  { id: "settings", icon: Settings, label: "Settings" }, */
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader className="mt-20">
        <div className="p-4 ">
          <div className="flex items-center gap-2 mb-4  ">
            <GraduationCap className="h-8 w-12 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Slugtistics</h2>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <div className="px-4">
          <nav className="space-y-2 ">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  item.active
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
