import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TablePagination,
  Box,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useState } from "react";
import type { FinancialEntry } from "../types";

interface EntriesTableProps {
  entries: FinancialEntry[];
  onDelete: (id: string) => void;
  currency: "PHP" | "USD";
  exchangeRate: number;
}

const EntriesTable: React.FC<EntriesTableProps> = ({
  entries,
  onDelete,
  currency,
  exchangeRate,
}) => {
  const [page, setPage] = useState(0);
  const rowsPerPage = 8;

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Calculate running totals
  const runningTotals: number[] = [];
  let total = 0;
  for (let i = 0; i < entries.length; i++) {
    total += entries[i].income - entries[i].expenses;
    runningTotals.push(total);
  }

  const visibleEntries = entries.slice(
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
              <TableCell>Review</TableCell>
              <TableCell>Date</TableCell>
              <TableCell align="right">Income</TableCell>
              <TableCell align="right">Expenses</TableCell>
              <TableCell align="right">Running Total</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visibleEntries.map((entry, index) => {
              const globalIndex = page * rowsPerPage + index;
              const runningTotal = runningTotals[globalIndex] ?? 0;
              return (
                <TableRow
                  key={entry.id}
                  sx={{ "&:last-child td": { border: "none" } }}
                >
                  <TableCell sx={{ border: "none" }}>
                    <IconButton size="small" sx={{ color: "text.secondary" }}>
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                  <TableCell sx={{ border: "none" }}>
                    {new Date(entry.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="right" sx={{ border: "none" }}>
                    {formatCurrency(entry.income)}
                  </TableCell>
                  <TableCell align="right" sx={{ border: "none" }}>
                    {formatCurrency(entry.expenses)}
                  </TableCell>
                  <TableCell align="right" sx={{ border: "none" }}>
                    {formatCurrency(runningTotal)}
                  </TableCell>
                  <TableCell sx={{ border: "none" }}>
                    <IconButton
                      onClick={() => onDelete(entry.id)}
                      sx={{ color: "#ef5350" }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[]}
        component="div"
        count={entries.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        sx={{
          borderTop: "1px solid rgba(224, 224, 224, 1)",
          mt: "auto", // This pushes it to the bottom
        }}
      />
    </Box>
  );
};

export default EntriesTable;
