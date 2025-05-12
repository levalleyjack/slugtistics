import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Plus } from "lucide-react";
import { motion } from "framer-motion";

interface MajorCourseCard {
  course: string;
  isCompleted: boolean;
  isRecommended: boolean;
  onToggle: (course: string) => void;
}

export const MajorCourseCard = ({ 
  course, 
  isCompleted, 
  isRecommended, 
  onToggle 
}: MajorCourseCard) => {
  return (
    <motion.div className="w-full">
      <Card
        className={`cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg ${
          isCompleted
            ? "bg-emerald-100 border-emerald-400"
            : isRecommended
            ? "bg-yellow-100 border-yellow-400"
            : "border-muted"
        }`}
        onClick={() => onToggle(course)}
      >
        <CardContent className="flex items-center justify-between p-4">
          <span className="font-medium">{course}</span>
          {isCompleted ? (
            <CheckCircle className="h-5 w-5 text-emerald-600" />
          ) : (
            <Plus className="h-5 w-5 text-muted-foreground" />
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};