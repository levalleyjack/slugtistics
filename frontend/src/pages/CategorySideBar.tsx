import React, { useCallback, memo } from "react";
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { categories } from "../Colors.tsx";

const StyledListItem = styled(ListItem)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  margin: theme.spacing(0.5),
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
  "&.selected": {
    backgroundColor: `${theme.palette.primary.light}`,
    color: theme.palette.primary.contrastText,
    "& .MuiListItemIcon-root": {
      color: theme.palette.primary.main,
    },
  },
}));

const CategoryItem = memo(({ category, isSelected, onSelect }) => {
  const handleClick = useCallback(() => {
    onSelect(category.id);
  }, [category.id, onSelect]);

  const displayText = category.name
    ? `${category.id} - ${category.name}`
    : category.id;

  return (
    <StyledListItem
      className={isSelected ? "selected" : ""}
      onClick={handleClick}
    >
      <ListItemIcon sx={{ minWidth: 40 }}>{category.icon}</ListItemIcon>
      <ListItemText
        primary={
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            {displayText}
          </Typography>
        }
      />
    </StyledListItem>
  );
});

CategoryItem.displayName = "CategoryItem";

const Sidebar = styled("div")(({ theme }) => ({
  width: 280,
  backgroundColor: theme.palette.background.paper,
  height: "100%",
  borderRight: `1px solid ${theme.palette.divider}`,
}));

export const CategorySidebar = memo(
  ({ selectedCategory, onCategorySelect }) => {
    return (
      <Sidebar>
        <List sx={{ p: 1 }}>
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

CategorySidebar.displayName = "CategorySidebar";
