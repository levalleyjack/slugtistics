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
  darken,
  Collapse,
  Divider,
} from "@mui/material";
import {
  ThumbUpOutlined,
  ThumbDownOutlined,
  School,
  Search,
  ArrowForward,
  LocalOffer,
  FilterList,
  ExpandMore,
  ExpandLess,
} from "@mui/icons-material";
import he from "he";
import { useQuery } from "@tanstack/react-query";
import { RatingCard } from "./RatingCard";
import { lighten } from "@mui/material/styles";
import { Rating, RatingsPanelProps } from "../Constants";
import LoadingSkeleton from "./LoadingComponents";
import { format } from "date-fns-tz";

const BORDER_RADIUS = "8px";

const ContentContainer = styled(Box)({
  display: "flex",
  flexDirection: "column",
  height: "100%",
  overflow: "hidden",
});

const StatCard = styled(Card)(({ theme }) => ({
  borderRadius: BORDER_RADIUS,
  height: "100%",
  boxShadow: "none",
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
  const [filterBy, setFilterBy] = useState<string>(currentClass);
  const [filtersExpanded, setFiltersExpanded] = useState(true);
  //chagne filterby when class changes

  React.useMemo(() => {
    setFilterBy(currentClass);
  }, [currentClass]);
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
      ratings?.sort((a, b) => {
        switch (sortBy) {
          case "rating":
            return (b.overall_rating ?? 0) - (a.overall_rating ?? 0);
          case "difficulty_rating":
            return (b.difficulty_rating ?? 0) - (a.difficulty_rating ?? 0);
          case "likes":
            return (b.thumbs_up ?? 0) - (a.thumbs_up ?? 0);
          default: {
            const dateA = new Date((a.date ?? "").replace(" ", "T")).valueOf();
            const dateB = new Date((b.date ?? "").replace(" ", "T")).valueOf();
            return dateB - dateA;
          }
        }
      }) ?? []
    );
  }, [ratings, sortBy]);
  const formatDate = (dateString: string): string => {
    try {
      const dateWithoutTZ = dateString.replace(/ \+\d{4} UTC$/, "");

      const date = new Date(dateWithoutTZ);

      if (isNaN(date.getTime())) {
        throw new Error("Invalid date");
      }

      return format(date, "MM/dd/yy");
    } catch (error) {
      console.error(
        "Error formatting date:",
        error,
        "for date string:",
        dateString
      );
      return "Invalid date";
    }
  };

  return (
    <ContentContainer>
      <Box
        sx={{
          p: 2,
          borderLeft: 1,

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
        <>
          <Grid container spacing={1.5} sx={{ mb: 2 }}>
            <Grid item xs={4} sm={4}>
              <StatCard
                sx={{
                  background: lighten(
                    getRatingColor(stats.overall, "rating"),
                    0.9
                  ),
                }}
              >
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
            <Grid item xs={4} sm={4}>
              <StatCard
                sx={{
                  background: lighten(
                    getRatingColor(stats.difficulty, "difficulty"),
                    0.9
                  ),
                }}
              >
                {" "}
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
            <Grid item xs={4} sm={4}>
              <StatCard
                sx={{
                  background: lighten(
                    getRatingColor(stats.wouldTakeAgain / 20, "rating"),
                    0.9
                  ),
                }}
              >
                {" "}
                <CardContent>
                  <Typography
                    variant="h6"
                    component="div"
                    color={getRatingColor(stats.wouldTakeAgain / 20, "rating")}
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

          <Paper
            elevation={0}
            sx={{
              borderRadius: BORDER_RADIUS,
              mb: 2,
              overflow: "hidden",
              border: 1,
              borderColor: "divider",
            }}
          >
            <Box
              sx={{
                p: 1.5,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: filtersExpanded ? 1 : 0,
                transition: "border 0.3s",
                borderColor: "divider",
              }}
              onClick={() => setFiltersExpanded(!filtersExpanded)}
              style={{ cursor: "pointer" }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <FilterList sx={{ mr: 1, color: "text.secondary" }} />
                <Typography variant="body2" fontWeight="medium">
                  Filters
                </Typography>
              </Box>
              <IconButton size="small">
                {filtersExpanded ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            </Box>

            <Collapse in={filtersExpanded}>
              <Box sx={{ p: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Sort by
                    </Typography>
                    <FormControl fullWidth size="small">
                      <Select
                        value={sortBy}
                        onChange={(e) =>
                          setSortBy(e.target.value as SortOptions)
                        }
                        sx={{ borderRadius: "8px" }}
                      >
                        <MenuItem value="date">Recent</MenuItem>
                        <MenuItem value="rating">Highest Rating</MenuItem>
                        <MenuItem value="difficulty_rating">
                          Highest Difficulty
                        </MenuItem>
                        <MenuItem value="likes">Most Likes</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Course
                    </Typography>
                    <FormControl fullWidth size="small">
                      <Select
                        value={filterBy}
                        onChange={(e) => setFilterBy(e.target.value)}
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
                    </FormControl>
                  </Grid>
                </Grid>
              </Box>
            </Collapse>
          </Paper>

          <Stack spacing={1.5}>
            {isLoading ? (
              <LoadingSkeleton courseCodes={courseCodes} filterBy={filterBy} />
            ) : (
              processedRatings.map((rating, index) => {
                const formattedDate = formatDate(rating.date);
                return (
                  <>
                    <Fade in={true} key={index} timeout={300}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          borderRadius: BORDER_RADIUS,
                          border: `1px solid ${theme.palette.divider}`,

                          mb: 1.5,
                        }}
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
                                {rating.tags
                                  .split("--")
                                  .map((tag, tagIndex) => (
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
                                <Typography
                                  variant="caption"
                                  component="div"
                                  color="text.secondary"
                                >
                                  {formattedDate}
                                </Typography>
                                {filterBy === "all" && (
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
                                )}
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
                  </>
                );
              })
            )}
            {!isLoading && processedRatings.length === 0 && (
              <Paper
                sx={{
                  p: 3,
                  textAlign: "center",
                  borderRadius: BORDER_RADIUS,
                }}
                elevation={1}
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
