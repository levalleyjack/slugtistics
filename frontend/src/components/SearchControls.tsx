// Modified SearchControls component with Favorites button
import React, { useState } from "react";
import GlobalSearch from "./GlobalSearchDropdownList";
import FilterDropdown from "./FilterDropdown";
import { SearchControlsProps } from "../Constants";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  ArrowDown,
  ArrowUp,
  Clock,
  Flower,
  Heart,
  Info,
  Leaf,
  PanelLeft,
  Trash,
} from "lucide-react";
import { Badge, Tooltip } from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import { SortDropdown } from "./SortDropdown";

export const SearchControls: React.FC<SearchControlsProps> = ({
  scrollDirection,
  lastUpdated,
  handleGlobalCourseSelect,
  courses,
  selectedGE,
  codes,
  GEs,
  sortBy,
  setSortBy,
  selectedClassTypes,
  setSelectedClassTypes,
  selectedSubjects,
  setSelectedSubjects,
  selectedEnrollmentStatuses,
  setSelectedEnrollmentStatuses,
  selectedGEs,
  setSelectedGEs,
  selectedPrereqs,
  setSelectedPrereqs,
  selectedCareers,
  setSelectedCareers,
  scrollToSelectedCourse,
  setIsOpen,
  favoriteCoursesLength,
  compareMode,
  setCompareMode,
  handleDeleteAllFavorites,
}) => {
  const [infoOpen, setInfoOpen] = useState(false);

  return (
    <div className="p-4 py-3 grid grid-cols-[auto_1fr_auto] items-center gap-4">
      {/* LEFT: Sidebar + Search */}
      <div className="flex items-center gap-3 min-w-0">
        {setIsOpen && (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="p-2 rounded hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Open sidebar"
          >
            <PanelLeft className="w-5 h-5 text-gray-600" />
          </button>
        )}
        <GlobalSearch
          courses={courses}
          onCourseSelect={handleGlobalCourseSelect}
          selectedGE={selectedGE}
        />
      </div>

      {/* CENTER: GE Pill */}
      <div className="flex justify-center">
        <div className="text-xs text-muted-foreground bg-secondary px-3 py-1 rounded-full whitespace-nowrap">
          {compareMode
            ? "Favorites"
            : selectedGE !== "AnyGE"
            ? `GE: ${selectedGE}`
            : "All Courses"}
        </div>
      </div>

      {/* RIGHT: Buttons */}
      <div className="flex items-center gap-2 justify-end">
        <AnimatePresence>
          {scrollDirection !== "none" ? (
            <Tooltip title="Go back to selected course" disableInteractive>
              <motion.button
                key="scroll-btn"
                type="button"
                onClick={scrollToSelectedCourse}
                aria-label="Back to selected course"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="w-5 h-5 m-0 mr-1 flex items-center justify-center text-gray-500 hover:text-gray-600 transition-colors cursor-pointer"
              >
                {scrollDirection === "up" ? (
                  <ArrowUp className="w-4 h-4" />
                ) : (
                  <ArrowDown className="w-4 h-4" />
                )}
              </motion.button>
            </Tooltip>
          ) : (
            <div className="w-5 h-5 mr-1" />
          )}
        </AnimatePresence>
        {compareMode ? (
          <Tooltip title="Clear all favorites">
            <button
              type="button"
              aria-label="Clear all favorites"
              className="m-0 ml-1 w-5 h-5 flex items-center justify-center text-gray-500 hover:text-gray-600 transition-colors"
              onClick={handleDeleteAllFavorites}
            >
              <Trash className="w-4 h-4 cursor-pointer" />
            </button>
          </Tooltip>
        ) : (
          <Popover open={infoOpen} onOpenChange={setInfoOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                aria-label="Term & last update"
                className="m-0 ml-1 w-5 h-5 flex items-center justify-center text-gray-500 hover:text-gray-600 transition-colors"
              >
                <Info className="w-4 h-4 cursor-pointer" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              className="w-44 p-3 bg-white shadow-lg rounded-lg"
            >
              <div className="flex items-center text-sm text-gray-700 mb-2">
                <Clock className="w-4 h-4 mr-1" />
                {lastUpdated}
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <Leaf className="w-4 h-4 mr-1" />
                Fall 2025
              </div>
            </PopoverContent>
          </Popover>
        )}

        {/* Favorites Button */}
        <Badge
          badgeContent={favoriteCoursesLength > 0 ? favoriteCoursesLength : 0}
          color="primary"
          overlap="circular"
          invisible={favoriteCoursesLength < 1}
        >
          <button
            type="button"
            aria-label="Course favorites"
            onClick={() => {
              if (favoriteCoursesLength > 0) {
                setCompareMode(!compareMode);
              }
            }}
            className={`
    p-2 rounded transition-colors
    ${
      favoriteCoursesLength > 0
        ? "hover:bg-slate-100 cursor-pointer"
        : "opacity-50 pointer-events-none cursor-default"
    }
  `}
          >
            <Heart
              className="w-5 h-5 text-gray-600"
              fill={
                compareMode && favoriteCoursesLength > 0
                  ? "rgba(239, 68, 68, 0.5)"
                  : "transparent"
              }
            />
          </button>
        </Badge>

        <SortDropdown sortBy={sortBy} onSortBy={setSortBy} />

        <FilterDropdown
          codes={codes}
          GEs={GEs}
          sortBy={sortBy}
          onSortBy={setSortBy}
          selectedSubjects={selectedSubjects}
          onSelectedSubjectsChange={setSelectedSubjects}
          selectedClassTypes={selectedClassTypes}
          onClassTypesChange={setSelectedClassTypes}
          selectedEnrollmentStatuses={selectedEnrollmentStatuses}
          onEnrollmentStatusesChange={setSelectedEnrollmentStatuses}
          selectedGEs={selectedGEs}
          onSelectedGEs={setSelectedGEs}
          selectedPrereqs={selectedPrereqs}
          onSelectedPrereqsChange={setSelectedPrereqs}
          selectedCareers={selectedCareers}
          onSelectedCareersChange={setSelectedCareers}
        />
      </div>
    </div>
  );
};
