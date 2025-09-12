import { IP_ADDRESS } from "@/constants/configEnv.js";

const API_BASE_URL = `http://${IP_ADDRESS}:3402`;

export const getClubsApi = async (): Promise<{
  clubs: { id: number; name: string; description: string }[];
}> => {
  try {
    const response = await fetch(`${API_BASE_URL}/clubs`);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching clubs:", error);
    throw error;
  }
};

export const createClubApi = async (clubData: {
  name: string;
  description: string;
}) => {
  try {
    const response = await fetch(`${API_BASE_URL}/createForo`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-client": "mobile",
      },
      body: JSON.stringify(clubData),
    });
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating club:", error);
    throw error;
  }
};
