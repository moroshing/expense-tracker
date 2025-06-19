import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Box,
} from "@mui/material";
import { useState } from "react";
import type { MonthlyData } from "../types";

interface MonthlySummaryProps {
  data: MonthlyData[];
  currency: "PHP" | "USD";
  exchangeRate: number;
}

const MonthlySummary: React.FC<MonthlySummaryProps> = ({
  data,
  currency,
  exchangeRate,
}) => {
  const [page, setPage] = useState(0);
  const rowsPerPage = 12;

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const visibleData = data.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const formatCurrency = (value: number) =>
    (value * exchangeRate).toLocaleString(
      currency === "USD" ? "en-US" : "fil-PH",
      {
        style: "currency",
        currency,
      }
    );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <TableContainer component={Paper} sx={{ flex: 1, boxShadow: "none" }}>
        <Table size="small" sx={{ borderCollapse: "collapse" }}>
          <TableHead>
            <TableRow>
              <TableCell>Month</TableCell>
              <TableCell align="right">Total Income</TableCell>
              <TableCell align="right">Total Expenses</TableCell>
              <TableCell align="right">Net Profit/Loss</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visibleData.map((month) => (
              <TableRow
                key={month.month}
                sx={{ "&:last-child td": { border: "none" } }}
              >
                <TableCell sx={{ border: "none" }}>{month.month}</TableCell>
                <TableCell align="right" sx={{ border: "none" }}>
                  {formatCurrency(month.totalIncome)}
                </TableCell>
                <TableCell align="right" sx={{ border: "none" }}>
                  {formatCurrency(month.totalExpenses)}
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    border: "none",
                    color:
                      month.netProfitLoss >= 0
                        ? "success.light"
                        : "error.light",
                    fontWeight: "bold",
                  }}
                >
                  {formatCurrency(month.netProfitLoss)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[]}
        component="div"
        count={data.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        sx={{
          borderTop: "1px solid rgba(224, 224, 224, 1)",
          mt: "auto",
        }}
      />
    </Box>
  );
};

export default MonthlySummary;
