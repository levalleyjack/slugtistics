import React, { useState, useMemo } from "react";
import {
  Modal,
  Box,
  Typography,
  IconButton,
  Card,
  CardContent,
  TextField,
  Select,
  MenuItem,
  Paper,
  Chip,
  Stack,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Grid,
  useTheme,
  useMediaQuery,
  Skeleton,
  Fade,
  CircularProgress,
  Rating as MuiRating,
} from "@mui/material";
import {
  ThumbUpOutlined,
  ThumbDownOutlined,
  School,
  Search,
  Close,
  LocalOffer,
  OutlinedFlag,
} from "@mui/icons-material";
import he from "he";
import { COLORS, Course, Rating } from "../Constants";
import { useQuery } from "@tanstack/react-query";
import RatingCard from "./RatingCard";
import { styled } from "@mui/material/styles";

interface CourseCode {
  courseCount: number;
  courseName: string;
}

interface RatingsModalProps {
  isOpen: boolean;
  onClose: (e: React.MouseEvent) => void;
  professorName: string;
  original_ratings?: Rating[];
  currentClass: string;
}

type SortOptions = "date" | "rating" | "difficulty_rating" | "likes";

const StyledModal = styled(Modal)({
  backdropFilter: "blur(5px)",
  backgroundColor: "rgba(0, 0, 0, 0.5)",
});

const ModalContent = styled(Paper)(({ theme }) => ({
  borderRadius: "8px",
  position: "relative",
  width: "100%",
  maxWidth: "56rem",
  maxHeight: "90dvh",
  display: "flex",
  flexDirection: "column",
  backgroundColor: theme.palette.background.default,
  boxShadow: theme.shadows[24],
  [theme.breakpoints.down("sm")]: {
    maxHeight: "100dvh",
    height: "100%",
    borderRadius: "8px",
    margin: theme.spacing(0.5),
  },
}));

const StatCard = styled(Card)(({ theme }) => ({
  borderRadius: "8px",
  height: "100%",
  transition: "transform 0.2s ease-in-out",
  "&:hover": {
    transform: "translateY(-2px)",
  },
  "& .MuiCardContent-root": {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing(1.5),
    textAlign: "center",
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(1),
    },
  },
}));

const ResponsiveStack = styled(Stack)(({ theme }) => ({
  [theme.breakpoints.down("sm")]: {
    flexDirection: "column",
    gap: theme.spacing(1),
  },
}));

const LoadingSkeleton = () => (
  <Stack spacing={1}>
    {[1, 2, 3].map((i) => (
      <Paper key={i} sx={{ p: 2, borderRadius: "8px" }}>
        <Stack spacing={1}>
          <Skeleton variant="rectangular" height={20} width="30%" />
          <Skeleton variant="rectangular" height={40} />
          <Skeleton variant="rectangular" height={24} width="40%" />
        </Stack>
      </Paper>
    ))}
  </Stack>
);

const calculateStats = (ratings: Rating[]) => {
  if (!ratings?.length)
    return { overall: "0", difficulty: "0", wouldTakeAgain: "0" };

  const validOverall = ratings.filter((r) => r.overall_rating !== undefined);
  const validDifficulty = ratings.filter(
    (r) => r.difficulty_rating !== undefined
  );
  const validTakeAgain = ratings.filter(
    (r) => r.would_take_again !== undefined
  );

  return {
    overall: validOverall.length
      ? (
          validOverall.reduce((acc, r) => acc + (r.overall_rating ?? 0), 0) /
          validOverall.length
        ).toFixed(1)
      : "0",
    difficulty: validDifficulty.length
      ? (
          validDifficulty.reduce(
            (acc, r) => acc + (r.difficulty_rating ?? 0),
            0
          ) / validDifficulty.length
        ).toFixed(1)
      : "0",
    wouldTakeAgain: validTakeAgain.length
      ? (
          (validTakeAgain.filter((r) => r.would_take_again).length /
            validTakeAgain.length) *
          100
        ).toFixed(1)
      : "0",
  };
};

export const RatingsModal: React.FC<RatingsModalProps> = ({
  isOpen,
  onClose,
  professorName,
  currentClass,
}) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [sortBy, setSortBy] = useState<SortOptions>("date");
  const [filterBy, setFilterBy] = useState<string>(
    !currentClass || currentClass === "all" ? "all" : currentClass
  );
  const [searchTerm, setSearchTerm] = useState<string>("");

  const {
    data: ratingDetails = { all_ratings: [], course_codes: [] },
    isLoading,
  } = useQuery({
    queryKey: ["reviews", professorName, filterBy],
    queryFn: async () => {
      const response = await fetch(
        `http://127.0.0.1:5001/instructor_ratings?instructor=${encodeURIComponent(
          professorName
        )}&course=${encodeURIComponent(filterBy === "all" ? "" : filterBy)}`
      );
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();

      if (
        filterBy === currentClass &&
        !data.course_codes.some(
          (course: CourseCode) => course.courseName === currentClass
        )
      ) {
        setFilterBy("all");
      }
      return data || { all_ratings: [], course_codes: [] };
    },
    enabled: isOpen,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { all_ratings: ratings = [], course_codes: courseCodes = [] } =
    ratingDetails as {
      all_ratings: Rating[];
      course_codes: CourseCode[];
    };
  const stats = calculateStats(ratings);

  const getRatingColor = (score: number): string => {
    if (score >= 4) return theme.palette.success.main;
    if (score >= 3) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const processedRatings = useMemo(() => {
    return (
      ratings
        ?.filter(
          (rating) =>
            rating.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            rating.class_name?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        ?.sort((a, b) => {
          switch (sortBy) {
            case "rating":
              return (b.overall_rating ?? 0) - (a.overall_rating ?? 0);
            case "difficulty_rating":
              return (b.difficulty_rating ?? 0) - (a.difficulty_rating ?? 0);
            case "likes":
              return (b.thumbs_up ?? 0) - (a.thumbs_up ?? 0);
            default:
              return (
                new Date(b.date ?? 0).getTime() -
                new Date(a.date ?? 0).getTime()
              );
          }
        }) ?? []
    );
  }, [ratings, searchTerm, sortBy]);

  const renderReviewCard = (rating: Rating, index: number) => (
    <Fade in={true} key={index} timeout={300}>
      <Paper sx={{ p: 2, borderRadius: "8px" }} elevation={2}>
        <Grid container spacing={1.5}>
          <Grid item xs={12}>
            <Box
              sx={{ display: "flex", justifyContent: "center", width: "100%" }}
            >
              <RatingCard
                overallRating={rating.overall_rating ?? 0}
                difficultyRating={rating.difficulty_rating ?? 0}
                getRatingColor={getRatingColor}
              />
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body2" sx={{ mb: 1.5 }}>
              {he.decode(rating.comment ?? "")}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 0.75,
                mb: 1.5,
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                {rating.is_online && (
                  <Chip
                    label="Online"
                    color="primary"
                    variant="outlined"
                    size="small"
                    sx={{ borderRadius: "4px", height: "20px" }}
                  />
                )}
                {rating.attendance_mandatory === "mandatory" && (
                  <Chip
                    label="Attendance Required"
                    color="secondary"
                    variant="outlined"
                    size="small"
                    sx={{ borderRadius: "4px", height: "20px" }}
                  />
                )}
                {(rating.textbook_use ?? 0) > 0 && (
                  <Chip
                    label="Textbooks Used"
                    color="success"
                    variant="outlined"
                    size="small"
                    sx={{ borderRadius: "4px", height: "20px" }}
                  />
                )}
                {rating.would_take_again && (
                  <Chip
                    label="Would Take Again"
                    color="info"
                    size="small"
                    variant="outlined"
                    sx={{ borderRadius: "4px", height: "20px" }}
                  />
                )}
              </Box>
            </Box>
            {rating.tags && (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                {rating.tags.split("--").map((tag, tagIndex) => (
                  <Chip
                    key={tagIndex}
                    label={tag}
                    size="small"
                    icon={<LocalOffer sx={{ fontSize: "0.875rem" }} />}
                    variant="filled"
                    sx={{
                      borderRadius: "4px",
                      height: "20px",
                      bgcolor: `${theme.palette.primary.main}15`,
                      color: "primary.main",
                      "& .MuiChip-icon": { color: "primary.main" },
                    }}
                  />
                ))}
              </Box>
            )}
          </Grid>
          <Grid item xs={12}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: isSmallScreen ? "wrap" : "nowrap",
                gap: 0.75,
                pt: 1.5,
                borderTop: 1,
                borderColor: "divider",
              }}
            >
              <Stack
                direction={isSmallScreen ? "column" : "row"}
                spacing={isSmallScreen ? 0.25 : 1.5}
                alignItems={isSmallScreen ? "flex-start" : "center"}
              >
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <School
                    sx={{ fontSize: "0.875rem", color: "text.secondary" }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {rating.class_name}
                  </Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  {new Date(rating.date ?? new Date()).toLocaleDateString(
                    undefined,
                    { year: "numeric", month: "short", day: "numeric" }
                  )}
                </Typography>
              </Stack>
              {rating.flag_status && rating.flag_status !== "UNFLAGGED" && (
                <Chip
                  icon={<OutlinedFlag sx={{ fontSize: "0.875rem" }} />}
                  color="error"
                  size="small"
                  label="Flagged"
                  sx={{
                    ml: "auto",
                    borderRadius: "4px",
                    height: "20px",
                    "& .MuiChip-icon": { color: "inherit" },
                  }}
                />
              )}
              <Stack direction="row" spacing={1.5} sx={{ ml: "auto" }}>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <ThumbUpOutlined color="success" sx={{ fontSize: "1rem" }} />
                  <Typography variant="caption" color="text.secondary">
                    {rating.thumbs_up ?? 0}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <ThumbDownOutlined color="error" sx={{ fontSize: "1rem" }} />
                  <Typography variant="caption" color="text.secondary">
                    {rating.thumbs_down ?? 0}
                  </Typography>
                </Stack>
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Fade>
  );

  return (
    <StyledModal
      open={isOpen}
      onClose={onClose}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: theme.spacing(1),
      }}
    >
      <Fade in={isOpen} appear={true} timeout={{ enter: 300, exit: 0 }}>
        <ModalContent>
          <Box
            sx={{
              p: isSmallScreen ? 1.5 : 2,
              borderBottom: 1,
              borderColor: "divider",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box>
                <Typography
                  variant={isSmallScreen ? "subtitle1" : "h6"}
                  fontWeight="bold"
                >
                  {professorName}'s Ratings
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {isLoading ? (
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <CircularProgress size={12} />
                      <span>Loading ratings...</span>
                    </Stack>
                  ) : (
                    `${ratings?.length ?? 0} reviews`
                  )}
                </Typography>
              </Box>
              <IconButton
                onClick={onClose}
                size="small"
                sx={{ borderRadius: "6px" }}
              >
                <Close fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          <Box
            sx={{ flexGrow: 1, overflow: "auto", p: isSmallScreen ? 1.5 : 2 }}
          >
            <Grid container spacing={1.5} sx={{ mb: 2 }}>
              <Grid item xs={12} md={4}>
                <StatCard
                  elevation={2}
                  sx={{ background: COLORS.GRAY_50, mb: 1.5 }}
                >
                  <CardContent>
                    <Typography
                      variant="h5"
                      color={getRatingColor(Number(stats.overall))}
                      fontWeight="bold"
                      sx={{ lineHeight: 1 }}
                    >
                      {isLoading ? <Skeleton width={40} /> : stats.overall}
                    </Typography>
                    <MuiRating
                      value={Number(stats.overall)}
                      precision={0.1}
                      readOnly
                      size="small"
                      sx={{ my: 0.5 }}
                    />
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight="medium"
                    >
                      Average Rating
                    </Typography>
                  </CardContent>
                </StatCard>
              </Grid>
              <Grid item xs={12} md={4}>
                <StatCard
                  elevation={2}
                  sx={{ background: COLORS.GRAY_50, mb: 1.5 }}
                >
                  <CardContent>
                    <Typography
                      variant="h5"
                      color={getRatingColor(
                        Math.abs(Number(stats.difficulty) - 7)
                      )}
                      fontWeight="bold"
                      sx={{ lineHeight: 1 }}
                    >
                      {isLoading ? <Skeleton width={40} /> : stats.difficulty}
                    </Typography>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight="medium"
                    >
                      Average Difficulty
                    </Typography>
                  </CardContent>
                </StatCard>
              </Grid>
              <Grid item xs={12} md={4}>
                <StatCard
                  elevation={2}
                  sx={{ background: COLORS.GRAY_50, mb: 1.5 }}
                >
                  <CardContent>
                    <Typography
                      variant="h5"
                      color={getRatingColor(
                        Math.ceil(Number(stats.wouldTakeAgain) / 20)
                      )}
                      fontWeight="bold"
                      sx={{ lineHeight: 1 }}
                    >
                      {isLoading ? (
                        <Skeleton width={40} />
                      ) : (
                        `${stats.wouldTakeAgain}%`
                      )}
                    </Typography>
                    <Box sx={{ my: 0.5 }}>
                      <CircularProgress
                        variant="determinate"
                        value={Number(stats.wouldTakeAgain)}
                        size={32}
                        thickness={4}
                        sx={{ color: "success.main" }}
                      />
                    </Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight="medium"
                    >
                      Would Take Again
                    </Typography>
                  </CardContent>
                </StatCard>
              </Grid>
            </Grid>

            <Paper sx={{ p: 2, mb: 2, borderRadius: "8px" }} elevation={2}>
              <Grid container spacing={1.5}>
                <Grid item xs={12} md={6}>
                  <TextField
                    size="small"
                    fullWidth
                    placeholder="Search reviews..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <Search
                          sx={{
                            mr: 1,
                            color: "text.secondary",
                            fontSize: "1.25rem",
                          }}
                        />
                      ),
                      sx: { borderRadius: "8px" },
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <ResponsiveStack
                    direction="row"
                    spacing={isSmallScreen ? 0 : 1.5}
                  >
                    <FormControl fullWidth size="small">
                      <InputLabel>Sort By</InputLabel>
                      <Select
                        value={sortBy}
                        onChange={(e: SelectChangeEvent<SortOptions>) =>
                          setSortBy(e.target.value as SortOptions)
                        }
                        label="Sort By"
                        sx={{ borderRadius: "8px" }}
                      >
                        <MenuItem value="date">Recent</MenuItem>
                        <MenuItem value="likes">Most Likes</MenuItem>
                        <MenuItem value="rating">Highest Rating</MenuItem>
                        <MenuItem value="difficulty_rating">
                          Highest Difficulty
                        </MenuItem>
                      </Select>
                    </FormControl>
                    <FormControl fullWidth size="small">
                      <InputLabel>Filter By Course</InputLabel>
                      <Select
                        value={filterBy}
                        onChange={(e: SelectChangeEvent<string>) =>
                          setFilterBy(e.target.value)
                        }
                        label="Filter By Course"
                        sx={{ borderRadius: "8px" }}
                        MenuProps={{
                          PaperProps: {
                            style: {
                              maxHeight: 250,
                              overflowY: "auto",
                            },
                          },
                          anchorOrigin: {
                            vertical: "bottom",
                            horizontal: "left",
                          },
                          transformOrigin: {
                            vertical: "top",
                            horizontal: "left",
                          },
                        }}
                      >
                        <MenuItem value="all">All Courses</MenuItem>
                        {courseCodes.map((course: CourseCode) => (
                          <MenuItem
                            key={course.courseName}
                            value={course.courseName}
                          >
                            {course.courseName} ({course.courseCount})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </ResponsiveStack>
                </Grid>
              </Grid>
            </Paper>

            <Stack spacing={1.5}>
              {isLoading ? (
                <LoadingSkeleton />
              ) : processedRatings?.length === 0 ? (
                <Paper
                  sx={{ p: 3, textAlign: "center", borderRadius: "8px" }}
                  elevation={2}
                >
                  <Typography
                    variant="subtitle1"
                    color="text.secondary"
                    gutterBottom
                  >
                    No Reviews Found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Try adjusting your search criteria
                  </Typography>
                </Paper>
              ) : (
                <>
                  {processedRatings.map((rating, index) =>
                    renderReviewCard(rating, index)
                  )}
                  {processedRatings.length > 10 && (
                    <Box sx={{ textAlign: "center", py: 1.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        Showing all {processedRatings.length} reviews
                      </Typography>
                    </Box>
                  )}
                </>
              )}
            </Stack>
          </Box>
        </ModalContent>
      </Fade>
    </StyledModal>
  );
};

export default RatingsModal;
