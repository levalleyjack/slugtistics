import React, { useCallback, memo, useRef } from "react";
import {
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { categories, CategoryDrawerProps, CategoryItemProps, CategorySidebarProps, COLORS } from "../Constants";
import { ArrowForward } from "@mui/icons-material";


const StyledListItem = styled(ListItem)(({ theme }) => ({
  borderRadius: "8px",
  margin: theme.spacing(0.5, 1),
  padding: theme.spacing(1.5, 2),
  transition: "all 0.2s ease",
  width: "auto",
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
    cursor: "pointer",
  },
  "&.selected": {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    "& .MuiListItemIcon-root": {
      color: theme.palette.primary.contrastText,
    },
    "& .MuiTypography-root": {
      color: theme.palette.primary.contrastText,
    },
    "&:hover": {
      backgroundColor: theme.palette.primary.dark,
    },
  },
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1, 1.5),
    margin: theme.spacing(0.3, 0.5),
  },
}));

const CategoryContent = styled("div")({
  width: "100%",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
});

const DrawerHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",

  padding: `calc(${theme.spacing(2)} + 2px)`,
  borderBottom: `1px solid ${theme.palette.divider}`,
  backgroundColor: COLORS.WHITE,
}));

const HoverTrigger = styled(Box)(({ theme }) => ({
  position: "fixed",
  left: 0,
  top: 0,
  width: "8px",
  height: "100dvh",
  backgroundColor: "transparent",
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
  transition: "background-color 200ms",
  zIndex:100,
  display: "block",
}));

const StyledList = styled(List)(({ theme }) => ({
  padding: theme.spacing(1, 0),
  flex: 1,
  overflowY: "auto",
  overflowX: "hidden",
  "&::-webkit-scrollbar": {
    width: "7px",
  },
  "&::-webkit-scrollbar-track": {
    background: "transparent",
  },
  "&::-webkit-scrollbar-thumb": {
    background: theme.palette.divider,
    borderRadius: "4px",
  },
  "&::-webkit-scrollbar-thumb:hover": {
    background: theme.palette.action.hover,
  },
}));

const CategoryItem = memo(
  ({ category, isSelected, onSelect }: CategoryItemProps) => {
    const handleClick = useCallback(() => {
      onSelect(category.id);
    }, [category.id, onSelect]);

    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

    return (
      <StyledListItem
        className={isSelected ? "selected" : ""}
        onClick={handleClick}
        dense={isSmallScreen}
      >
        <ListItemIcon
          sx={{ minWidth: 40, color: theme.palette.text.secondary }}
        >
          {category.icon}
        </ListItemIcon>
        <ListItemText
          primary={
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                color: theme.palette.text.primary,
                whiteSpace: "normal",
                wordBreak: "break-word",
              }}
            >
              {category.id}
              {category.name ? ` - ${category.name}` : ""}
            </Typography>
          }
          sx={{ margin: 0 }}
        />
      </StyledListItem>
    );
  }
);

const CategoriesList = memo(({ selectedCategory, onCategorySelect }: any) => (
  <StyledList>
    {categories.map((category, index) => (
      <React.Fragment key={category.id}>
        <CategoryItem
          category={category}
          isSelected={selectedCategory === category.id}
          onSelect={onCategorySelect}
        />
        {index === 0 && <Divider sx={{ my: 1, mx: 2 }} />}
      </React.Fragment>
    ))}
  </StyledList>
));

const CategorySidebar = memo(
  ({ selectedCategory, onCategorySelect }: CategorySidebarProps) => {
    return (
      <CategoryContent>
        <CategoriesList
          selectedCategory={selectedCategory}
          onCategorySelect={onCategorySelect}
        />
      </CategoryContent>
    );
  }
);
const CategoryDrawer = ({
  isOpen,
  isCategoriesVisible,
  isCategoryDrawer,
  isDistributionDrawer,
  selectedGE,
  setSelectedGE,
  setIsOpen,
  setIsCategoriesVisible,
  activePanel,
}: CategoryDrawerProps) => {
  const theme = useTheme();

  const timeoutRef = useRef<NodeJS.Timeout>();
  const isMediumScreen = useMediaQuery(theme.breakpoints.down("md"));

  const handleClose = () => {
    setIsCategoriesVisible(false);
    setIsOpen(false);
  };

  const handleMouseEnter = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsOpen(true);
  }, [setIsOpen]);

  const handleMouseLeave = useCallback(() => {
    if (!isCategoryDrawer) {
      timeoutRef.current = setTimeout(() => {
        setIsOpen(false);
        timeoutRef.current = undefined;
      }, 150);
    }
  }, [isCategoryDrawer, setIsOpen]);

  const isTemporary = !isCategoriesVisible || isCategoryDrawer;
  const variant = isTemporary ? "temporary" : "persistent";

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <Box sx={{ position: "relative" }}>
      {!isCategoryDrawer && (
        <HoverTrigger
          onMouseEnter={handleMouseEnter}
          sx={{ display: isCategoryDrawer ? "none" : "block" }}
        />
      )}
      <Drawer
        variant={variant}
        anchor="left"
        open={
          (isOpen || isCategoriesVisible) &&
          (!isDistributionDrawer || !activePanel)
        }
        onClose={handleClose}
        SlideProps={{
          onMouseEnter: handleMouseEnter,
          onMouseLeave: handleMouseLeave,
        }}
        sx={{
          width:
            isOpen || isCategoriesVisible ? (isCategoryDrawer ? 240 : 300) : 0,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            marginTop: "64px",
            width: isCategoryDrawer ? 240 : 300,
            height: "calc(100dvh - 64px)",
            boxSizing: "border-box",
            borderTopRightRadius: !isTemporary ? 0 : "8px",
            borderBottomRightRadius: !isTemporary ? 0 : "8px",
            opacity: 0.96,
            backdropFilter: "blur(8px)",
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            WebkitBackdropFilter: "blur(8px)",
            overflow: "hidden",
          },
          "& .MuiDrawer-root": {
            overflowX: "hidden",
          },
        }}
      >
        <DrawerHeader>
          <Typography variant="h6" fontWeight="500">
            Categories
          </Typography>
          {isCategoryDrawer && (
            <IconButton
              edge="end"
              onClick={handleClose}
              size="small"
              sx={{ borderRadius: "8px" }}
            >
              <ArrowForward />
            </IconButton>
          )}
        </DrawerHeader>

        <CategorySidebar
          selectedCategory={selectedGE}
          onCategorySelect={setSelectedGE}
          isOpen={isCategoriesVisible}
        />
      </Drawer>
    </Box>
  );
};

export default CategoryDrawer;
