import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import {
  Github,
  BarChart3,
  UserCheck,
  MapPin,
  CalendarClock,
} from "lucide-react";
import { cn } from "@/lib/utils";

const prompts = [
  "Compare instructors before enrolling",
  "Track GPA trends over time",
  "Find out which profs teach better",
  "Plan your quarter with confidence",
];

export default function AboutPage() {
  const [currentPrompt, setCurrentPrompt] = useState(0);
  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 300], [0, -100]);
  const bgYSmooth = useSpring(bgY, { damping: 20, stiffness: 100 });

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPrompt((prev) => (prev + 1) % prompts.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full overflow-hidden font-[var(--font-geist)]">
      {/* Scroll-reactive background */}
      <motion.div
        style={{ y: bgYSmooth }}
        className="fixed top-0 left-0 w-full h-[calc(100dvh+164px)] bg-[url('/logoBackground.svg')] bg-contain bg-center opacity-10 z-0 pointer-events-none"
        aria-hidden
      />

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex flex-col justify-center items-center text-center px-4 py-20">
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl sm:text-5xl font-extrabold tracking-tight"
        >
          <span className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 bg-clip-text text-transparent">
            Slugtistics
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-muted-foreground mt-4 max-w-xl text-base sm:text-lg"
        >
          Slugtistics is a free, student-built tool that makes it easy to
          explore UCSC GPA trends, instructor ratings, class locations, and more
          — all in one searchable dashboard.
        </motion.p>

        <motion.p
          key={currentPrompt}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-sm text-muted-foreground mt-3"
        >
          {prompts[currentPrompt]}
        </motion.p>
      </section>
      {/* Feature Highlights */}
      <section className="relative z-10 px-4 py-24 bg-background">
        <div className="max-w-6xl mx-auto space-y-32">
          {[
            {
              src: "/distribution_example.png",
              title: "Distribution Explorer",
              desc: "Search any class and instantly view historical GPA distributions for every instructor and every quarter offered.",
              reverse: false,
            },
            {
              src: "/class-search_example.png",
              title: "Class Search",
              desc: "Search across all UCSC courses, including GE and non-GE options. Filter by multiple GEs, class types, prerequisites, instructor quality, and more — all with GPA distributions and student ratings at your fingertips.",
              reverse: true,
            },

            {
              src: "/major-planner_example.png",
              title: "Major Planner",
              desc: "Input your transcript, choose your major, and get recommended classes based on the ones you’ve completed.",
              reverse: true,
            },
          ].map(({ src, title, desc, reverse }, idx) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              viewport={{ once: true }}
              className={cn(
                "flex flex-col items-center gap-10 sm:gap-16 lg:gap-20 lg:flex-row",
                reverse && "lg:flex-row-reverse"
              )}
            >
              <img
                src={src}
                alt={`${title} preview`}
                className="w-full max-w-xl rounded-xl shadow-lg border"
              />
              <div className="max-w-lg space-y-4 text-center lg:text-left">
                <h3 className="text-2xl sm:text-3xl font-semibold text-primary">
                  {title}
                </h3>
                <p className="text-muted-foreground text-base sm:text-lg">
                  {desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Details Section */}
      <section id="details" className="scroll-mt-24 px-4 py-16 relative z-10">
        <div className="max-w-5xl mx-auto text-center space-y-16">
          {/* Origin */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Where’s the data from?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left text-muted-foreground max-w-4xl mx-auto text-base leading-relaxed">
              <div className="flex items-start gap-3">
                <BarChart3 className="text-primary mt-1" />
                <div>
                  <h4 className="text-primary font-semibold mb-1">
                    Grade Data
                  </h4>
                  <p>
                    Acquired through the California Public Records Act (CPRA),
                    cleaned and indexed.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <UserCheck className="text-primary mt-1" />
                <div>
                  <h4 className="text-primary font-semibold mb-1">
                    Instructor Reviews
                  </h4>
                  <p>
                    Pulled from RateMyProfessors to give you a clear view of
                    teaching styles, ratings, and student feedback.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="text-primary mt-1" />
                <div>
                  <h4 className="text-primary font-semibold mb-1">
                    Class Locations
                  </h4>
                  <p>
                    Mapped using Google Maps to help you quickly locate lecture
                    halls and building clusters across campus.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CalendarClock className="text-primary mt-1" />
                <div>
                  <h4 className="text-primary font-semibold mb-1">
                    Live Enrollment
                  </h4>
                  <p>
                    Connected to UCSC’s live registration system, updated live
                    to reflect seat availability in real time.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="p-2">
              <h3 className="text-2xl font-bold text-primary">3,000+</h3>
              <p className="text-muted-foreground">Courses Stored</p>
            </div>
            <div className="p-2">
              <h3 className="text-2xl font-bold text-primary">
                Fall 2019 → Spring 2024
              </h3>
              <p className="text-muted-foreground">Historical GPA Data</p>
            </div>
            <div className="p-2">
              <h3 className="text-2xl font-bold text-primary">
                100% Student-Made
              </h3>
              <p className="text-muted-foreground">
                By UCSC students, For UCSC
              </p>
            </div>
          </motion.div>

          {/* Team */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="mt-12"
          >
            <h3 className="text-xl font-semibold mb-4">Team</h3>
            <ul className="text-muted-foreground space-y-2 text-sm">
              <li>
                Creator:{" "}
                <a
                  href="https://www.linkedin.com/in/jack-levalley/"
                  className="text-blue-600 underline underline-offset-4 hover:text-blue-800"
                  target="_blank"
                  rel="noreferrer"
                >
                  Jack LeValley
                </a>{" "}
                (Discord: <b>eggw</b>)
              </li>
              <li>
                Class Search:{" "}
                <a
                  href="https://www.linkedin.com/in/ashwinsm10/"
                  className="text-blue-600 underline underline-offset-4 hover:text-blue-800"
                  target="_blank"
                  rel="noreferrer"
                >
                  Ashwin Murthy
                </a>
              </li>
              <li>
                Major Search:{" "}
                <a
                  href="https://www.linkedin.com/in/saish-pottabathula/"
                  className="text-blue-600 underline underline-offset-4 hover:text-blue-800"
                  target="_blank"
                  rel="noreferrer"
                >
                  Saish Pottabathula
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/levalleyjack/slugtistics"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-border transition-colors hover:bg-muted/30"
                  aria-label="GitHub Repository"
                >
                  <Github className="w-5 h-5 text-blue-600" />
                </a>
              </li>
            </ul>
          </motion.div>

          <Separator className="my-8 max-w-xs mx-auto" />

          <p className="text-xs text-muted-foreground">
            Slugtistics is not affiliated with the University of California.
          </p>
        </div>
      </section>
    </div>
  );
}
