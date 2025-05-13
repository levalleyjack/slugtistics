import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Notification } from "@/components/Notification";
import { motion } from "framer-motion";
import { useReward } from "react-rewards";
import { Flag } from "lucide-react";

const FeedbackButton = () => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [feedback, setFeedback] = useState("");
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationType, setNotificationType] =
    useState<"success" | "error">("success");
  const [notificationMessage, setNotificationMessage] = useState("");
  const [isEmailTouched, setIsEmailTouched] = useState(false);

  // confetti reward
  const { reward, isAnimating } = useReward("rewardId", "confetti");

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailRegex.test(email);
  const isEmailFieldValid = email.trim() !== "" && isEmailValid;

  const handleSubmit = async () => {
    if (!feedback.trim() || !isEmailFieldValid || isAnimating) return;
    reward();

    try {
      const res = await fetch(
        "https://formsubmit.co/ajax/ashwinsm10@gmail.com",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            message: feedback,
            _captcha: false,
          }),
        }
      );
      if (!res.ok) throw new Error("Submission failed");

      setNotificationType("success");
      setNotificationMessage(
        "Thank you so much! Your feedback helps improve Slugtistics."
      );
      setNotificationOpen(true);

      // reset form
      setOpen(false);
      setName("");
      setEmail("");
      setFeedback("");
      setIsEmailTouched(false);
    } catch (err) {
      setNotificationType("error");
      setNotificationMessage(
        "Oops, something went wrong. Please try again later."
      );
      setNotificationOpen(true);
    }
  };

  return (
    <>
      <motion.button
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        onClick={() => setOpen(true)}
        aria-label="Give Feedback"
        className="cursor-pointer fixed bottom-6 right-6 z-50 flex items-center gap-2
        bg-gradient-to-br from-[#ffd700] via-[#ffc107] to-[#e0a800]
        text-black font-semibold
        hover:from-[#ffdc32] hover:via-[#ffc107] hover:to-[#d39e00]
        active:translate-y-0 active:shadow-sm
        transition-all duration-200 ease-out
        rounded-full
        px-3 py-3
        shadow-md hover:shadow-xl
        hover:-translate-y-1
        backdrop-blur-md
        animate-glow-gold"
      >
        <Flag className="w-7 h-7" />
      </motion.button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md w-full bg-background rounded-xl shadow-2xl p-0 overflow-hidden border-none">
          <div className="flex flex-col">
            <DialogHeader className="bg-gradient-to-r from-[#ffcc00] to-[#003399] p-6">
              <DialogTitle className="text-white text-2xl font-bold">
                Share Feedback!
              </DialogTitle>
              <DialogDescription className="mt-2 text-white/90">
                Your voice helps make Slugtistics shine.
              </DialogDescription>
            </DialogHeader>

            <div className="p-6 space-y-5 relative">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name (optional)"
                className="w-full rounded-md border border-border focus:ring-2 focus:ring-[#003399] transition"
              />

              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setIsEmailTouched(true)}
                placeholder="Email"
                className="w-full rounded-md border border-border focus:ring-2 focus:ring-[#003399] transition"
              />
              {isEmailTouched && email.trim() === "" && (
                <p className="text-sm text-red-500">Email is required.</p>
              )}
              {isEmailTouched && email.trim() && !isEmailValid && (
                <p className="text-sm text-red-500">Invalid email address.</p>
              )}

              <Textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Spot something awesome or something off? Tell us!"
                className="w-full min-h-[140px] rounded-md border border-border focus:ring-2 focus:ring-[#003399] transition resize-none"
              />

              <DialogFooter className="p-0">
                <div id="rewardId" />
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={handleSubmit}
                    disabled={!feedback.trim() || !isEmailFieldValid || isAnimating}
                    className="w-full py-4 text-base font-semibold"
                  >
                    Send Feedback
                  </Button>
                </motion.div>
              </DialogFooter>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Notification
        type={notificationType}
        message={notificationMessage}
        isOpen={notificationOpen}
        onClose={() => setNotificationOpen(false)}
      />
    </>
  );
};

export default FeedbackButton;
