import axios from "axios";

export const local = "http://10.0.0.43:5001";
const current_url = local;
const API_URL = `${current_url}/api/courses`;

export const fetchCourses = async (categoryValue: string) => {
  try {
    const response = await axios.get(`${API_URL}?course=${categoryValue}`);
    return response.data?.data || [];
  } catch (err) {
    console.error("Error fetching data:", err);
    throw new Error("Error loading data. Please try again later.");
  }
};

export const fetchLastUpdate = async () => {
  try {
    const response = await axios.get(API_URL);

    const lastUpdate = response.data?.last_update;

    if (!lastUpdate) {
      throw new Error("No last update timestamp found.");
    }

    const lastUpdateDate = new Date(lastUpdate);

    const timeAgo = getTimeAgo(lastUpdateDate);

    return `Last updated: ${timeAgo}`;
  } catch (err) {
    console.error("Error fetching last update time:", err);
    throw new Error("Error loading last update time. Please try again later.");
  }
};



export const getTimeAgo = (lastUpdate?: Date) => {
  const now = new Date();
  const secondsAgo = Math.floor(
    (now.getTime() - (lastUpdate?.getTime() ?? 0)) / 1000
  );

  if (isNaN(secondsAgo)) {
    return "Invalid date"; 
  }

  if (secondsAgo < 60) {
    return `${secondsAgo}s ago`;
  } else if (secondsAgo < 3600) {
    const minutesAgo = Math.floor(secondsAgo / 60);
    return `${minutesAgo}m ago`;
  } else if (secondsAgo < 86400) {
    const hoursAgo = Math.floor(secondsAgo / 3600);
    return `${hoursAgo}h ago`;
  } else {
    const daysAgo = Math.floor(secondsAgo / 86400);
    return `${daysAgo}d ago`;
  }
};
