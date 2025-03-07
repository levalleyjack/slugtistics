import axios from "axios";
import { toZonedTime } from "date-fns-tz";
import { local } from "./GetGEData";

const getTimeAgo = (lastUpdate?: Date): string => {
  const now = new Date();
  const secondsAgo = Math.floor(
    (now.valueOf() - (lastUpdate?.valueOf() ?? 0)) / 1000
  );

  if (isNaN(secondsAgo)) return "Invalid date";
  if (secondsAgo < 60) return `${secondsAgo}s ago`;
  if (secondsAgo < 3600) return `${Math.floor(secondsAgo / 60)}m ago`;
  if (secondsAgo < 86400) return `${Math.floor(secondsAgo / 3600)}h ago`;
  return `${Math.floor(secondsAgo / 86400)}d ago`;
};

export const fetchLastUpdate = async (): Promise<string> => {
  try {
    const response = await axios.get(`${local}/all_courses`);
    const lastUpdate = response.data?.last_update;

    if (!lastUpdate) {
      throw new Error("No last update timestamp found.");
    }

    const normalizedDate = lastUpdate.trim().replace(" ", "T");

    const zonedTime = toZonedTime(normalizedDate, "America/Los_Angeles");

    return `Updated ${getTimeAgo(zonedTime)}`;
  } catch (err) {
    console.error("Error fetching last update time:", err);
    throw new Error("Error loading last update time. Please try again later.");
  }
};
