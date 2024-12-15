import React from "react";
import { Drawer } from "@mui/material";
import { CourseDistribution } from "../pages/CourseDistribution";
import RatingsPanel from "./RatingsPanel";
import { CourseDetailsPanel } from "./CourseDetails";

interface PanelDrawerProps {
  activePanel: "distribution" | "ratings" | "courseDetails" | null;
  panelData: any;
  isDistributionDrawer: boolean;
  isSmallScreen: boolean;
  onClose: () => void;
}

export const PanelDrawer: React.FC<PanelDrawerProps> = ({
  activePanel,
  panelData,
  isDistributionDrawer,
  isSmallScreen,
  onClose,
}) => {
  return (
    <Drawer
      variant={isDistributionDrawer ? "temporary" : "persistent"}
      anchor="right"
      open={Boolean(activePanel)}
      onClose={onClose}
      sx={{
        width: activePanel ? (isSmallScreen ? "100%" : 400) : 0,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: isSmallScreen ? "100%" : 400,
          marginTop: "64px",
          height: "calc(100% - 64px)",
          boxSizing: "border-box",
          borderTopLeftRadius: "8px",
          borderBottomLeftRadius: "8px",
        },
      }}
    >
      {activePanel === "distribution" && panelData && (
        <CourseDistribution
          courseCode={panelData.courseCode}
          professorName={panelData.professorName}
          inPanel={true}
          onClose={onClose}
        />
      )}
      {activePanel === "ratings" && panelData && (
        <RatingsPanel
          professorName={panelData.professorName}
          currentClass={panelData.currentClass}
          courseCodes={panelData.courseCodes}
          onClose={onClose}
        />
      )}
      {activePanel === "courseDetails" && panelData && (
        <CourseDetailsPanel course={panelData} onClose={onClose} />
      )}
    </Drawer>
  );
};
