import React from 'react';
import {
  Box,
  Typography,
  Rating as MuiRating,
  Divider,
  styled,
  useTheme,
} from '@mui/material';
import { lighten } from '@mui/material/styles';

const RatingDisplay = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.palette.background.default,
  gap: theme.spacing(1),
  padding: theme.spacing(1),
  borderRadius: '8px',
  border: `1px solid ${theme.palette.divider}`,
  width: '100%',
}));

const RatingSection = styled(Box)({
  flex: 1,
  textAlign: 'center',
  display: 'flex',
  borderRadius: '8px',
  flexDirection: 'column',
  padding: 0,
  alignItems: 'center',
  gap: 0.5,
});

interface RatingCardProps {
  overallRating: number;
  difficultyRating: number;
  getRatingColor: (score: number, type?: 'difficulty' | 'rating') => string;
}

export const RatingCard: React.FC<RatingCardProps> = ({
  overallRating,
  difficultyRating,
  getRatingColor,
}) => {
  const theme = useTheme();
  const overallRatingColor = getRatingColor(overallRating, 'rating');
  const difficultyRatingColor = getRatingColor(difficultyRating, 'difficulty');

  return (
    <RatingDisplay>
      <RatingSection
        sx={{
          backgroundColor: lighten(overallRatingColor, 0.9),
          pt: '12px',
          pl: '5px',
          pr: '5px',
          pb: '12px',
        }}
      >
        <Typography
          variant="h5"
          color={overallRatingColor}
          sx={{ fontWeight: 'bold', lineHeight: 1 }}
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

      <Divider orientation="vertical" flexItem />

      <RatingSection
        sx={{
          backgroundColor: lighten(difficultyRatingColor, 0.9),
          pt: '21px',
          pb: '21px',
        }}
      >
        <Typography
          variant="h5"
          color={difficultyRatingColor}
          sx={{ fontWeight: 'bold', lineHeight: 1 }}
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