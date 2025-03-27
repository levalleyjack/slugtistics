import React from "react";
import {
  Box,
  IconButton,
  styled,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { AnimatedArrowIcon, COLORS, SearchControlsProps } from "../Constants";
import GlobalSearch from "./GlobalSearchDropdownList";
import ExpandButton from "./ExpandButton";
import FilterDropdown from "./FilterDropdown";
import { fetchLastUpdate } from "../pages/FetchLastUpdate";
import { useQuery } from "@tanstack/react-query";
import FilterVintageIcon from "@mui/icons-material/FilterVintage";
import zIndex from "@mui/material/styles/zIndex";

const HeaderContainer = styled("div")<{ isVisible: boolean }>(
  ({ theme, isVisible }) => ({
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(2),
    paddingTop: isVisible ? theme.spacing(2) : 0,
    paddingBottom: isVisible ? theme.spacing(2) : 0,

    justifyContent: "space-between",
    backgroundColor: COLORS.WHITE,
    flexWrap: "wrap",
    gap: theme.spacing(1),
    borderBottom: isVisible ? `1px solid ${theme.palette.divider}` : "none",

    /** Keep it sticky so it moves with layout changes **/
    position: "sticky",
    top: 0,
    width: "100%",
    boxSizing: "border-box",
    zIndex: 10,

    // Better transitions
    transform: isVisible ? "translateY(0)" : "translateY(-100%)",
    maxHeight: isVisible ? "69px" : "0",
    overflow: "hidden",
    opacity: isVisible ? 1 : 0,
    visibility: isVisible ? "visible" : "hidden",
    transition:
      "transform 0.3s ease, max-height 0.3s ease, opacity 0.3s ease, padding 0.3s ease, visibility 0.3s ease",

    [theme.breakpoints.down("sm")]: {
      padding: isVisible ? theme.spacing(1) : 0,
      flexDirection: "column",
      alignItems: "stretch",
      maxHeight: isVisible ? "97px" : "0",

      transition: "transform 0.25s ease-in-out",
    },
  })
);

const SearchSection = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  flex: 1,
  alignItems: "center",
  marginRight: theme.spacing(1),
  [theme.breakpoints.down("sm")]: {
    marginRight: theme.spacing(2),
  },
}));

const MenuButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: COLORS.WHITE,
  boxShadow: theme.shadows[2],
  marginRight: theme.spacing(1),
  "&:hover": {
    backgroundColor: COLORS.GRAY_50,
    transform: "translateY(-2px)",
    transition: "transform 0.2s ease-in-out",
  },
  transition: "transform 0.2s ease-in-out",
}));

const ControlsContainer = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(2),
  [theme.breakpoints.down("sm")]: {
    width: "100%",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: theme.spacing(1),
  },
}));
const MainContent = styled("main")<{ isVisible: boolean }>(({ isVisible }) => ({
  transition: "margin-top 0.3s ease",
  marginTop: isVisible ? 69 : 0, // Adjust content position based on header visibility
}));

export const SearchControls: React.FC<SearchControlsProps> = ({
  isCategoryDrawer,
  headerVisible,
  handleCategoryToggle,
  isCategoriesVisible,
  courses,
  handleGlobalCourseSelect,
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
}) => {
  const theme = useTheme();
  const { data: lastUpdated = "Loading..." } = useQuery({
    queryKey: ["lastUpdate"],
    queryFn: fetchLastUpdate,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <HeaderContainer isVisible={headerVisible}>
      <SearchSection>
        <MenuButton onClick={handleCategoryToggle}>
          <AnimatedArrowIcon
            isVisible={!isCategoryDrawer ? isCategoriesVisible : true}
            isSmallScreen={isCategoryDrawer}
          />
        </MenuButton>
        <GlobalSearch
          courses={courses}
          onCourseSelect={handleGlobalCourseSelect}
          selectedGE={selectedGE}
          lastUpdated={lastUpdated ?? "None"}
          disabled={!headerVisible}
        />
      </SearchSection>

      <ControlsContainer>
        
        <Box
          sx={{
            position: "relative",
            textTransform: "none",
            padding: theme.spacing(1),
            color: theme.palette.primary.main,
            backgroundColor: theme.palette.primary.light + "20",
            border: `1px solid ${theme.palette.primary.main}`,
            borderRadius: "8px",
            transition: "background-color 0.3s",
            cursor: "default",
            boxSizing: "border-box",
            maxHeight: "36px",
           
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FilterVintageIcon sx={{ fontSize: "large", mr: "8px" }} />
          <Typography variant="body2">Spring 2025</Typography>
        </Box>

        <FilterDropdown
          codes={codes}
          GEs={GEs}
          sortBy={sortBy}
          selectedGEs={selectedGEs}
          selectedSubjects={selectedSubjects}
          selectedClassTypes={selectedClassTypes}
          selectedCareers={selectedCareers}
          selectedPrereqs={selectedPrereqs}
          selectedEnrollmentStatuses={selectedEnrollmentStatuses}
          onSortBy={setSortBy}
          onClassTypesChange={setSelectedClassTypes}
          onSelectedSubjectsChange={setSelectedSubjects}
          onEnrollmentStatusesChange={setSelectedEnrollmentStatuses}
          onSelectedGEs={setSelectedGEs}
          onSelectedCareersChange={setSelectedCareers}
          onSelectedPrereqsChange={setSelectedPrereqs}
        />
      </ControlsContainer>
    </HeaderContainer>
  );
};
