export interface StockInfo {
  symbol: string;
  companyName: string;
  industry: string;
  sector: string;
  basicIndustry: string;
  faceValue: string;

  lastTradedPrice: number;
  openPrice: number;
  closePrice: number;
  volumeWeightedAveragePrice: number;
  priceChange: number;
  percentageChange: number;

  intradayHigh: number;
  intradayLow: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  fiftyTwoWeekHighDate: string;
  fiftyTwoWeekLowDate: string;

  sectorPriceToEarningsRatio: number;
  stockPriceToEarningsRatio: number;
  primaryIndex: string;
}

export interface PeersInfo {
  symbol: string;
  price: number;
  priceToEarningsRatio: number;
  earningsPerShare: number;
  profitAfterTax: number;
  totalIncome: number;
  marketCap: number;
  promoterHoldingPercentage: number;
  dayChangePercentage: number;
}

export interface ShareHoldingInfo {
  date: string;
  promoterHoldingPercentage: number;
  publicHoldingPercentage: number;
}
