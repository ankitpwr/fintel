import "dotenv/config";
import axios from "axios";
import type { AppStateType, ShareHoldingInfo } from "../worker/agent";

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

export async function extractStockInfo(state: AppStateType) {
  try {
    const { data } = await nseClient.get(
      `/quote-equity?symbol=${state.companySymbol}`,
    );

    // console.log("extract-stock-info ", data);

    return {
      stockInfo: {
        symbol: data.info.symbol,
        companyName: data.info.companyName,
        industry: data.info.industry,
        sector: data.industryInfo.sector,
        basicIndustry: data.industryInfo.basicIndustry,
        faceValue: data.securityInfo.faceValue,

        lastPrice: data.priceInfo.lastPrice,
        open: data.priceInfo.open,
        close: data.priceInfo.close,
        vwap: data.priceInfo.vwap,
        change: data.priceInfo.change,
        pChange: data.priceInfo.pChange,

        dayHigh: data.priceInfo.intraDayHighLow.max,
        dayLow: data.priceInfo.intraDayHighLow.min,
        weekHigh52: data.priceInfo.weekHighLow.max,
        weekLow52: data.priceInfo.weekHighLow.min,
        weekHighDate: data.priceInfo.weekHighLow.maxDate,
        weekLowDate: data.priceInfo.weekHighLow.minDate,

        sectorPE: data.metadata.pdSectorPe,
        symbolPE: data.metadata.pdSymbolPe,

        primaryIndex: data.metadata.pdSectorInd,
      },
    };
  } catch (error) {
    console.log("error in extract-stock-info");
    console.log(error);
  }
}

export async function extractPeersInfo(state: AppStateType) {
  try {
    const { data } = await nseClient.get(
      `/NextApi/apiClient/GetQuoteApi?functionName=getPeerComparisonData&symbol=${state.companySymbol}&type=S&quarter=2025-12&param=industry&index=`,
    );

    // console.log("extract-peers-info ", data);
    return {
      peerInfo: data.map((peer: any) => ({
        symbol: peer.symbol,
        price: peer.ltp,
        pe: peer.pe,
        eps: peer.eps,
        pat: peer.pat,
        totalIncome: peer.totalIncome,
        marketCap: peer.marketCap,
        promoterHolding: peer.promoterHolding,
        dayChange: peer.pChange,
      })),
    };
  } catch (error) {
    console.log("error in extract-peers-info");
    console.log(error);
  }
}

export async function extractShareHoldingInfo(state: AppStateType) {
  try {
    const { data } = await nseClient.get(
      `/NextApi/apiClient/GetQuoteApi?functionName=getShareHoldingPatternCorp&symbol=${state.companySymbol}&type=W&noOfRecords=3`,
    );

    const shareHoldingPattern: ShareHoldingInfo[] = [];
    Object.entries(data).forEach(([key, value]: [string, any]) => {
      shareHoldingPattern.push({
        date: key as string,
        promotorHolding: Number(value.promoter_group.value),
        publicHolding: Number(value.public.value),
      });
    });

    return { shareHoldingInfo: shareHoldingPattern };
  } catch (error) {
    console.log("error in extract-share-holding-info");
    console.log(error);
  }
}
