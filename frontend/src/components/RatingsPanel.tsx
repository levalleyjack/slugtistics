import React, { useState, useMemo } from "react";
import {
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
  Fade,
  CircularProgress,
  styled,
  InputAdornment,
} from "@mui/material";
import {
  ThumbUpOutlined,
  ThumbDownOutlined,
  School,
  Search,
  ArrowForward,
  LocalOffer,
} from "@mui/icons-material";
import he from "he";
import { useQuery } from "@tanstack/react-query";
import { RatingCard } from "./RatingCard";
import { lighten } from "@mui/material/styles";
import { Rating, RatingsPanelProps } from "../Constants";
import LoadingSkeleton from "./LoadingComponents";
import { format, toZonedTime } from "date-fns-tz";

const BORDER_RADIUS = "12px";

const FilterContainer = styled(Paper)(({ theme }) => ({
  borderRadius: BORDER_RADIUS,
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[2],
}));

const EnhancedFilterContainer = styled(FilterContainer)(
  ({ theme, hidden }) => ({
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
  })
);

const FilterControls = styled(Stack)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: theme.spacing(2),
  width: "100%",
}));

const ContentContainer = styled(Box)({
  display: "flex",
  flexDirection: "column",
  height: "100%",
  overflow: "hidden",
});

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  minWidth: 200,
  [theme.breakpoints.down("sm")]: {
    minWidth: "100%",
  },
}));

const StatCard = styled(Card)(({ theme }) => ({
  borderRadius: BORDER_RADIUS,
  height: "100%",
  transition: "all 0.2s ease-in-out",

}));

type SortOptions = "date" | "rating" | "difficulty_rating" | "likes";

export const RatingsPanel: React.FC<RatingsPanelProps> = ({
  professorName,
  currentClass,
  courseCodes,
  onClose,
}) => {
  const theme = useTheme();

  const [sortBy, setSortBy] = useState<SortOptions>("date");
  const [filterBy, setFilterBy] = useState<string>(
    !currentClass || currentClass === "all" ? "all" : currentClass
  );
  const [searchTerm, setSearchTerm] = useState<string>("");

  const { data: ratings = [], isLoading } = useQuery<Rating[]>({
    queryKey: ["reviews", professorName, filterBy],
    queryFn: async () => {
      const response = await fetch(
        `https://api.slugtistics.com/api/pyback/instructor_ratings?instructor=${encodeURIComponent(
          professorName
        )}&course=${encodeURIComponent(filterBy === "all" ? "" : filterBy)}`
      );
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      return data.all_ratings ?? [];
    },
    refetchOnWindowFocus: false,
  });

  const stats = useMemo(() => {
    if (!ratings?.length) {
      return { overall: 0, difficulty: 0, wouldTakeAgain: 0 };
    }

    const validOverall = ratings.filter((r) => r.overall_rating !== undefined);
    const validDifficulty = ratings.filter(
      (r) => r.difficulty_rating !== undefined
    );
    const validTakeAgain = ratings.filter(
      (r) => r.would_take_again !== undefined
    );

    return {
      overall: validOverall.length
        ? Number(
            (
              validOverall.reduce(
                (acc, r) => acc + (r.overall_rating ?? 0),
                0
              ) / validOverall.length
            ).toFixed(1)
          )
        : 0,
      difficulty: validDifficulty.length
        ? Number(
            (
              validDifficulty.reduce(
                (acc, r) => acc + (r.difficulty_rating ?? 0),
                0
              ) / validDifficulty.length
            ).toFixed(1)
          )
        : 0,
      wouldTakeAgain: validTakeAgain.length
        ? Number(
            (
              (validTakeAgain.filter((r) => r.would_take_again).length /
                validTakeAgain.length) *
              100
            ).toFixed(1)
          )
        : 0,
    };
  }, [ratings]);

  const processedRatings = useMemo(() => {
    return (
      ratings
        ?.filter((rating) =>
          rating.comment?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        ?.sort((a, b) => {
          switch (sortBy) {
            case "rating":
              return (b.overall_rating ?? 0) - (a.overall_rating ?? 0);
            case "difficulty_rating":
              return (b.difficulty_rating ?? 0) - (a.difficulty_rating ?? 0);
            case "likes":
              return (b.thumbs_up ?? 0) - (a.thumbs_up ?? 0);
            default: {
              const dateA = new Date(
                (a.date ?? "").replace(" ", "T")
              ).valueOf();
              const dateB = new Date(
                (b.date ?? "").replace(" ", "T")
              ).valueOf();
              return dateB - dateA;
            }
          }
        }) ?? []
    );
  }, [ratings, searchTerm, sortBy]);
  const formatDate = (dateString: string): string => {
    try {
      const dateWithoutTZ = dateString.replace(/ \+\d{4} UTC$/, '');
      
      const date = new Date(dateWithoutTZ);
      
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date');
      }
      
      return format(date, 'MMM d, yyyy');
    } catch (error) {
      console.error('Error formatting date:', error, 'for date string:', dateString);
      return 'Invalid date';
    }
  };

  return (
    <ContentContainer>
      <Box
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: "divider",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography variant="h6" component="div" fontWeight="bold">
            {professorName}'s Ratings
          </Typography>
          <Box>
            {isLoading ? (
              <Stack direction="row" spacing={0.5} alignItems="center">
                <CircularProgress size={12} />
                <Typography
                  variant="body2"
                  component="div"
                  color="text.secondary"
                >
                  Loading reviews...
                </Typography>
              </Stack>
            ) : (
              <Typography
                variant="body2"
                component="div"
                color="text.secondary"
              >
                {ratings?.length ?? 0} reviews
              </Typography>
            )}
          </Box>
        </Box>
        {onClose && (
          <IconButton
            onClick={onClose}
            size="small"
            sx={{ borderRadius: "8px" }}
          >
            <ArrowForward />
          </IconButton>
        )}
      </Box>

      <Box sx={{ flexGrow: 1, overflow: "auto", p: 2 }}>
        {isLoading ? (
          <LoadingSkeleton courseCodes={courseCodes} filterBy={filterBy} />
        ) : (
          <>
            <Grid container spacing={1.5} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={4}>
                <StatCard elevation={1}>
                  <CardContent>
                    <Typography
                      variant="h6"
                      component="div"
                      color={getRatingColor(stats.overall, "rating")}
                      fontWeight="bold"
                    >
                      {stats.overall}
                    </Typography>
                    <Typography
                      variant="caption"
                      component="div"
                      color="text.secondary"
                    >
                      Avg. Rating
                    </Typography>
                  </CardContent>
                </StatCard>
              </Grid>
              <Grid item xs={12} sm={4}>
                <StatCard elevation={1}>
                  <CardContent>
                    <Typography
                      variant="h6"
                      component="div"
                      color={getRatingColor(stats.difficulty, "difficulty")}
                      fontWeight="bold"
                    >
                      {stats.difficulty}
                    </Typography>
                    <Typography
                      variant="caption"
                      component="div"
                      color="text.secondary"
                    >
                      Avg. Difficulty
                    </Typography>
                  </CardContent>
                </StatCard>
              </Grid>
              <Grid item xs={12} sm={4}>
                <StatCard elevation={1}>
                  <CardContent>
                    <Typography
                      variant="h6"
                      component="div"
                      color={getRatingColor(
                        stats.wouldTakeAgain / 20,
                        "rating"
                      )}
                      fontWeight="bold"
                    >
                      {stats.wouldTakeAgain}%
                    </Typography>
                    <Typography
                      variant="caption"
                      component="div"
                      color="text.secondary"
                    >
                      Would Take Again
                    </Typography>
                  </CardContent>
                </StatCard>
              </Grid>
            </Grid>

            <TextField
              size="small"
              fullWidth
              placeholder="Search reviews..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ mr: 1, color: "text.secondary" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                },
              }}
            />

            <EnhancedFilterContainer>
              <FilterControls>
                <StyledFormControl size="small">
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
                    <MenuItem value="rating">Highest Rating</MenuItem>
                    <MenuItem value="difficulty_rating">
                      Highest Difficulty
                    </MenuItem>
                    <MenuItem value="likes">Most Likes</MenuItem>
                  </Select>
                </StyledFormControl>
                <StyledFormControl size="small">
                  <InputLabel>Filter By Course</InputLabel>
                  <Select
                    value={filterBy}
                    onChange={(e) => setFilterBy(e.target.value)}
                    label="Filter By Course"
                    sx={{ borderRadius: "8px" }}
                  >
                    <MenuItem value="all">All Courses</MenuItem>
                    {courseCodes?.map((course) => (
                      <MenuItem
                        key={course.courseName}
                        value={course.courseName}
                      >
                        {course.courseName} ({course.courseCount})
                      </MenuItem>
                    ))}
                  </Select>
                </StyledFormControl>
              </FilterControls>
            </EnhancedFilterContainer>

            <Stack spacing={1.5}>
              {processedRatings.map((rating, index) => {
                const formattedDate = formatDate(rating.date);
                return (
                  <Fade in={true} key={index} timeout={300}>
                    <Paper
                      sx={{ p: 2, borderRadius: BORDER_RADIUS }}
                      elevation={2}
                    >
                      <Grid container spacing={1.5}>
                        <Grid item xs={12}>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "center",
                              width: "100%",
                            }}
                          >
                            <RatingCard
                              overallRating={rating.overall_rating ?? 0}
                              difficultyRating={rating.difficulty_rating ?? 0}
                              getRatingColor={getRatingColor}
                            />
                          </Box>
                        </Grid>
                        <Grid item xs={12}>
                          <Box component="div">
                            <Typography variant="body2" component="div">
                              {he.decode(rating.comment ?? "")}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12}>
                          <Box
                            sx={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 0.75,
                              mb: 1.5,
                            }}
                          >
                            {rating.is_online && (
                              <Chip
                                label="Online"
                                color="primary"
                                variant="outlined"
                                size="small"
                              />
                            )}
                            {rating.attendance_mandatory === "mandatory" && (
                              <Chip
                                label="Attendance Required"
                                color="secondary"
                                variant="outlined"
                                size="small"
                              />
                            )}
                            {rating.would_take_again && (
                              <Chip
                                label="Would Take Again"
                                color="success"
                                variant="outlined"
                                size="small"
                              />
                            )}
                          </Box>
                          {rating.tags && (
                            <Box
                              sx={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 0.75,
                              }}
                            >
                              {rating.tags.split("--").map((tag, tagIndex) => (
                                <Chip
                                  key={tagIndex}
                                  label={tag}
                                  size="small"
                                  icon={<LocalOffer />}
                                  variant="filled"
                                  sx={{
                                    backgroundColor: `${theme.palette.primary.main}15`,
                                    color: "primary.main",
                                    "& .MuiChip-icon": {
                                      color: "primary.main",
                                    },
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
                              pt: 1.5,
                              borderTop: 1,
                              borderColor: "divider",
                            }}
                          >
                            <Stack
                              direction="row"
                              spacing={1.5}
                              alignItems="center"
                            >
                              <Stack
                                direction="row"
                                spacing={0.5}
                                alignItems="center"
                              >
                                <School
                                  sx={{
                                    fontSize: "0.875rem",
                                    color: "text.secondary",
                                  }}
                                />
                                <Typography
                                  variant="caption"
                                  component="div"
                                  color="text.secondary"
                                >
                                  {rating.class_name}
                                </Typography>
                              </Stack>
                              <Typography
                                variant="caption"
                                component="div"
                                color="text.secondary"
                              >
                                {formattedDate}
                              </Typography>
                            </Stack>
                            <Stack direction="row" spacing={1.5}>
                              <Stack
                                direction="row"
                                spacing={0.5}
                                alignItems="center"
                              >
                                <ThumbUpOutlined
                                  color="success"
                                  sx={{ fontSize: "1rem" }}
                                />
                                <Typography
                                  variant="caption"
                                  component="div"
                                  color="text.secondary"
                                >
                                  {rating.thumbs_up ?? 0}
                                </Typography>
                              </Stack>
                              <Stack
                                direction="row"
                                spacing={0.5}
                                alignItems="center"
                              >
                                <ThumbDownOutlined
                                  color="error"
                                  sx={{ fontSize: "1rem" }}
                                />
                                <Typography
                                  variant="caption"
                                  component="div"
                                  color="text.secondary"
                                >
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
              })}
              {!isLoading && processedRatings.length === 0 && (
                <Paper
                  sx={{
                    p: 3,
                    textAlign: "center",
                    borderRadius: BORDER_RADIUS,
                  }}
                  elevation={2}
                >
                  <Typography
                    variant="subtitle1"
                    component="div"
                    color="text.secondary"
                    gutterBottom
                  >
                    No Reviews Found
                  </Typography>
                  <Typography
                    variant="body2"
                    component="div"
                    color="text.secondary"
                  >
                    Try adjusting your search criteria
                  </Typography>
                </Paper>
              )}
            </Stack>
          </>
        )}
      </Box>
    </ContentContainer>
  );
};

const getRatingColor = (
  score: number,
  type: "difficulty" | "rating" = "rating"
): string => {
  const theme = useTheme();
  if (type === "difficulty") {
    if (score <= 3) return theme.palette.success.main;
    if (score <= 4) return theme.palette.warning.main;
    return theme.palette.error.main;
  }
  if (score >= 4) return theme.palette.success.main;
  if (score >= 3) return theme.palette.warning.main;
  return theme.palette.error.main;
};
export default RatingsPanel;
