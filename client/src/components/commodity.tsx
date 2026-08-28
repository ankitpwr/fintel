import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCommodity } from "@/hooks/useMarket";

export function CommodityTable() {
  const { data, isLoading, isError } = useCommodity();
  console.log("rerender .....");

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
              Symbol
            </TableHead>
            <TableHead className="text-[#a3a3a3] font-medium text-xs uppercase tracking-wider py-3 text-right">
              Current
            </TableHead>

            <TableHead className="text-[#a3a3a3] font-medium text-xs uppercase tracking-wider py-3 text-right pr-5">
              % Chg
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((element: any) => {
            const isPositive = element.percentChange >= 0;
            return (
              <TableRow
                key={element.Symbol}
                className="border-b border-[#2b2a29]/50 hover:bg-[#262524] transition-colors duration-200 cursor-default"
              >
                <TableCell className="font-semibold text-gray-200 py-3 pl-5">
                  {element.Symbol}
                </TableCell>
                <TableCell className="text-right text-gray-100 py-3 tabular-nums">
                  {element.LTP.toFixed(2)}
                </TableCell>

                <TableCell
                  className={`text-right font-medium py-3 pr-5 tabular-nums ${
                    isPositive ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {isPositive ? "+" : ""}
                  {element.PercentChange.toFixed(2)}%
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
