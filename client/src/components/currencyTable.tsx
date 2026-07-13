import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCurrency } from "@/hooks/useMarket";

export default function CurrencyTable() {
  const { data, isLoading, isError } = useCurrency();

  if (isLoading) {
    return (
      <div className="h-48 w-full animate-pulse bg-[#1e1d1c] rounded-xl border border-[#2b2a29]"></div>
    );
  }

  if (isError) {
    return (
      <div className="h-48 w-full flex items-center justify-center bg-[#1e1d1c] rounded-xl border border-[#2b2a29] text-rose-400 text-sm">
        Error loading currency data.
      </div>
    );
  }

  return (
    <div className="bg-[#1e1d1c] border border-[#2b2a29] rounded-xl overflow-hidden shadow-md">
      <Table>
        <TableHeader className="bg-[#262524] border-b border-[#2b2a29]">
          <TableRow className="hover:bg-transparent border-none">
            <TableHead className="text-[#a3a3a3] font-medium text-xs uppercase tracking-wider py-3 pl-5">
              Currency
            </TableHead>
            <TableHead className="text-[#a3a3a3] font-medium text-xs uppercase tracking-wider py-3 text-right">
              Value
            </TableHead>
            <TableHead className="text-[#a3a3a3] font-medium text-xs uppercase tracking-wider py-3 text-right pr-5">
              % Chg
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.currencySpotRates.map(
            (element: {
              currency: string;
              unit: string;
              value: string;
              prevDayValue: string;
            }) => {
              const currentValue = parseFloat(element.value);
              const prevValue = parseFloat(element.prevDayValue);

              const percentChange =
                ((currentValue - prevValue) / prevValue) * 100;
              const isPositive = percentChange >= 0;

              return (
                <TableRow
                  key={element.currency}
                  className="border-b border-[#2b2a29]/50 hover:bg-[#262524] transition-colors duration-200 cursor-default"
                >
                  <TableCell className="font-semibold text-gray-200 py-3 pl-5">
                    <div className="flex items-center gap-2">
                      <span>{element.currency}</span>
                      <span className="text-xs text-[#a3a3a3] font-normal">
                        ({element.unit})
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="text-right text-gray-100 py-3 tabular-nums font-medium">
                    {currentValue.toFixed(4)}
                  </TableCell>

                  <TableCell
                    className={`text-right font-medium py-3 pr-5 tabular-nums ${
                      isPositive ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {isPositive ? "+" : ""}
                    {percentChange.toFixed(2)}%
                  </TableCell>
                </TableRow>
              );
            },
          )}
        </TableBody>
      </Table>
    </div>
  );
}
