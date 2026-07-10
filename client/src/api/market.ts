import axios from "axios";

export async function getMarketSummary() {
  try {
    const res = await axios.get(
      `${import.meta.env.VITE_BASE_URL}/market/summary`,
    );

    return res.data.data;
  } catch (error) {
    console.log("error occured");
    return error;
  }
}

export async function getTopMovers() {
  try {
    const res = await axios.get(
      `${import.meta.env.VITE_BASE_URL}/market/movers`,
    );
    return res.data.data;
  } catch (error) {
    console.log("error occured");
    return error;
  }
}

export async function getIndexData() {
  try {
    const res = await axios.get(
      `${import.meta.env.VITE_BASE_URL}/market/indices`,
    );

    return res.data.data;
  } catch (error) {
    console.log("error occured");
    return error;
  }
}

export async function getTopIndices() {
  try {
    const res = await axios.get(
      `${import.meta.env.VITE_BASE_URL}/market/indices/top`,
    );

    return res.data.data;
  } catch (error) {
    console.log("error occured");
    return error;
  }
}

export async function getTopTicks() {
  try {
    const res = await axios.get(
      `${import.meta.env.VITE_BASE_URL}/market/ticks/top`,
    );
    return res.data.data;
  } catch (error) {
    console.log("error occured");
    return error;
  }
}
