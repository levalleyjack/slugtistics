import { motion } from "framer-motion";
import { ChevronDown, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

interface SectionTabsProps {
  sections: string[];
  selectedSection: string;
  onSelectSection: (section: string) => void;
  isMobileView: boolean;
}

export const SectionTabs = ({
  sections,
  selectedSection,
  onSelectSection,
  isMobileView,
}: SectionTabsProps) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Desktop tabs
  if (!isMobileView) {
    return (
      <div className="relative flex space-x-4 sm:space-x-6 border-b border-border mb-4 sm:mb-6">
        {sections.map((section) => (
          <button
            key={section}
            className={`relative px-2 sm:px-4 py-2 font-medium transition-colors cursor-pointer text-sm ${
              selectedSection === section
                ? "text-primary"
                : "text-muted-foreground hover:text-primary"
            }`}
            onClick={() => onSelectSection(section)}
          >
            {section}
            {selectedSection === section && (
              <motion.span
                layoutId="tab-underline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>
    );
  }

  // Mobile selector
  return (
    <div className="flex justify-between items-center mb-4">
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72">
          <div className="mt-6 space-y-1">
            {sections.map((section) => (
              <div
                key={section}
                className={`px-4 py-3 rounded-md cursor-pointer ${
                  selectedSection === section
                    ? "bg-primary text-white"
                    : "hover:bg-gray-100"
                }`}
                onClick={() => {
                  onSelectSection(section);
                  setIsSheetOpen(false);
                }}
              >
                {section}
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>
      <div className="px-2 py-1 bg-muted/30 rounded-md text-sm">
        Section: <span className="font-medium">{selectedSection}</span>
      </div>
    </div>
  );
};