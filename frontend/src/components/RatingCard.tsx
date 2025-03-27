import React from "react";
import {
  Box,
  Typography,
  Rating as MuiRating,
  Divider,
  styled,
  useTheme,
} from "@mui/material";
import { lighten } from "@mui/material/styles";
import { RatingCardProps } from "../Constants";

const RatingDisplay = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: theme.spacing(2),

  width: "100%",
}));

const RatingSection = styled(Box)({
  flex: 1,
  textAlign: "center",
  display: "flex",
  borderRadius: "8px",
  flexDirection: "column",
  padding: 0,
  alignItems: "center",
  gap: 0.5,
});

export const RatingCard: React.FC<RatingCardProps> = ({
  overallRating,
  difficultyRating,
  getRatingColor,
}) => {
  const theme = useTheme();
  const overallRatingColor = getRatingColor(overallRating, "rating");
  const difficultyRatingColor = getRatingColor(difficultyRating, "difficulty");

  return (
    <RatingDisplay>
      <RatingSection
        sx={{
          backgroundColor: lighten(overallRatingColor, 0.9),
          pt: "12px",
          pl: "5px",
          pr: "5px",
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
          Rating
        </Typography>
      </RatingSection>

      <RatingSection
        sx={{
          backgroundColor: lighten(difficultyRatingColor, 0.9),
          pt: "21px",
          pb: "21px",
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

export default RatingCard;
