import { useState } from "react";
import {
  Button,
  TextField,
  Typography,
  Box,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import type { FinancialEntry } from "../types";

interface EntryFormProps {
  onAddEntry: (entry: FinancialEntry) => void;
  currency: "PHP" | "USD";
}

const EntryForm: React.FC<EntryFormProps> = ({ onAddEntry, currency }) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [entry, setEntry] = useState<Omit<FinancialEntry, "id">>({
    date: new Date().toISOString().split("T")[0],
    income: 0,
    expenses: 0,
    remarks: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEntry((prev) => ({
      ...prev,
      [name]:
        name === "income" || name === "expenses"
          ? parseFloat(value) || 0
          : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newEntry: FinancialEntry = {
        ...entry,
        id: Date.now().toString(),
      };
      onAddEntry(newEntry);
      setEntry({
        date: new Date().toISOString().split("T")[0],
        income: 0,
        expenses: 0,
        remarks: "",
      });
    } catch (error) {
      console.error("Error saving entry:", error);
      alert("Failed to save entry. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Typography
        variant="h6"
        gutterBottom
        sx={{
          fontSize: isSmallScreen ? "1rem" : "1.25rem",
          mb: 2,
        }}
      >
        Add New Entry
      </Typography>

      {/* Description + Date */}
      <Box
        display="grid"
        gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr" }}
        gap={isSmallScreen ? 1 : 2}
        mb={isSmallScreen ? 1 : 2}
      >
        <TextField
          label="Date"
          type="date"
          name="date"
          value={entry.date}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
          fullWidth
          size="small"
        />
      </Box>

      {/* Income + Expenses */}
      <Box
        display="grid"
        gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr" }}
        gap={isSmallScreen ? 1 : 2}
        mb={isSmallScreen ? 1.5 : 2}
      >
        <TextField
          label="Income"
          type="number"
          name="income"
          inputMode="numeric"
          value={entry.income || ""}
          onChange={handleChange}
          inputProps={{ step: "0.01" }}
          fullWidth
          size="small"
          InputProps={{
            startAdornment: (
              <Typography variant="body2" color="textSecondary" sx={{ mr: 1 }}>
                {currency === "PHP" ? "PHP" : "USD"}
              </Typography>
            ),
          }}
        />
        <TextField
          label="Expenses"
          type="number"
          inputMode="numeric"
          name="expenses"
          value={entry.expenses || ""}
          onChange={handleChange}
          inputProps={{ step: "0.01" }}
          fullWidth
          size="small"
          InputProps={{
            startAdornment: (
              <Typography variant="body2" color="textSecondary" sx={{ mr: 1 }}>
                {currency === "PHP" ? "PHP" : "USD"}
              </Typography>
            ),
          }}
        />
      </Box>

      {/* Remarks */}
      <Box mb={isSmallScreen ? 1.5 : 2}>
        <TextField
          label="Remarks"
          name="remarks"
          value={entry.remarks}
          onChange={handleChange}
          fullWidth
          size="small"
          multiline
          minRows={isSmallScreen ? 3 : 4}
        />
      </Box>

      {/* Submit Button */}
      <Box>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          size="medium"
          sx={{
            py: isSmallScreen ? 1 : 1.5,
            fontSize: isSmallScreen ? "0.8rem" : "1rem",
          }}
        >
          Add Entry
        </Button>
      </Box>
    </form>
  );
};

export default EntryForm;
