import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Container,
  Grid,
  Chip,
  styled,
  CircularProgress,
  Paper,
} from "@mui/material";
import {
  School as SchoolIcon,
  Science as ScienceIcon,
  Brush as BrushIcon,
} from "@mui/icons-material";

const MajorSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMajor, setSelectedMajor] = useState<string | null>(null);

  const { data: majors, isLoading } = useQuery<string[]>({
    queryKey: ["majors"],
    queryFn: async () => {
      const response = await fetch("http://127.0.0.1:5001/api/degrees");
      if (!response.ok) {
        throw new Error("Failed to fetch majors");
      }
      return response.json();
    },
  });

  const getDegreeType = (major: string) => {
    if (major.includes("B.S.")) return "B.S.";
    if (major.includes("B.A.")) return "B.A.";
    if (major.includes("B.M.")) return "B.M.";
    return "Degree";
  };

  const getMajorCategory = (major: string) => {
    if (
      major.match(
        /Biology|Chemistry|Physics|Science|Engineering|Mathematics|Computer|Technology/i
      )
    ) {
      return "STEM";
    }
    if (major.match(/Art|Music|Theater|Design|Creative|Film|Visual/i)) {
      return "Arts";
    }
    return "Humanities & Social Sciences";
  };

  const getMajorIcon = (category: string) => {
    switch (category) {
      case "STEM":
        return <ScienceIcon />;
      case "Arts":
        return <BrushIcon />;
      default:
        return <SchoolIcon />;
    }
  };

  const filteredMajors = majors?.filter((major) =>
    major.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  if (selectedMajor) {
    return (
     <Typography>Hello</Typography>
    );
  }

  return (
    <MainContainer>
      <SearchContainer elevation={0}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ pt: 3 }}>
          UCSC Majors and Programs
        </Typography>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search majors..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 2 }}
        />
      </SearchContainer>

      <ScrollContainer>
        <Grid container spacing={2} sx={{ p: 2 }}>
          {filteredMajors?.map((major) => {
            const category = getMajorCategory(major);
            const degreeType = getDegreeType(major);
            const majorName = major.replace(` ${degreeType}`, "");

            return (
              <Grid item xs={12} sm={6} md={4} key={major}>
                <StyledCard
                  onClick={() => setSelectedMajor(major)}
                  sx={{ cursor: "pointer" }}
                >
                  <CardContent>
                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                    >
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <CategoryChip
                          icon={getMajorIcon(category)}
                          label={category}
                          size="small"
                          category={category}
                        />
                        <DegreeChip label={degreeType} size="small" />
                      </Box>
                      <Typography
                        variant="h6"
                        sx={{
                          fontSize: "1.1rem",
                          lineHeight: 1.3,
                          minHeight: "2.6rem",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {majorName}
                      </Typography>
                    </Box>
                  </CardContent>
                </StyledCard>
              </Grid>
            );
          })}
        </Grid>
      </ScrollContainer>
    </MainContainer>
  );
};

const MainContainer = styled(Box)({
  height: "calc(100dvh - 64px)",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
});

const SearchContainer = styled(Paper)({
  position: "sticky",
  top: 0,
  zIndex: 1,
  backgroundColor: "#fff",
  padding: "0 24px",
});

const ScrollContainer = styled(Box)({
  flexGrow: 1,
  overflow: "auto",
});

const StyledCard = styled(Card)(({ theme }) => ({
  height: "100%",
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: "12px",
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    boxShadow: theme.shadows[4],
    borderColor: theme.palette.primary.light,
    "& .MuiChip-root": {
      transform: "translateY(-1px)",
    },
  },
}));

interface CategoryChipProps {
  category: string;
}

const CategoryChip = styled(Chip)<CategoryChipProps>(({ theme, category }) => {
  const getGradient = (cat: string) => {
    switch (cat) {
      case "STEM":
        return `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.light} 100%)`;
      case "Arts":
        return `linear-gradient(135deg, ${theme.palette.secondary.dark} 0%, ${theme.palette.secondary.light} 100%)`;
      default:
        return `linear-gradient(135deg, ${theme.palette.success.dark} 0%, ${theme.palette.success.light} 100%)`;
    }
  };

  return {
    borderRadius: "8px",
    background: getGradient(category),
    color: theme.palette.common.white,
    fontWeight: 600,
    height: "28px",
    transition: "all 0.2s ease-in-out",
    "& .MuiChip-icon": {
      color: theme.palette.common.white,
    },
  };
});

const DegreeChip = styled(Chip)(({ theme }) => ({
  borderRadius: "8px",
  background: theme.palette.grey[100],
  border: `1px solid ${theme.palette.grey[300]}`,
  color: theme.palette.grey[800],
  fontWeight: 600,
  height: "28px",
  transition: "all 0.2s ease-in-out",
}));

export default MajorSearch;
