import { Box, Card, Fade, Skeleton, styled } from "@mui/material";
import { LoadingSkeletonProps } from "../Constants";



const StyledCard = styled(Card)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,

  borderRadius: "8px",
  position: "relative",
  backgroundColor: theme.palette.background.paper,
  "& .MuiSkeleton-root": {
    backgroundColor:
      theme.palette.mode === "light"
        ? theme.palette.grey[200]
        : theme.palette.grey[800],
    "&::after": {
      background: `linear-gradient(90deg,
        transparent,
        ${
          theme.palette.mode === "light"
            ? "rgba(255,255,255,0.4)"
            : "rgba(255,255,255,0.1)"
        },
        transparent
      )`,
    },
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

const ItemWrapper = styled(Box)(({ theme }) => ({
  padding: "16px",
  boxSizing: "border-box",
  "&:last-child": {
    paddingBottom: "16px",
  },
  "&::-webkit-scrollbar": {
    width: theme.spacing(1),
    height: theme.spacing(1),
  },
  "&::-webkit-scrollbar-track": {
    backgroundColor: theme.palette.grey[100],
    borderRadius: theme.shape.borderRadius,
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: theme.palette.grey[400],
    borderRadius: theme.shape.borderRadius,
    "&:hover": {
      backgroundColor: theme.palette.grey[600],
    },
  },
  scrollbarWidth: "thin",
  scrollbarColor: `${theme.palette.grey[400]} ${theme.palette.grey[100]}`,
}));

export const LoadingCourseCard = ({
  isLastItem = false,
}: {
  isLastItem?: boolean;
}) => {
  return (
    <ItemWrapper sx={{ paddingBottom: isLastItem ? "16px" : 0 }}>
      <StyledCard elevation={2}>
        <Box sx={{ p: 2 }}>
          <HeaderContent>
            <CourseInfo>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
              >
                <Skeleton
                  variant="rounded"
                  width={120}
                  height={32}
                  sx={{ borderRadius: "8px" }}
                />
                <Skeleton
                  variant="rounded"
                  width={60}
                  height={28}
                  sx={{ borderRadius: "8px" }}
                />
                <Skeleton variant="circular" width={24} height={24} />
              </Box>

              <Skeleton variant="text" width="60%" height={32} sx={{ mb: 1 }} />

              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
              >
                <Skeleton variant="circular" width={18} height={18} />
                <Skeleton variant="text" width={180} height={24} />
              </Box>

              <Box sx={{ display: "flex", gap: 1 }}>
                <Skeleton
                  variant="rounded"
                  width={100}
                  height={26}
                  sx={{ borderRadius: "8px" }}
                />
                <Skeleton
                  variant="rounded"
                  width={120}
                  height={26}
                  sx={{ borderRadius: "8px" }}
                />
              </Box>
            </CourseInfo>

            <ActionContainer>
              <Skeleton
                variant="rounded"
                width={120}
                height={28}
                sx={{ borderRadius: "8px" }}
              />
              <Box sx={{ display: "flex", gap: 1 }}>
                {[1, 2].map((i) => (
                  <Skeleton
                    key={i}
                    variant="rounded"
                    width={32}
                    height={32}
                    sx={{ borderRadius: "8px" }}
                  />
                ))}
              </Box>
            </ActionContainer>
          </HeaderContent>
        </Box>
      </StyledCard>
    </ItemWrapper>
  );
};

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  courseCodes,
  filterBy,
}) => {
  const getSkeletonCount = () => {
    if (filterBy === "all") {
      const totalCount = courseCodes.reduce(
        (sum, course) => sum + course.courseCount,
        0
      );
      return Math.min(totalCount, 10);
    }
    const selectedCourse = courseCodes.find(
      (course) => course.courseName === filterBy
    );
    return selectedCourse ? Math.min(selectedCourse.courseCount, 10) : 0;
  };

  const skeletonCount = getSkeletonCount();

  return (
    <Box>
      {Array.from({ length: skeletonCount }).map((_, index) => (
        <Fade in key={index}>
          <Box>
            <LoadingCourseCard isLastItem={index === skeletonCount - 1} />
          </Box>
        </Fade>
      ))}
    </Box>
  );
};

export default LoadingSkeleton;
