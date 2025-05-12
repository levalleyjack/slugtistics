import { motion } from "framer-motion";
import { MajorCourseCard } from "./MajorCourseCard";

interface CourseListProps {
  courses: string[];
  completedCourses: Set<string>;
  recommendedCourses: string[];
  onToggleCourse: (course: string) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.02,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export const CourseList = ({
  courses,
  completedCourses,
  recommendedCourses,
  onToggleCourse,
}: CourseListProps) => {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3"
    >
      {courses.map((course) => (
        <motion.div key={course} variants={cardVariants}>
          <MajorCourseCard
            course={course}
            isCompleted={completedCourses.has(course)}
            isRecommended={recommendedCourses.includes(course)}
            onToggle={onToggleCourse}
          />
        </motion.div>
      ))}
    </motion.div>
  );
};