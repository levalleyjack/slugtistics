import React from "react";
import { Box, IconButton, styled } from "@mui/material";
import { AnimatedArrowIcon, COLORS, SearchControlsProps } from "../Constants";
import GlobalSearch from "./GlobalSearchDropdownList";
import ExpandButton from "./ExpandButton";
import FilterDropdown from "./FilterDropdown";
import { fetchLastUpdate } from "../pages/FetchLastUpdate";

const HeaderContainer = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(2),
  justifyContent: "space-between",
  borderBottom: `1px solid ${theme.palette.divider}`,
  backgroundColor: COLORS.WHITE,
  flexWrap: "wrap",
  gap: theme.spacing(1),
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1),
    flexDirection: "column",
    alignItems: "stretch",
  },
}));

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

export const SearchControls: React.FC<SearchControlsProps> = ({
  isSmallScreen,
  isCategoryDrawer,
  handleCategoryToggle,
  isCategoriesVisible,
  courses,
  handleGlobalCourseSelect,
  selectedGE,
  isAllExpanded,
  handleExpandAll,
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
  const [lastUpdated, setLastUpdated] = React.useState<string>("None");
  fetchLastUpdate()
    .then((result) => setLastUpdated(result))
    .catch(() => setLastUpdated("Error loading update time"));
  return (
    <HeaderContainer>
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
          isSmallScreen={isSmallScreen}
        />
      </SearchSection>

      <ControlsContainer>
        <ExpandButton
          isExpanded={isAllExpanded}
          onToggle={handleExpandAll}
          fullWidth={isCategoryDrawer}
        />
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
