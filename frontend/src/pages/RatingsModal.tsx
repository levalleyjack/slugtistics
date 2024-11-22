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
} from "@mui/material";
import OutlinedFlagIcon from "@mui/icons-material/OutlinedFlag";
import { styled } from "@mui/material/styles";
import he from "he";
import {
  ThumbUp as ThumbUpIcon,
  Visibility as GlassesIcon,
  Psychology as BrainIcon,
  School as SchoolIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  LocalOffer as TagIcon,
} from "@mui/icons-material";
import { Rating } from "../Colors";

//Type Definitions
interface RatingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  professorName: string;
  ratings?: Rating[];
  currentClass: string;
}

type SortOptions =
  | "date"
  | "helpful_rating"
  | "clarity_rating"
  | "difficulty_rating";

//Styled Components
const StyledModal = styled(Modal)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(2),
}));

const ModalContent = styled(Paper)(({ theme }) => ({
  position: "relative",
  width: "100%",
  maxWidth: "64rem",
  maxHeight: "90vh",
  display: "flex",
  flexDirection: "column",
  backgroundColor: theme.palette.background.default,
  [theme.breakpoints.down("sm")]: {
    maxHeight: "100vh",
    height: "100%",
    borderRadius: 0,
  },
}));

const StatCard = styled(Card)(({ theme }) => ({
  height: "100%",
  "& .MuiCardContent-root": {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: theme.spacing(2),
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(1),
    },
  },
}));

const ResponsiveStack = styled(Stack)(({ theme }) => ({
  [theme.breakpoints.down("sm")]: {
    flexDirection: "column",
    "& > *": {
      marginBottom: theme.spacing(2),
      marginRight: 0,
    },
  },
}));

const isUnique = (
  element: React.ReactElement,
  index: number,
  array: React.ReactElement[]
): boolean => {
  const firstIndex = array.findIndex(
    (item) => item.props.value === element.props.value
  );
  return index === firstIndex;
};

export const RatingsModal: React.FC<RatingsModalProps> = ({
  isOpen,
  onClose,
  professorName,
  ratings = [],
  currentClass,
}) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [sortBy, setSortBy] = useState<SortOptions>("date");
  const [filterBy, setFilterBy] = useState<string>(() => {
    if (!ratings || currentClass === "all") return "all";
    return ratings.some((rating) => rating.class_name === currentClass)
      ? currentClass
      : "all";
  });
  const [searchTerm, setSearchTerm] = useState<string>("");

  const getRatingColor = (score: number): string => {
    if (score >= 4) return "success.main";
    if (score >= 3) return "warning.main";
    return "error.main";
  };

  const processedRatings = useMemo(() => {
    const filtered = ratings?.filter((rating) => {
      const matchesClass =
        filterBy === "all" ? true : rating.class_name === filterBy;
      const matchesSearch =
        rating.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rating.class_name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesClass && matchesSearch;
    });

    return filtered?.sort((a, b) => {
      switch (sortBy) {
        case "helpful_rating":
          return b.helpful_rating - a.helpful_rating;
        case "clarity_rating":
          return b.clarity_rating - a.clarity_rating;
        case "difficulty_rating":
          return b.difficulty_rating - a.difficulty_rating;
        case "date":
        default:
          return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });
  }, [ratings, filterBy, searchTerm, sortBy]);

  const handleSortChange = (event: SelectChangeEvent<SortOptions>) => {
    setSortBy(event.target.value as SortOptions);
  };

  const handleFilterChange = (event: SelectChangeEvent<string>) => {
    setFilterBy(event.target.value);
  };

  const calculateAverage = (
    ratings: Rating[],
    key: keyof Pick<
      Rating,
      "clarity_rating" | "helpful_rating" | "difficulty_rating"
    >
  ): string => {
    return ratings.length > 0
      ? (ratings.reduce((acc, r) => acc + r[key], 0) / ratings.length).toFixed(
          1
        )
      : "0";
  };

  return (
    <StyledModal open={isOpen} onClose={onClose}>
      <ModalContent>
        <Box
          sx={{
            p: isSmallScreen ? 1 : 2,
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
                variant={isSmallScreen ? "h6" : "h5"}
                component="h2"
                fontWeight="bold"
              >
                {professorName}'s Ratings
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Recent {ratings.length} reviews
              </Typography>
            </Box>
            <IconButton
              onClick={onClose}
              size={isSmallScreen ? "medium" : "large"}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{ flexGrow: 1, overflow: "auto", p: isSmallScreen ? 1 : 2 }}>
          <Grid container spacing={isSmallScreen ? 1 : 2}>
            <Grid item xs={6} md={3}>
              <StatCard>
                <CardContent>
                  <Typography
                    variant={isSmallScreen ? "h5" : "h4"}
                    color="success.main"
                    fontWeight="bold"
                  >
                    {calculateAverage(ratings, "clarity_rating")}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg. Clarity
                  </Typography>
                </CardContent>
              </StatCard>
            </Grid>
            <Grid item xs={6} md={3}>
              <StatCard>
                <CardContent>
                  <Typography
                    variant={isSmallScreen ? "h5" : "h4"}
                    color="primary.main"
                    fontWeight="bold"
                  >
                    {calculateAverage(ratings, "helpful_rating")}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg. Helpfulness
                  </Typography>
                </CardContent>
              </StatCard>
            </Grid>
            <Grid item xs={6} md={3}>
              <StatCard>
                <CardContent>
                  <Typography
                    variant={isSmallScreen ? "h5" : "h4"}
                    color="warning.main"
                    fontWeight="bold"
                  >
                    {calculateAverage(ratings, "difficulty_rating")}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg. Difficulty
                  </Typography>
                </CardContent>
              </StatCard>
            </Grid>
            <Grid item xs={6} md={3}>
              <StatCard>
                <CardContent>
                  <Typography
                    variant={isSmallScreen ? "h5" : "h4"}
                    color="secondary.main"
                    fontWeight="bold"
                  >
                    {ratings.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Reviews
                  </Typography>
                </CardContent>
              </StatCard>
            </Grid>
          </Grid>

          {/* Filters */}
          <Paper sx={{ p: isSmallScreen ? 1 : 2, mb: isSmallScreen ? 2 : 3 }}>
            <Grid container spacing={isSmallScreen ? 1 : 2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Search reviews..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <ResponsiveStack
                  direction={isSmallScreen ? "column" : "row"}
                  spacing={2}
                >
                  <FormControl fullWidth>
                    <InputLabel>Sort By</InputLabel>
                    <Select
                      value={sortBy}
                      onChange={handleSortChange}
                      label="Sort By"
                    >
                      <MenuItem value="date">Most Recent</MenuItem>
                      <MenuItem value="helpful_rating">Most Helpful</MenuItem>
                      <MenuItem value="clarity_rating">
                        Highest Clarity
                      </MenuItem>
                      <MenuItem value="difficulty_rating">
                        Most Difficult
                      </MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl fullWidth>
                    <InputLabel>Filter By</InputLabel>
                    <Select
                      value={filterBy}
                      onChange={handleFilterChange}
                      label="Filter By"
                    >
                      <MenuItem value="all">All Courses</MenuItem>
                      {ratings
                        ?.map((rating) => (
                          <MenuItem
                            key={rating.class_name}
                            value={rating.class_name}
                          >
                            {rating.class_name}
                          </MenuItem>
                        ))
                        ?.filter(isUnique)}
                    </Select>
                  </FormControl>
                </ResponsiveStack>
              </Grid>
            </Grid>
          </Paper>

          <Stack spacing={isSmallScreen ? 1 : 2}>
            {processedRatings?.map((rating, index) => (
              <Paper key={index} sx={{ p: isSmallScreen ? 2 : 3 }}>
                <Grid
                  container
                  spacing={isSmallScreen ? 1 : 2}
                  sx={{ pb: isSmallScreen ? 1 : 2 }}
                >
                  <Grid item xs={12} sm={4}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <GlassesIcon
                        sx={{ color: getRatingColor(rating.clarity_rating) }}
                      />
                      <Typography
                        fontWeight="bold"
                        color={getRatingColor(rating.clarity_rating)}
                      >
                        {rating.clarity_rating}/5
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        clarity
                      </Typography>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <ThumbUpIcon
                        sx={{ color: getRatingColor(rating.helpful_rating) }}
                      />
                      <Typography
                        fontWeight="bold"
                        color={getRatingColor(rating.helpful_rating)}
                      >
                        {rating.helpful_rating}/5
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        helpful
                      </Typography>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <BrainIcon
                        sx={{ color: getRatingColor(rating.difficulty_rating) }}
                      />
                      <Typography
                        fontWeight="bold"
                        color={getRatingColor(rating.difficulty_rating)}
                      >
                        {rating.difficulty_rating}/5
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        difficulty
                      </Typography>
                    </Stack>
                  </Grid>
                </Grid>

                <Typography sx={{ mb: 2 }}>
                  {he.decode(rating.comment)}
                </Typography>

                <Box sx={{ mb: 2, display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {rating.is_online && (
                    <Chip label="Online" color="primary" variant="outlined" />
                  )}
                  {rating.attendance_mandatory === "mandatory" && (
                    <Chip
                      label="Attendance Required"
                      color="secondary"
                      variant="outlined"
                    />
                  )}
                  {rating.textbook_use > 0 && (
                    <Chip
                      label="Textbooks Used"
                      color="success"
                      variant="outlined"
                    />
                  )}
                  {!(rating?.tags === "") &&
                    rating.tags?.split("--").map((tag, tagIndex) => (
                      <Chip
                        key={tagIndex}
                        label={tag}
                        size="small"
                        icon={<TagIcon />}
                        sx={{
                          "& .MuiChip-icon": {
                            fontSize: "0.8rem",
                          },
                        }}
                      />
                    ))}
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: isSmallScreen ? "wrap" : "nowrap",
                    gap: 1,
                  }}
                >
                  <Stack
                    direction={isSmallScreen ? "column" : "row"}
                    spacing={isSmallScreen ? 0.5 : 2}
                    alignItems={isSmallScreen ? "flex-start" : "center"}
                  >
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <SchoolIcon
                        sx={{ fontSize: 16, color: "text.secondary" }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {rating.class_name}
                      </Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(rating.date).toLocaleDateString()}
                    </Typography>
                  </Stack>
                  {rating.flag_status !== "UNFLAGGED" && (
                    <Chip
                      icon={<OutlinedFlagIcon />}
                      color="error"
                      size="small"
                      sx={{ ml: "auto" }}
                    />
                  )}
                </Box>
              </Paper>
            ))}
            {processedRatings?.length === 0 && (
              <Paper sx={{ p: 3, textAlign: "center" }}>
                <Typography color="text.secondary">
                  No ratings found matching your criteria
                </Typography>
              </Paper>
            )}
          </Stack>
        </Box>
      </ModalContent>
    </StyledModal>
  );
};
