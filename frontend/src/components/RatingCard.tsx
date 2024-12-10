import React from "react";
import {
  Box,
  Typography,
  Rating as MuiRating,
  Divider,
  styled,
} from "@mui/material";
import { COLORS } from "../Constants";

const RatingDisplay = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: theme.spacing(2),
  padding: theme.spacing(1.5),
  borderRadius: "8px",
  backgroundColor: COLORS.GRAY_50,
  border: `1px solid ${theme.palette.divider}`,
  width: "100%",
}));

const RatingSection = styled(Box)({
  flex: 1,
  textAlign: "center",
  display: "flex",
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
  return (
    <RatingDisplay>
      <RatingSection>
        <Typography
          variant="h5"
          color={getRatingColor(overallRating)}
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

      <RatingSection>
        <Typography
          variant="h5"
          color={getRatingColor(Math.abs(difficultyRating - 6))}
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
