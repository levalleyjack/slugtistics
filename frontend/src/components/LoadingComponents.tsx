import { forwardRef } from "react";
import { styled } from "@mui/material/styles";
import { Card, CardContent, Box, Skeleton } from "@mui/material";
import { LoadingSkeletonProps } from "../Constants";

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: "8px",
  boxSizing: "border-box",
  position: "relative",
  transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
    "& .MuiChip-clickable": {
      transform: "translateY(-1px)",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    },
  },
  ".MuiCardActionArea-focusHighlight": {
    background: "transparent",
  },
}));

const HeaderContent = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
  gap: theme.spacing(2),
}));

const CourseInfo = styled(Box)({
  flex: 1,
  minWidth: 0,
});

const ActionContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  flexShrink: 0,
}));

export const LoadingCourseCard = forwardRef<
  HTMLDivElement,
  { isSmallScreen?: boolean }
>(({ isSmallScreen = false }, ref) => {
  return (
    <StyledCard elevation={0} ref={ref} sx={{ cursor: "default", border:"none"}}>
      <CardContent sx={{ pb: 1, "&:last-child": { pb: 1 } }}>
        <HeaderContent>
          <CourseInfo>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Skeleton width={85} height={28} sx={{ borderRadius: "8px" }} />
              <Skeleton width={20} height={28} sx={{ borderRadius: "8px" }} />
              <Skeleton width={12} height={12} sx={{ borderRadius: "8px" }} />
            </Box>

            <Skeleton width="45%" height={32} />

            <Box
              sx={{ display: "flex", alignItems: "center", gap: 0.5, my: 1 }}
            >
              <Skeleton width={18} height={18} sx={{ mr: 0.5 }} />
              <Skeleton width="30%" height={24} />
              <Skeleton width={90} height={24} sx={{ borderRadius: "8px" }} />

            </Box>

            <Box sx={{ display: "flex", gap: 1, alignItems: "center", mt: 1 }}>
              <Skeleton width={70} height={24} sx={{ borderRadius: "8px" }} />
              <Skeleton width={100} height={24} sx={{ borderRadius: "8px" }} />
             
             
            </Box>
          </CourseInfo>

          <ActionContainer>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                justifyContent: "space-between",
                height: 130,
              }}
            >
              <Box sx={{ display: "flex" }}>
                <Skeleton width={24} height={24} sx={{ mr: 1 }} />
                <Skeleton width={24} height={24} />
              </Box>

              <Skeleton width={60} height={24} sx={{ borderRadius: "8px" }} />

              <Skeleton width={40} height={16} />
            </Box>
          </ActionContainer>
        </HeaderContent>
      </CardContent>
    </StyledCard>
  );
});

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  courseCodes,
  filterBy,
}) => {
  const getSkeletonCount = () => {
    if (filterBy === "all") {
      const totalCount = courseCodes?.reduce(
        (sum, course) => sum + (course?.courseCount || 0),
        0
      );
      return Math.min(totalCount || 5, 10);
    }
    const selectedCourse = courseCodes?.find(
      (course) => course.courseName === filterBy
    );
    return selectedCourse ? Math.min(selectedCourse.courseCount, 10) : 0;
  };

  const skeletonCount = getSkeletonCount();

  return (
    <Box>
      {Array.from({ length: skeletonCount || 5 }).map((_, index) => (
        <Box key={index} sx={{ mb: 2 }}>
          <LoadingCourseCard />
        </Box>
      ))}
    </Box>
  );
};

export default LoadingSkeleton;
