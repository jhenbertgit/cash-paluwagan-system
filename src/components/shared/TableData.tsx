import * as mod from "@jhenbert/date-formatter";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Props {
  data: {
    _id: string;
    status: string;
    amount: number;
    paymentMethod: string;
    createdAt: Date;
  }[];
}

const TableData = ({ data }: Props) => {
  return (
    <Table className="bg-white border-2 border-purple-200/20 rounded-xl p-5 shadow-lg shadow-purple-200/10">
      <TableCaption className="text-white">
        A list of your recent payments.
      </TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Date of Payment</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Method</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => (
          <TableRow key={item._id}>
            <TableCell className="w-[300px]">
              {mod.default(
                "en-PH",
                {
                  dateStyle: "long",
                  timeStyle: "short",
                  timeZone: "Asia/Manila",
                },
                new Date(item.createdAt)
              )}
            </TableCell>
            <TableCell className="capitalize">{item.status}</TableCell>
            <TableCell className="capitalize">{item.paymentMethod}</TableCell>
            <TableCell className="text-right">
              ₱{" "}
              {item.amount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default TableData;
