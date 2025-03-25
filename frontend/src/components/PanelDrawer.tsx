import React from "react";
import { Drawer, useTheme } from "@mui/material";
import { CourseDistribution } from "../pages/CourseDistribution";
import RatingsPanel from "./RatingsPanel";
import { CourseDetailsPanel } from "./CourseDetails";
import { PanelDrawerProps } from "../Constants";

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
      transitionDuration={{ enter: 200, exit: 200 }}
      sx={{
        width: activePanel ? (isSmallScreen ? "100%" : "min(400px, 90dvw)") : 0,
        flexShrink: 0,
        opacity: activePanel || isDistributionDrawer ? 1 : 0,

        transition: "width 0.2s, opacity 0.3s",
        "& .MuiDrawer-paper": {
          border: "none",

          width: isSmallScreen ? "100%" : "min(400px, 90dvw)",
          marginTop: "64px",
          height: "calc(100% - 64px)",
          boxSizing: "border-box",
          borderTopLeftRadius: { xs: 0, sm: "8px" },
          borderBottomLeftRadius: { xs: 0, sm: "8px" },
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
