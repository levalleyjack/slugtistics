import axios from "axios";
import { local } from "./GetGEData";

const getTimeAgo = (lastUpdate?: Date | string): string => {
  try {
    const now = new Date();
    let lastUpdateDate: Date;

    if (!lastUpdate) return "Unknown";

    if (typeof lastUpdate === 'string') {
      lastUpdateDate = new Date(lastUpdate);
    } else {
      lastUpdateDate = lastUpdate;
    }

    if (!(lastUpdateDate instanceof Date) || isNaN(lastUpdateDate.getTime())) {
      return "Recently updated";
    }

    const secondsAgo = Math.floor(
      (now.getTime() - lastUpdateDate.getTime()) / 1000
    );

    if (secondsAgo < 60) return `${secondsAgo}s ago`;
    if (secondsAgo < 3600) return `${Math.floor(secondsAgo / 60)}m ago`;
    if (secondsAgo < 86400) return `${Math.floor(secondsAgo / 3600)}h ago`;
    return `${Math.floor(secondsAgo / 86400)}d ago`;
  } catch (error) {
    console.error('Error calculating time ago:', error);
    return "Recently updated";
  }
};

export const fetchLastUpdate = async (): Promise<string> => {
  try {
    const response = await axios.get(`${local}/all_courses`);
    const lastUpdate = response.data?.last_update;

    if (!lastUpdate) {
      return "Recently updated";
    }

    return `Updated ${getTimeAgo(lastUpdate)}`;
  } catch (err) {
    console.error("Error fetching last update time:", err);
    return "Recently updated";
  }
};