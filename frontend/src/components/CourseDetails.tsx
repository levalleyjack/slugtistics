import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Check,
  Copy,
  RefreshCw,
  School,
  FileText,
  Info,
  Clock,
  MapPin,
  Users,
  Award,
  User,
  AlertTriangle,
  ChevronLeft,
  ExternalLink,
  BookOpen,
  Calendar,
  Building,
  GraduationCap,
  Bell,
  Share2,
  Heart,
  BookmarkPlus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { AnimatePresence, motion } from "framer-motion";
import { local } from "./GetGEData";
import { DiscussionSection } from "@/Constants";
import LocationMap from "./LocationComponent";
import { Tooltip } from "@mui/material";
import PrerequisitesSection from "./PrereqComponent";

// Type Definitions
export enum ClassStatusEnum {
  OPEN = "Open",
  CLOSED = "Closed",
  WAITLIST = "Wait List",
}

export type GradientType = {
  from: string;
  to: string;
  text: string;
};

export interface EnrollmentRequirements {
  description: string;
  courses: string[][];
}

export interface CourseData {
  description: string;
  class_notes: string;
  enrollment_reqs: EnrollmentRequirements;
  discussion_sections: DiscussionSection[];
}

export interface CourseApiResponse {
  success: boolean;
  message?: string;
  data?: CourseData;
}

export interface EnrollmentData {
  enrollment: string;
  waitlist: number | null;
}

export interface Course {
  subject: string;
  catalog_num: string;
  name: string;
  enroll_num: number;
  instructor: string;
  location: string;
  schedule: string;
  class_count: string;
  credits?: string;
  ge?: string;
  career?: string;
  class_status?: string;
  class_type?: string;
  grading?: string;
}

export interface CourseDetailsProps {
  course: Course | null;
  onClose?: () => void;
  maxWidth?: string;
}

// Utility functions
const isValidLocation = (location: string): boolean => {
  if (!location) return false;
  const invalidLocations = ["Online", "N/A", "Remote Instruction", "TBD"];
  return !invalidLocations.includes(location) && !location.includes("TBD");
};

const getStatusVariant = (
  status: string
): "success" | "warning" | "destructive" => {
  if (status.toLowerCase().includes("open")) return "success";
  if (status.toLowerCase().includes("wait list")) return "warning";
  return "destructive";
};

const getEnrollmentPercentage = (enrollment: string): number => {
  if (!enrollment.includes("/")) return 0;
  const [current, total] = enrollment.split("/").map(Number);
  if (isNaN(current) || isNaN(total) || total === 0) return 0;
  return Math.min(100, (current / total) * 100);
};

// Component for copying text to clipboard
const CopyButton: React.FC<{ copyString: string; tooltip?: string }> = ({
  copyString,
  tooltip = "Copy to clipboard",
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(copyString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Tooltip title={copied ? "Copied!" : tooltip} disableInteractive>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-md hover:bg-primary/10"
            onClick={handleCopy}
          >
            {copied ? (
              <Check size={14} className="text-green-500" />
            ) : (
              <Copy size={14} />
            )}
          </Button>
      </Tooltip>
  );
};

// Component for detail items
const DetailItem: React.FC<{
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  className?: string;
}> = ({ label, value, icon, className = "" }) => {
  if (!value) return null;

  return (
    <div className={`flex items-start gap-4 ${className}`}>
      <div className="text-primary mt-1 flex-shrink-0">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        <p className="text-sm font-medium break-words">{value}</p>
      </div>
    </div>
  );
};

export const CourseDetailsPanel: React.FC<CourseDetailsProps> = ({
  course,
  onClose,
  maxWidth = "100%",
}) => {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Enrollment data query
  const enrollmentQuery = useQuery({
    queryKey: [
      "enrollment",
      course?.subject,
      course?.catalog_num,
      course?.instructor,
      course?.enroll_num,
    ],
    queryFn: async (): Promise<EnrollmentData> => {
      try {
        const response = await fetch(
          `https://my.ucsc.edu/PSIGW/RESTListeningConnector/PSFT_CSPRD/SCX_CLASS_LIST.v1/2260?subject=${course?.subject}&catalog_nbr=${course?.catalog_num}`
        );
        const data = await response.json();

        if (!data.classes?.length)
          return { enrollment: course?.class_count || "0/0", waitlist: null };

        const matchingClass = data.classes.find((classInfo: any) => {
          return String(classInfo.class_nbr) === String(course?.enroll_num);
        });

        if (matchingClass) {
          return {
            enrollment: `${matchingClass.enrl_total}/${matchingClass.enrl_capacity}`,
            waitlist: parseInt(matchingClass.waitlist_total),
          };
        }

        return { enrollment: course?.class_count || "0/0", waitlist: null };
      } catch (error) {
        console.error(`Error fetching enrollment:`, error);
        return { enrollment: course?.class_count || "0/0", waitlist: null };
      }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: !!course,
  });

  // Course details query
  const courseDetailsQuery = useQuery({
    queryKey: ["courseDetails", course?.enroll_num],
    queryFn: async (): Promise<CourseApiResponse> => {
      if (!course?.enroll_num) {
        throw new Error("Invalid course enrollment number");
      }

      const response = await fetch(
        `${local}/course_details/${course.enroll_num}`,
        {
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch course details (${response.status})`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || "Failed to fetch course details");
      }

      return data as CourseApiResponse;
    },
    enabled: !!course?.enroll_num,
    retry: false,
  });

  const handleRefreshEnrollment = (e: React.MouseEvent) => {
    e.stopPropagation();
    enrollmentQuery.refetch();
  };

  const toggleSaved = () => {
    setIsSaved((prev) => !prev);
  };

  // Get valid badges for course
  const getValidBadges = () => {
    const badges = [];

    if (course?.credits) {
      badges.push({
        label: `${course.credits} Credits`,
        variant: "default",
      });
    }
    if (course?.ge) {
      badges.push({ label: course.ge, variant: "secondary" });
    }
    if (course?.career) {
      badges.push({ label: course.career, variant: "outline" });
    }
    if (course?.class_status) {
      badges.push({
        label: course.class_status,
        variant: getStatusVariant(course.class_status),
      });
    }
    return badges;
  };

  if (!course) {
    return (
      <div className="flex flex-col h-full w-full overflow-hidden bg-white dark:bg-gray-900">
        <Alert variant="destructive" className="m-4">
          <AlertDescription>No course data provided</AlertDescription>
        </Alert>
      </div>
    );
  }

  const enrollmentPercentage = getEnrollmentPercentage(
    enrollmentQuery.data?.enrollment || "0/0"
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col h-full w-full overflow-hidden bg-white dark:bg-gray-900 rounded-xl"
      style={{ maxWidth }}
    >
      {/* Modern Header with Blurred Background */}
      <div className="sticky top-0 z-10 border-b px-4 py-5 backdrop-blur-md bg-white/80 dark:bg-gray-900/80">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-start gap-2 mb-4">
            <div className="flex items-center gap-2">
              {onClose && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full h-8 w-8 bg-white/90 shadow-sm hover:shadow-md transition-all duration-200"
                  onClick={onClose}
                >
                  <ChevronLeft size={16} />
                </Button>
              )}

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold md:text-3xl break-words tracking-tight">
                    {course.subject} {course.catalog_num}
                  </h1>
                  <CopyButton
                    copyString={String(course.enroll_num)}
                    tooltip="Copy Enrollment Number"
                  />
                </div>
                {course.name && (
                  <p className="text-lg text-muted-foreground mt-1 break-words max-w-xl">
                    {course.name}
                  </p>
                )}
              </div>
            </div>

            {/* <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full h-8 w-8 hover:bg-primary/10 transition-all duration-200"
                onClick={toggleSaved}
              >
                {isSaved ? (
                  <Heart size={16} className="fill-red-500 text-red-500" />
                ) : (
                  <Heart size={16} />
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="rounded-full h-8 w-8 hover:bg-primary/10 transition-all duration-200"
              >
                <Share2 size={16} />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="rounded-full h-8 w-8 hover:bg-primary/10 transition-all duration-200"
              >
                <BookmarkPlus size={16} />
              </Button>
            </div> */}
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {getValidBadges().map((badge, index) => (
              <Badge
                key={index}
                variant={badge.variant as any}
                className="px-3 py-1 text-sm rounded-full shadow-sm"
              >
                {badge.label}
              </Badge>
            ))}
          </div>

          {/* Tabbed Navigation */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
            <TabsList className="grid grid-cols-3 sm:w-fit">
              <TabsTrigger value="overview" className="gap-2 cursor-pointer">
                <Info size={16} />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="details" className="gap-2 cursor-pointer">
                <FileText size={16} />
                <span className="hidden sm:inline">Details</span>
              </TabsTrigger>
              <TabsTrigger value="sections" className="gap-2 cursor-pointer">
                <Users size={16} />
                <span className="hidden sm:inline">Sections</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Content */}
      <div className="flex-grow overflow-auto">
        <div className="max-w-6xl mx-auto px-4 py-6">
          {courseDetailsQuery.isLoading ? (
            <div className="space-y-8">
              <div className="flex flex-col space-y-3">
                <Skeleton className="h-8 w-[250px]" />
                <Skeleton className="h-4 w-[300px]" />
              </div>

              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-40 w-full rounded-xl" />
                ))}
              </div>
            </div>
          ) : courseDetailsQuery.isError ? (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>
                {courseDetailsQuery.error instanceof Error
                  ? courseDetailsQuery.error.message
                  : "Failed to load course details"}
              </AlertDescription>
            </Alert>
          ) : (
            <AnimatePresence mode="sync">
              {activeTab === "overview" && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-8"
                >
                  {/* Course Summary Card */}
                  <Card className="overflow-hidden border-none shadow-lg">
                    <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-1 flex flex-col items-center justify-center p-4 bg-white/90 dark:bg-gray-800/90 rounded-xl shadow-sm">
                          <User size={20} className="text-primary mb-2" />
                          <p className="text-sm text-muted-foreground">
                            Instructor
                          </p>
                          <p className="text-lg font-semibold text-center">
                            {course.instructor}
                          </p>
                        </div>

                        <div className="space-y-1 flex flex-col items-center justify-center p-4 bg-white/90 dark:bg-gray-800/90 rounded-xl shadow-sm">
                          <Clock size={20} className="text-primary mb-2" />
                          <p className="text-sm text-muted-foreground">
                            Schedule
                          </p>
                          <p className="text-lg font-semibold text-center">
                            {course.schedule}
                          </p>
                        </div>

                        <div className="space-y-1 flex flex-col items-center justify-center p-4 bg-white/90 dark:bg-gray-800/90 rounded-xl shadow-sm">
                          <MapPin size={20} className="text-primary mb-2" />
                          <p className="text-sm text-muted-foreground">
                            Location
                          </p>
                          <p className="text-lg font-semibold text-center">
                            {course.location.split(":")[1]?.trim() || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <CardContent className="p-6">
                      <div className="space-y-6">
                        {/* Enrollment Progress */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Users size={18} className="text-primary" />
                              <h3 className="text-base font-semibold">
                                Enrollment Status
                              </h3>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 rounded-md hover:bg-primary/10"
                              onClick={handleRefreshEnrollment}
                            >
                              <RefreshCw
                                size={14}
                                className={
                                  enrollmentQuery.isLoading
                                    ? "animate-spin mr-2"
                                    : "mr-2"
                                }
                              />
                              Refresh
                            </Button>
                          </div>

                          <Progress
                            value={enrollmentPercentage}
                            className="h-2"
                          />

                          <div className="flex justify-between items-center mt-1">
                            <p className="text-sm text-muted-foreground">
                              {enrollmentQuery.isLoading
                                ? "Loading..."
                                : `${
                                    enrollmentQuery.data?.enrollment || "0/0"
                                  } students enrolled`}
                            </p>

                            {!enrollmentQuery.isLoading &&
                              enrollmentQuery.data?.waitlist !== null &&
                              enrollmentQuery.data.waitlist > 0 && (
                                <p className="text-sm font-medium text-amber-600 flex items-center gap-1">
                                  <AlertTriangle size={14} />
                                  {enrollmentQuery.data.waitlist} on waitlist
                                </p>
                              )}
                          </div>
                        </div>

                        {/* Description */}
                        {courseDetailsQuery.data?.data?.description && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <BookOpen size={18} className="text-primary" />
                              <h3 className="text-base font-semibold">
                                Course Description
                              </h3>
                            </div>
                            <p className="text-sm leading-relaxed">
                              {courseDetailsQuery.data.data.description}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Prerequisites & Requirements */}
                  {courseDetailsQuery.data?.data?.enrollment_reqs
                    .description && (
                    <Card className="overflow-hidden border-none shadow-lg">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <GraduationCap size={18} className="text-primary" />
                          <h3 className="text-base font-semibold">
                            Prerequisites & Requirements
                          </h3>
                        </div>
                        <PrerequisitesSection
                          enrollmentReqs={
                            courseDetailsQuery.data.data.enrollment_reqs
                              .description
                          }
                          coursesReq={
                            courseDetailsQuery.data.data.enrollment_reqs.courses
                          }
                        />
                      </CardContent>
                    </Card>
                  )}

                  {/* Class Notes */}
                  {courseDetailsQuery.data?.data?.class_notes && (
                    <Card className="overflow-hidden border-none shadow-lg">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <FileText size={18} className="text-primary" />
                          <h3 className="text-base font-semibold">
                            Class Notes
                          </h3>
                        </div>
                        <p className="text-sm leading-relaxed">
                          {courseDetailsQuery.data.data.class_notes}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </motion.div>
              )}

              {activeTab === "details" && (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-8"
                >
                  <Card className="overflow-hidden border-none shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-6">
                        <Info size={18} className="text-primary" />
                        <h3 className="text-lg font-semibold">
                          Course Details
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                          <DetailItem
                            label="Course Code"
                            value={`${course.subject} ${course.catalog_num}`}
                            icon={<BookOpen size={16} />}
                          />

                          <DetailItem
                            label="Course Name"
                            value={course.name}
                            icon={<FileText size={16} />}
                          />

                          <DetailItem
                            label="Instructor"
                            value={course.instructor}
                            icon={<User size={16} />}
                          />

                          <DetailItem
                            label="Enrollment Number"
                            value={
                              <div className="flex items-center gap-2">
                                <span>{course.enroll_num}</span>
                                <CopyButton
                                  copyString={String(course.enroll_num)}
                                />
                              </div>
                            }
                            icon={<Info size={16} />}
                          />

                          <DetailItem
                            label="Credits"
                            value={course.credits}
                            icon={<Award size={16} />}
                          />
                        </div>

                        <div className="space-y-6">
                          <DetailItem
                            label="Class Type"
                            value={course.class_type}
                            icon={<School size={16} />}
                          />

                          <DetailItem
                            label="Meeting Times"
                            value={course.schedule}
                            icon={<Calendar size={16} />}
                          />

                          <DetailItem
                            label="Location"
                            value={
                              <>
                                <span>
                                  {course.location.split(":")[1]?.trim()}
                                </span>
                                {isValidLocation(
                                  course.location.split(":")[1]?.trim()
                                ) && (
                                  <div className="mt-4">
                                    <LocationMap
                                      location={course.location
                                        .split(":")[1]
                                        ?.trim()}
                                    />
                                  </div>
                                )}
                              </>
                            }
                            icon={<Building size={16} />}
                          />

                          <DetailItem
                            label="Grading Type"
                            value={course.grading}
                            icon={<Award size={16} />}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {activeTab === "sections" && (
                <motion.div
                  key="sections"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  {courseDetailsQuery.data?.data?.discussion_sections &&
                  courseDetailsQuery.data.data.discussion_sections.length >
                    0 ? (
                    <>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users size={20} className="text-primary" />
                          <h3 className="text-lg font-semibold">
                            Discussion Sections
                          </h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {
                            courseDetailsQuery.data.data.discussion_sections
                              .length
                          }{" "}
                          sections available
                        </p>
                      </div>

                      <div className="space-y-4">
                        {courseDetailsQuery.data.data.discussion_sections.map(
                          (section, index) => (
                            <Card
                              key={index}
                              className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow duration-200"
                            >
                              <div
                                className={`h-2 w-full ${
                                  section.class_status
                                    .toLowerCase()
                                    .includes("open")
                                    ? "bg-green-500"
                                    : section.class_status
                                        .toLowerCase()
                                        .includes("wait list")
                                    ? "bg-amber-500"
                                    : "bg-red-500"
                                }`}
                              />

                              <CardContent className="p-6">
                                <div className="flex flex-col sm:flex-row justify-between mb-4">
                                  <div className="flex items-center gap-3">
                                    <div className="flex items-center">
                                      <h4 className="text-primary text-lg font-semibold">
                                        {section.code}
                                      </h4>
                                      <CopyButton
                                        copyString={section.enroll_num.toString()}
                                        tooltip="Copy Enrollment Number"
                                      />
                                    </div>

                                    <Badge
                                      variant={getStatusVariant(
                                        section.class_status
                                      )}
                                    >
                                      {section.class_status}
                                    </Badge>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="space-y-4">
                                    <div className="flex gap-3 items-center bg-muted/50 p-3 rounded-lg">
                                      <User
                                        size={16}
                                        className="text-primary"
                                      />
                                      <div>
                                        <p className="text-xs text-muted-foreground">
                                          Instructor
                                        </p>
                                        <p className="text-sm font-medium">
                                          {section.instructor}
                                        </p>
                                      </div>
                                    </div>

                                    <div className="flex gap-3 items-center bg-muted/50 p-3 rounded-lg">
                                      <Clock
                                        size={16}
                                        className="text-primary"
                                      />
                                      <div>
                                        <p className="text-xs text-muted-foreground">
                                          Schedule
                                        </p>
                                        <p className="text-sm font-medium">
                                          {section.schedule}
                                        </p>
                                      </div>
                                    </div>

                                    <div className="flex gap-3 items-center bg-muted/50 p-3 rounded-lg">
                                      <MapPin
                                        size={16}
                                        className="text-primary"
                                      />
                                      <div>
                                        <p className="text-xs text-muted-foreground">
                                          Location
                                        </p>
                                        <p className="text-sm font-medium">
                                          {section.location}
                                        </p>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex flex-col gap-4">
                                    <div className="bg-primary/5 p-4 rounded-lg shadow-sm">
                                      <div className="flex justify-between items-center mb-3">
                                        <div className="flex items-center gap-2">
                                          <Users
                                            size={18}
                                            className="text-primary"
                                          />
                                          <h4 className="font-medium">
                                            Enrollment
                                          </h4>
                                        </div>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-8 w-8 p-0"
                                          onClick={handleRefreshEnrollment}
                                        >
                                          <RefreshCw
                                            size={14}
                                            className={
                                              enrollmentQuery.isLoading
                                                ? "animate-spin"
                                                : ""
                                            }
                                          />
                                        </Button>
                                      </div>

                                      <Progress
                                        value={getEnrollmentPercentage(
                                          section.class_count
                                        )}
                                        className="h-2 mb-2"
                                      />

                                      <div className="flex justify-between text-sm">
                                        <span>
                                          {section.class_count} enrolled
                                        </span>
                                        <span className="text-muted-foreground">
                                          {getEnrollmentPercentage(
                                            section.class_count
                                          ).toFixed(0)}
                                          %
                                        </span>
                                      </div>
                                    </div>

                                    {section.wait_count &&
                                      parseInt(section.wait_count) > 0 && (
                                        <div className="bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200 p-4 rounded-lg flex items-center gap-3">
                                          <AlertTriangle
                                            size={18}
                                            className="text-amber-500"
                                          />
                                          <div>
                                            <p className="font-medium">
                                              {section.wait_count} students on
                                              waitlist
                                            </p>
                                            <p className="text-sm opacity-80 mt-1">
                                              You may experience delays in
                                              enrollment
                                            </p>
                                          </div>
                                        </div>
                                      )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )
                        )}
                      </div>
                    </>
                  ) : (
                    <Card className="border-none shadow-lg">
                      <CardContent className="p-6 flex flex-col items-center justify-center py-12">
                        <div className="bg-muted/50 p-4 rounded-full mb-4">
                          <Users size={24} className="text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">
                          No Discussion Sections
                        </h3>
                        <p className="text-sm text-muted-foreground text-center max-w-md">
                          This course doesn't have any discussion sections
                          available or they haven't been published yet.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          )}

          {/* Call to Action */}
          <div className="mt-10 py-8">
            <Card className="border-none overflow-hidden shadow-xl bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                  <div className="md:col-span-2 space-y-4">
                    <h3 className="text-xl font-bold">
                      Ready to enroll in this course?
                    </h3>
                    <p className="text-muted-foreground">
                      Register for this course on the official university portal
                      to secure your spot. Get early access to course materials
                      and connect with your instructor.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <Button
                        size="lg"
                        className="gap-2 shadow-md hover:shadow-lg"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(
                            "https://my.ucsc.edu/psp/csprd/EMPLOYEE/SA/c/SA_LEARNER_SERVICES.SSR_SSENRL_CART.GBL?PORTALPARAM_PTCNAV=HC_SSR_SSENRL_CART_GBL&EOPP.SCNode=SA&EOPP.SCPortal=EMPLOYEE&EOPP.SCName=UCSC_MOBILE_ENROLL&EOPP.SCLabel=&EOPP.SCPTcname=PT_PTPP_SCFNAV_BASEPAGE_SCR&FolderPath=PORTAL_ROOT_OBJECT.PORTAL_BASE_DATA.CO_NAVIGATION_COLLECTIONS.UCSC_MOBILE_ENROLL.ADMN_S201704121458063536484878&IsFolder=false%22&PortalKeyStruct=yes",
                            "_blank"
                          );
                        }}
                      >
                        <ExternalLink size={16} />
                        Register Now
                      </Button>
                    </div>
                  </div>
                  <div className="hidden md:flex justify-center">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-full shadow-lg">
                      <GraduationCap
                        size={80}
                        className="text-primary opacity-80"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
