import React from "react";
import { Box } from "@mui/material";
import { ArrowRight, BookOpen, School, Search } from "lucide-react";
import { PanelData } from "../Constants";
import { CourseDetailsPanel } from "@/components/CourseDetails";
import RatingsPanel from "@/components/RatingsPanel";
import { CourseDistribution } from "@/components/CourseDistribution";

interface CoursePanelProps {
  activePanel: "distribution" | "ratings" | "courseDetails" | null;
  panelData: PanelData | null;
}

const CoursePanel: React.FC<CoursePanelProps> = ({ activePanel, panelData }) => {
  return (
    <Box
      component="aside"
      className="virtuoso-wrapper"
      sx={{
        position: "sticky",
        top: "4px",
        alignSelf: "flex-start",
        width: { xs: "100%", md: "800px" },
        flexShrink: 1,
        height: "calc(100vh - 72px)",
        overflowY: "auto",
        border: "1px solid",
        borderColor: "divider",
        transition: "width 0.3s ease",
        borderRadius: "8px",
        backgroundColor: "background.paper",
        alignContent: "center",
        mr:"4px"
      }}
    >
     {!activePanel && (
        <div className="h-full w-full flex flex-col justify-center items-center p-8">
          {/* Subtle illustration */}
          <div className="mb-10 relative">
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-100">
              <rect x="18" y="30" width="84" height="60" rx="4" stroke="currentColor" strokeWidth="2" />
              <path d="M30 50H90" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M30 65H70" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M30 80H60" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <School className="h-8 w-8 text-gray-300" />
            </div>
          </div>
          
          <h2 className="text-xl font-medium text-gray-700 mb-2">
            Select a course
          </h2>
          
          <p className="text-sm text-gray-400 mb-8 max-w-xs text-center">
            Course information will appear here
          </p>

          <div className="w-full max-w-xs flex justify-center">
            <div className="inline-flex items-center gap-2 text-sm text-gray-400 border-b border-gray-200 pb-1 px-1">
              <ArrowRight className="h-3.5 w-3.5" />
              <span>Browse courses in the left</span>
            </div>
          </div>
        </div>
      )}
      {/* Distribution panel */}
      {activePanel === "distribution" && panelData && (
        <div className="h-full w-full">
          <CourseDistribution
            courseCode={panelData.courseCode}
            professorName={panelData.professorName}
            inPanel
          />
        </div>
      )}

      {/* Ratings panel */}
      {activePanel === "ratings" && panelData && (
        <div className="h-full w-full">
          <RatingsPanel
            professorName={panelData.professorName}
            currentClass={panelData.currentClass}
            courseCodes={panelData.courseCodes}
          />
        </div>
      )}

      {/* Course details panel */}
      {activePanel === "courseDetails" && panelData && (
        <div className="h-full w-full">
          <CourseDetailsPanel course={panelData} />
        </div>
      )}
    </Box>
  );
};

export default CoursePanel;
