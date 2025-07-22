import React, { useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { categories } from "../Constants";

interface CategoryType {
  id: string;
  name?: string;
  icon: React.ReactNode;
}

interface CategoryItemProps {
  category: CategoryType;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

const CategoryItem = ({
  category,
  isSelected,
  onSelect,
}: CategoryItemProps) => (
  <button
    onClick={() => onSelect(category.id)}
    className={cn(
      "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer",
      isSelected
        ? "bg-blue-50 text-blue-700 shadow-sm"
        : "hover:bg-gray-50 text-gray-700"
    )}
  >
    <div
      className={cn(
        "flex items-center justify-center w-8 h-8 rounded-md transition-colors",
        isSelected ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"
      )}
    >
      {category.icon}
    </div>

    <div className="flex flex-col items-start text-left">
      <span
        className={cn(
          "font-medium text-sm",
          isSelected ? "text-blue-700" : "text-gray-800"
        )}
      >

        {category.id === "AnyGE" ? category.name : category.id}
      </span>

      {category.name !=="All Courses" &&  (
        <span className="text-xs text-gray-500 line-clamp-1">
          {category.name}
        </span>
      )}
    </div>
  </button>
);

interface CategoryDrawerProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  selectedGE: string;
  setSelectedGE: (id: string) => void;
}

const CategoryDrawer: React.FC<CategoryDrawerProps> = ({
  isOpen,
  setIsOpen,
  selectedGE,
  setSelectedGE,
}) => {
  const navigate = useNavigate();
  const timeoutRef = useRef<NodeJS.Timeout>();

  const handleClose = useCallback(() => setIsOpen(false), [setIsOpen]);

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  const featuredCategories = categories?.slice?.(0, 1) || [];
  const remainingCategories = categories?.slice?.(1) || [];

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent
        side="left"
        className="w-64 backdrop-blur-md bg-white/95 dark:bg-slate-900/95 p-0 shadow-lg flex flex-col"
      >
        <SheetHeader className="px-4 pt-4 pb-2 flex-shrink-0">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-base font-semibold">
              GE Categories
            </SheetTitle>
          </div>
        </SheetHeader>

        <div className="flex-grow overflow-hidden">
          <ScrollArea className="h-full py-1">
            {featuredCategories.length > 0 && (
              <div className="mb-1">
                <div className="px-4 py-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Featured
                  </p>
                </div>
                <div className="px-2 space-y-1">
                  {featuredCategories.map((cat) => (
                    <CategoryItem
                      key={cat.id}
                      category={cat}
                      isSelected={selectedGE === cat.id}
                      onSelect={(id) => {
                        setSelectedGE(id);
                        navigate(`?ge=${id}`);
                        handleClose();
                      }}
                    />
                  ))}
                </div>
                <Separator className="my-2 mx-2" />
              </div>
            )}

            <div className="px-4 py-1">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                General Education
              </p>
            </div>

            <div className="px-2 py-1 grid grid-cols-1 gap-1">
              {remainingCategories.map((cat) => (
                <CategoryItem
                  key={cat.id}
                  category={cat}
                  isSelected={selectedGE === cat.id}
                  onSelect={(id) => {
                    setSelectedGE(id);
                    navigate(`?ge=${id}`);
                    handleClose();
                  }}
                />
              ))}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CategoryDrawer;