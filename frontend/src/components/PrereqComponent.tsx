import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Collapse,
  Chip,
  Stack,
  Paper,
  Fade,
  IconButton,
  styled,
  useTheme,
} from "@mui/material";
import {
  List as ListIcon,
  FormatAlignLeft as TextIcon,
  KeyboardArrowDown as ArrowDownIcon,
  KeyboardArrowUp as ArrowUpIcon,
} from "@mui/icons-material";

const PrereqChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  borderRadius: "8px",
  fontWeight: 500,
  backgroundColor: theme.palette.primary.light,
  color: theme.palette.primary.contrastText,
}));

const PrereqGroup = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1),
  marginBottom: theme.spacing(1),
  borderRadius: "8px",
  backgroundColor: theme.palette.background.default,
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  "& > span": {
    marginRight: theme.spacing(1),
    fontWeight: 500,
    color: theme.palette.text.secondary,
  },
}));

const RequirementGroup = ({
  group,
  index,
}: {
  group: string[];
  index: number;
}) => {
  const isConcurrent = group.some(
    (course) =>
      typeof course === "string" && course.toLowerCase().includes("concurrent")
  );

  return (
    <PrereqGroup elevation={0}>
      <span>{isConcurrent ? "WITH" : index != 0 ? "AND" : ""}</span>
      {group.map((course, i: number) => (
        //fragment so that multiple elements can be returned without adding extra DOM node
        <React.Fragment key={i}>
          <PrereqChip
            key={i}
            label={course}
            size="medium"
            color={course.includes("Concurrent") ? "secondary" : "primary"}
          />
        </React.Fragment>
      ))}
    </PrereqGroup>
  );
};

const PrerequisitesSection = ({
  enrollmentReqs,
  coursesReq,
}: {
  enrollmentReqs: string;
  coursesReq: string[][];
}) => {
  const [viewMode, setViewMode] = useState("text");
  const [expanded, setExpanded] = useState(false);
  const theme = useTheme();

  const hasStructuredReqs = Array.isArray(coursesReq) && coursesReq.length > 0;

  const toggleViewMode = () => {
    setViewMode((prev) => (prev === "text" ? "structured" : "text"));
  };

  const toggleExpanded = () => {
    setExpanded((prev) => !prev);
  };

  return (
    <Box>
      {hasStructuredReqs && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1.5,
          }}
        >
          <Button
            variant="outlined"
            size="small"
            onClick={toggleViewMode}
            startIcon={viewMode === "text" ? <ListIcon /> : <TextIcon />}
            sx={{
              borderRadius: "8px",
              textTransform: "none",
              mb: 1,
            }}
          >
            {viewMode === "text" ? "Show as list" : "Show as text"}
          </Button>

          <IconButton
            size="small"
            onClick={toggleExpanded}
            sx={{
              backgroundColor: theme.palette.action.hover,
              borderRadius: "8px",
              p: 1,
            }}
          >
            {expanded ? <ArrowUpIcon /> : <ArrowDownIcon />}
          </IconButton>
        </Box>
      )}

      <Collapse in={viewMode === "text" || expanded}>
        <Fade in={viewMode === "text" || expanded}>
          <Typography
            variant="body1"
            sx={{ lineHeight: 1.8, mb: viewMode === "structured" ? 2 : 0 }}
          >
            {enrollmentReqs}
          </Typography>
        </Fade>
      </Collapse>

      {hasStructuredReqs && (
        <Collapse in={viewMode === "structured" || expanded}>
          <Fade in={viewMode === "structured" || expanded}>
            <Box sx={{ mt: viewMode === "text" ? 2 : 0 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Course Requirements:
              </Typography>
              <Stack spacing={1}>
                {coursesReq.map((group, index) => (
                  <RequirementGroup key={index} group={group} index={index} />
                ))}
              </Stack>
            </Box>
          </Fade>
        </Collapse>
      )}
    </Box>
  );
};

export default PrerequisitesSection;
