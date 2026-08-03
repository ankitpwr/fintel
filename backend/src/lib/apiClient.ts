import axios from "axios";

export const nseClient = axios.create({
  baseURL: process.env.BASE_URL,
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
    Accept: "application/json, text/plain, */*",
    "Accept-Language": "en-US,en;q=0.9",
    Referer: process.env.BASE_URL,
  },
});

export const mcxClient = axios.create({
  baseURL: "https://www.mcxindia.com/home",
  headers: {
    Accept: "application/json, text/javascript, */*; q=0.01",
    Referer: "https://www.mcxindia.com/en/home",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36",
    "X-Requested-With": "XMLHttpRequest",
  },
});
