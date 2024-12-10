import React from "react";
import {
  Box,
  Typography,
  Rating as MuiRating,
  Divider,
  styled,
} from "@mui/material";
import { COLORS } from "../Constants";
import { lighten } from "@mui/material/styles";

const RatingDisplay = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: COLORS.GRAY_50,
  gap: theme.spacing(2),
  padding: theme.spacing(1),
  borderRadius: "8px",
  border: `1px solid ${theme.palette.divider}`,
  width: "100%",
}));

const RatingSection = styled(Box)({
  flex: 1,
  textAlign: "center",
  display: "flex",
  borderRadius: "8px",
  flexDirection: "column",
  alignItems: "center",
  gap: 0.5,
});

interface RatingComponentProps {
  overallRating: number;
  difficultyRating: number;
  getRatingColor: (score: number) => string;
}

export const RatingComponent: React.FC<RatingComponentProps> = ({
  overallRating,
  difficultyRating,
  getRatingColor,
}) => {
  const overallRatingColor = getRatingColor(overallRating);
  const difficultyRatingColor = getRatingColor(Math.abs(difficultyRating - 6));
  return (
    <RatingDisplay>
      <RatingSection
        sx={{
          backgroundColor: lighten(overallRatingColor, 0.7),
          pt: "12px",
          pb: "12px",
        }}
      >
        <Typography
          variant="h5"
          color={overallRatingColor}
          sx={{ fontWeight: "bold", lineHeight: 1 }}
        >
          {overallRating.toFixed(1)}
        </Typography>
        <MuiRating
          value={overallRating}
          precision={0.1}
          readOnly
          size="small"
        />
        <Typography variant="caption" color="text.secondary">
          Overall Rating
        </Typography>
      </RatingSection>

      <Divider orientation="vertical" flexItem />

      <RatingSection
        sx={{
          backgroundColor: lighten(difficultyRatingColor, 0.7),
          pt: "20px",
          pb: "20px",
        }}
      >
        <Typography
          variant="h5"
          color={difficultyRatingColor}
          sx={{ fontWeight: "bold", lineHeight: 1 }}
        >
          {difficultyRating.toFixed(1)}
        </Typography>

        <Typography variant="caption" color="text.secondary">
          Difficulty
        </Typography>
      </RatingSection>
    </RatingDisplay>
  );
};

export default RatingComponent;
