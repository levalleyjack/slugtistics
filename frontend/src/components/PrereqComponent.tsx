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
  styled,
  useTheme,
  Divider,
} from "@mui/material";
import {
  List as ListIcon,
  FormatAlignLeft as TextIcon,
  School as SchoolIcon,
} from "@mui/icons-material";

const PrereqChip = styled(Chip)<{ courseType: string }>(
  ({ theme, courseType = "regular" }) => ({
    margin: theme.spacing(0.5),
    borderRadius: "8px",
    fontWeight: 500,
    backgroundColor:
      courseType === "concurrent"
        ? theme.palette.secondary.light
        : courseType === "or"
        ? theme.palette.info.light
        : theme.palette.primary.light,
    color:
      courseType === "concurrent"
        ? theme.palette.secondary.contrastText
        : courseType === "or"
        ? theme.palette.info.contrastText
        : theme.palette.primary.contrastText,
    transition: "all 0.2s ease",
  })
);

const RequirementGroup = ({
  group,
  index,
  relationType,
}: {
  group: string[];
  index: number;
  relationType?: "and" | "or" | "with";
}) => {
  const theme = useTheme();
  const isConcurrent = group.some(
    (course) =>
      typeof course === "string" && course.toLowerCase().includes("concurrent")
  );

  const actualRelationType = isConcurrent ? "with" : relationType || "and";

  const getRelationColor = () => {
    switch (actualRelationType) {
      case "or":
        return theme.palette.info.main;
      case "with":
        return theme.palette.secondary.main;
      default:
        return theme.palette.primary.main;
    }
  };

  return (
    <Box>
      {index > 0 && (
        <Box sx={{ position: "relative", height: "40px", my: 1 }}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 2,
              backgroundColor: "white",
              px: 1.5,
              borderRadius: "12px",
              border: `1px solid ${getRelationColor()}`,
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                color: getRelationColor(),
              }}
            >
              {actualRelationType.toUpperCase()}
            </Typography>
          </Box>
          <Divider
            sx={{
              borderColor: getRelationColor(),
              borderWidth: 1,
            }}
          />
        </Box>
      )}
      <Paper
        elevation={0}
        sx={{
          p: 1.5,
          borderRadius: "12px",
          backgroundColor: theme.palette.background.default,
          border: `1px solid ${theme.palette.divider}`,
          transition: "all 0.2s ease",
        }}
      >
        <Stack direction="row" flexWrap="wrap" spacing={0}>
          {group.map((course, i) => {
            const courseType = course.toLowerCase().includes("concurrent")
              ? "concurrent"
              : index > 0 && i === 0 && actualRelationType === "or"
              ? "or"
              : "regular";

            return (
              <Box sx={{ display: "inline-block" }}>
                <PrereqChip
                  label={
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      {courseType === "concurrent" && (
                        <SchoolIcon sx={{ mr: 0.5, fontSize: "0.875rem" }} />
                      )}
                      {course}
                    </Box>
                  }
                  size="medium"
                  courseType={courseType}
                />
              </Box>
            );
          })}
        </Stack>
      </Paper>
    </Box>
  );
};

const PrerequisitesSection = ({
  enrollmentReqs,
  coursesReq,
}: {
  enrollmentReqs: string;
  coursesReq: string[][];
}) => {
  const [viewMode, setViewMode] = useState("expanded");
  const theme = useTheme();

  const hasStructuredReqs = Array.isArray(coursesReq) && coursesReq.length > 0;

  const getRelationTypes = () => {
    if (!enrollmentReqs) return Array(coursesReq.length).fill("and");

    const relations = [];
    for (let i = 0; i < coursesReq.length; i++) {
      if (i === 0) {
        relations.push("and");
        continue;
      }

      const orPattern = new RegExp(
        `(${coursesReq[i - 1].join("|")})\\s*(or|OR)\\s*(${coursesReq[i].join(
          "|"
        )})`,
        "i"
      );

      if (orPattern.test(enrollmentReqs)) {
        relations.push("or");
      } else {
        relations.push("and");
      }
    }
    return relations;
  };

  const relationTypes = getRelationTypes();

  return (
    <Box
      sx={{
        borderLeft: "3px solid",
        borderColor: "primary.main",
        pl: 1.5,
        pt: 1,
        pb: 2,
      }}
    >
      {hasStructuredReqs && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Stack
            direction="row"
            spacing={0}
            sx={{ borderRadius: "8px", overflow: "hidden" }}
          >
            <Button
              variant={"contained"}
              size="small"
              onClick={() => setViewMode("expanded")}
              startIcon={<TextIcon />}
              sx={{
                backgroundColor:
                  viewMode === "expanded"
                    ? theme.palette.primary.light
                    : theme.palette.grey[200],
                color: viewMode === "expanded" ? "white" : "black",
                ":hover": {
                  backgroundColor:
                    viewMode === "expanded"
                      ? theme.palette.primary.main
                      : theme.palette.grey[400],
                },
                borderRadius: "8px 0 0 8px",
                textTransform: "none",
                flex: 1,
              }}
            >
              All
            </Button>
            <Button
              variant={"contained"}
              size="small"
              onClick={() => setViewMode("text")}
              startIcon={<TextIcon />}
              sx={{
                backgroundColor:
                  viewMode === "text"
                    ? theme.palette.primary.light
                    : theme.palette.grey[200],
                color: viewMode === "text" ? "white" : "black",
                ":hover": {
                  backgroundColor:
                    viewMode === "text"
                      ? theme.palette.primary.main
                      : theme.palette.grey[400],
                },
                borderRadius: "0px",
                textTransform: "none",
                flex: 1,
              }}
            >
              Text
            </Button>
            <Button
              variant={"contained"}
              size="small"
              onClick={() => setViewMode("structured")}
              startIcon={<ListIcon />}
              sx={{
                backgroundColor:
                  viewMode === "structured"
                    ? theme.palette.primary.light
                    : theme.palette.grey[200],
                color: viewMode === "structured" ? "white" : "black",
                ":hover": {
                  backgroundColor:
                    viewMode === "structured"
                      ? theme.palette.primary.main
                      : theme.palette.grey[400],
                },
                borderRadius: "0 8px 8px 0",
                textTransform: "none",
                flex: 1,
              }}
            >
              List
            </Button>
          </Stack>
        </Box>
      )}

      <Collapse
        in={viewMode === "text" || viewMode === "expanded"}
        timeout={400}
        easing="cubic-bezier(0.4, 0, 0.2, 1)"
      >
        <Fade
          in={viewMode === "text" || viewMode === "expanded"}
          timeout={{ enter: 500, exit: 300 }}
        >
          <Typography
            variant="body1"
            sx={{ lineHeight: 1.8, mb: viewMode === "structured" ? 2 : 0 }}
          >
            {enrollmentReqs}
          </Typography>
        </Fade>
      </Collapse>

      {hasStructuredReqs && (
        <Collapse
          in={viewMode === "structured" || viewMode === "expanded"}
          timeout={400}
          easing="cubic-bezier(0.4, 0, 0.2, 1)"
        >
          <Fade
            in={viewMode === "structured" || viewMode === "expanded"}
            timeout={{ enter: 500, exit: 300 }}
          >
            <Box sx={{ mt: viewMode !== "structured" ? 2 : 0 }}>
              <Typography
                variant="subtitle1"
                sx={{
                  mb: 2,
                  fontWeight: 600,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  pb: 1,
                }}
              >
                Course Requirements (BETA)
              </Typography>
              <Stack spacing={0}>
                {coursesReq.map((group, index) => (
                  <RequirementGroup
                    key={index}
                    group={group}
                    index={index}
                    relationType={relationTypes[index]}
                  />
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
