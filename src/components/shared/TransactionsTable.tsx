"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";

interface Transaction {
  id: string;
  amount: number;
  status: "completed" | "pending" | "failed";
  createdAt: string;
  member: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface TransactionsTableProps {
  transactions: Transaction[];
}

export function TransactionsTable({
  transactions = [],
}: TransactionsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const totalPages = Math.ceil((transactions?.length || 0) / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentTransactions = transactions?.slice(startIndex, endIndex) || [];

  return (
    <div className="glass-card p-6 transition-all duration-200 hover:shadow-card-hover">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="h3-bold text-gray-900">Recent Transactions</h3>
          <p className="text-sm text-gray-500">
            Showing all contributions made by members
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">Rows per page:</span>
          <Select
            value={rowsPerPage.toString()}
            onValueChange={(value) => {
              setRowsPerPage(Number(value));
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[70px] h-9 bg-white hover:bg-gray-50 transition-colors rounded-lg border border-gray-200">
              <SelectValue defaultValue={rowsPerPage.toString()}>
                {rowsPerPage}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-white shadow-lg rounded-lg border border-gray-200">
              {[5, 10, 20, 50].map((value) => (
                <SelectItem
                  key={value}
                  value={value.toString()}
                  className="hover:bg-gray-50 transition-colors rounded-md"
                >
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 overflow-hidden transition-all duration-200 hover:border-gray-300">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/80 backdrop-blur-sm">
              <TableHead className="min-w-[200px] p-16-semibold">
                Member Name
              </TableHead>
              <TableHead className="p-16-semibold">Status</TableHead>
              <TableHead className="p-16-semibold">Contribution Date</TableHead>
              <TableHead className="text-right p-16-semibold">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentTransactions.length > 0 ? (
              currentTransactions.map((transaction) => (
                <TableRow
                  key={transaction.id}
                  className="hover:bg-gray-50/50 transition-colors cursor-default"
                >
                  <TableCell className="font-medium text-gray-900">
                    {`${transaction.member.firstName} ${transaction.member.lastName}`}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`status-badge ${
                        transaction.status === "completed"
                          ? "status-completed"
                          : transaction.status === "pending"
                          ? "status-pending"
                          : "status-failed"
                      }`}
                    >
                      {transaction.status.charAt(0).toUpperCase() +
                        transaction.status.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {format(new Date(transaction.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-right font-medium text-gray-900">
                    {new Intl.NumberFormat("en-PH", {
                      style: "currency",
                      currency: "PHP",
                    }).format(transaction.amount)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-12 text-gray-500"
                >
                  <div className="flex flex-col items-center gap-2">
                    <p className="p-16-semibold">No transactions found</p>
                    <p className="text-sm">
                      Transactions will appear here once created
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-600">
          Showing {startIndex + 1} to {Math.min(endIndex, transactions.length)}{" "}
          of {transactions.length} entries
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="button-base bg-white border border-gray-200 text-gray-600 
              hover:bg-gray-50 hover:border-gray-300 
              disabled:opacity-50 disabled:hover:bg-white disabled:hover:border-gray-200
              transition-all duration-200"
          >
            <span className="flex items-center gap-1">
              <span>←</span>
              <span>Previous</span>
            </span>
          </button>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="button-base bg-white border border-gray-200 text-gray-600 
              hover:bg-gray-50 hover:border-gray-300 
              disabled:opacity-50 disabled:hover:bg-white disabled:hover:border-gray-200
              transition-all duration-200"
          >
            <span className="flex items-center gap-1">
              <span>Next</span>
              <span>→</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
