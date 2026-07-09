import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { TopMover } from "@/types/types";

export function TableDemo({ data }: { data: TopMover[] }) {
  return (
    <div className=" bg-[#1e1d1c] p-4 rounded-xl text-xl">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Symbol</TableHead>
            <TableHead>Current Price</TableHead>
            <TableHead>Opening Price</TableHead>
            <TableHead>Percent</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((element) => (
            <TableRow key={element.tickerSymbol}>
              <TableCell>{element.tickerSymbol}</TableCell>
              <TableCell>{element.currentPrice}</TableCell>
              <TableCell>{element.openingPrice}</TableCell>
              <TableCell>{element.percentChange.toFixed(2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
