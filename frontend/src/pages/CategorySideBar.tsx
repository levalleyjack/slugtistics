import React, { useCallback, memo } from "react";
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { categories } from "../Colors";

interface Category {
  id: string;
  name?: string;
  icon: React.ReactNode;
}

interface CategoryItemProps {
  category: Category;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

interface CategorySidebarProps {
  selectedCategory: string;
  onCategorySelect: (id: string) => void;
}

const StyledListItem = styled(ListItem)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  margin: theme.spacing(0.1),
  transition: "all 0.2s ease",
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
    cursor: "pointer",
  },
  "&.selected": {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
    "& .MuiListItemIcon-root": {
      color: theme.palette.primary.main,
    },
  },
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1),
    margin: theme.spacing(0.1),
  },
}));

const Sidebar = styled("div")(({ theme }) => ({
  width: "100% - 1px",
  height: "100%",
  borderRight: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  [theme.breakpoints.down("sm")]: {
    maxWidth: "100%",
    borderRight: "none",
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
}));

const CategoryItem: React.FC<CategoryItemProps> = memo(
  ({ category, isSelected, onSelect }) => {
    const handleClick = useCallback(() => {
      onSelect(category.id);
    }, [category.id, onSelect]);

    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

    const displayText = category.name
      ? `${category.id} - ${category.name}`
      : category.id;

    return (
      <StyledListItem
        className={isSelected ? "selected" : ""}
        onClick={handleClick}
        dense={isSmallScreen}
      >
        <ListItemIcon sx={{ minWidth: 40 }}>{category.icon}</ListItemIcon>
        <ListItemText
          primary={
            <Typography
              variant={isSmallScreen ? "body2" : "body1"}
              sx={{ fontWeight: 500 }}
            >
              {displayText}
            </Typography>
          }
        />
      </StyledListItem>
    );
  }
);

CategoryItem.displayName = "CategoryItem";

export const CategorySidebar: React.FC<CategorySidebarProps> = memo(
  ({ selectedCategory, onCategorySelect }) => {
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

    return (
      <Sidebar>
        <List
          sx={{
            p: isSmallScreen ? 0.5 : 1,
            display: "flex",
            flexDirection: isSmallScreen ? "column" : "column",
            overflowX: isSmallScreen ? "auto" : "visible",
          }}
        >
          {categories.map((category) => (
            <CategoryItem
              key={category.id}
              category={category}
              isSelected={selectedCategory === category.id}
              onSelect={onCategorySelect}
            />
          ))}
        </List>
      </Sidebar>
    );
  }
);
