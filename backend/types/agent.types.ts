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
export interface BalanceSheet {
  totalAssets: number;
  totalDebt: number;
  currentDebt?: number;
  longTermDebt: number;
  netDebt: number;
  cashAndEquivalents: number;
  shareholdersEquity: number;
  currentAssets: number;
  currentLiabilities: number;
  workingCapital: number;
  inventory: number;
  accountsReceivable: number;
  accountsPayable?: number;
  goodwillAndIntangiblesAsssets: number;
  netPPE: number;
  periodType: string;
  date: string;
}
export interface CashFlow {
  operatingCashFlow: number;
  freeCashFlow: number;
  capitalExpenditure: number;
  investingCashFlow: number;
  financingCashFlow: number;
  depreciation: number;
  changeInWorkingCapital?: number;
  cashDividendsPaid?: number;
  endCashPosition: number;
  periodType: string;
  date: string;
}
export interface IncomeStatement {
  totalRevenue: number;
  grossProfit: number;
  operatingIncome: number;
  ebit: number;
  ebitda: number;
  pretaxIncome: number;
  netIncome: number;
  interestExpense: number;
  totalExpenses: number;
  costOfRevenue: number;
  periodType: string;
  date: string;
}
