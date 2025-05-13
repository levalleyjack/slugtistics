import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface ClassInputProps {
  onAddClass: (classCode: string) => void;
  onRemoveClass: (classCode: string) => void;
  classes: string[];
}

export const ClassInput = ({
  onAddClass,
  onRemoveClass,
  classes,
}: ClassInputProps) => {
  const [newClassInput, setNewClassInput] = useState("");

  const handleAddClass = () => {
    const cleanInput = newClassInput.trim().toUpperCase();
    if (cleanInput && !classes.includes(cleanInput)) {
      onAddClass(cleanInput);
      setNewClassInput("");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          placeholder="Add a new class"
          value={newClassInput}
          onChange={(e) => setNewClassInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddClass()}
          className="flex-grow"
        />
        <Button onClick={handleAddClass} className="w-full sm:w-auto">
          Add
        </Button>
      </div>

      {classes.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {classes.map((course) => (
            <Badge
              key={course}
              variant="secondary"
              className="flex items-center gap-1 cursor-pointer text-xs sm:text-sm"
              onClick={() => onRemoveClass(course)}
            >
              {course}
              <X className="h-3 w-3 sm:h-4 sm:w-4" />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};