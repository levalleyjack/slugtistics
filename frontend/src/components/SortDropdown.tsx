import React from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { SortAsc, CheckCircle2, ArrowUpDown } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SortDropdownProps {
  sortBy: string;
  onSortBy: (value: SortDropdownProps["sortBy"]) => void;
}

export const SortDropdown: React.FC<SortDropdownProps> = ({
  sortBy,
  onSortBy,
}) => {
  const options = [
    { label: "Default", value: "DEFAULT" },
    { label: "GPA", value: "GPA" },
    { label: "Teacher Rating", value: "INSTRUCTOR" },
    { label: "Alphabetical", value: "ALPHANUMERIC" },
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="w-9 h-9 bg-white border border-slate-200 hover:shadow-md transition-shadow"
          aria-label="Sort results"
        >
          <ArrowUpDown className="w-5 h-5 text-slate-600" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-44 p-4 bg-white border border-slate-200 shadow-lg rounded-xl"
        asChild
      >
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.15 }}
        >
          <h4 className="text-sm font-semibold text-slate-900 mb-3">Sort By</h4>
          <div className="flex flex-col space-y-1">
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onSortBy(opt.value as any)}
                className={cn(
                  "flex items-center justify-between w-full px-3 py-2 text-sm rounded-md transition-colors cursor-pointer",
                  sortBy === opt.value
                    ? "bg-blue-600 text-white"
                    : "text-slate-700 hover:bg-slate-50"
                )}
              >
                <span>{opt.label}</span>
                {sortBy === opt.value && (
                  <CheckCircle2 className="w-4 h-4 text-white" />
                )}
              </button>
            ))}
          </div>
        </motion.div>
      </PopoverContent>
    </Popover>
  );
};
