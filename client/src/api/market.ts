import axios from "axios";

export async function getMarketSummary() {
  try {
    const res = await axios.get(
      `${import.meta.env.VITE_BASE_URL}/market/summary`,
    );
    if (res.status == 200) {
      return res.data.data;
    }
  } catch (error) {
    console.log("error occured");
    return error;
  }
}

export async function getTopMovers() {
  try {
    const res = await axios.get(
      `${import.meta.env.VITE_BASE_URL}/market/top-movers`,
    );
    if (res.status == 200) {
      return res.data.data;
    }
  } catch (error) {
    console.log("error occured");
    return error;
  }
}
