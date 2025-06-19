import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Paper,
  Box,
  Tabs,
  Tab,
  CircularProgress,
  AppBar,
  Toolbar,
  Link,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import EntryForm from "./components/EntryForm";
import EntriesTable from "./components/EntriesTable";
import MonthlySummary from "./components/MonthlySummary";
import MonthlyChart from "./components/MonthlyChart";
import type { FinancialEntry, MonthlyData } from "./types";
import { ref, set, onValue } from "firebase/database";
import { db } from "./firebaseConfig";
import { useAuth } from "./context/AuthContext";
import AuthWrapper from "./components/AuthWrapper";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { fetchExchangeRate } from "./utils/currency";

function App() {
  const auth = useAuth();
  const [entries, setEntries] = useState<FinancialEntry[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [runningTotal, setRunningTotal] = useState(0);
  const [exchangeRate, setExchangeRate] = useState(1);
  const [currency, setCurrency] = useState<"PHP" | "USD">(() => {
    const saved = localStorage.getItem("selectedCurrency");
    return saved === "USD" ? "USD" : "PHP";
  });
  const [currencyAnchorEl, setCurrencyAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleCurrencyClick = (event: React.MouseEvent<HTMLElement>) => {
    setCurrencyAnchorEl(event.currentTarget);
  };
  const handleCurrencySelect = (selected: "PHP" | "USD") => {
    setCurrency(selected);
    localStorage.setItem("selectedCurrency", selected); // Save to localStorage
    setCurrencyAnchorEl(null);
    handleMenuClose();
  };

  const handleLogoutClick = () => {
    logout();
    handleMenuClose();
  };

  useEffect(() => {
    const fetchRate = async () => {
      try {
        const rate = await fetchExchangeRate("PHP", currency);
        setExchangeRate(rate);
      } catch (error) {
        console.error("Failed to fetch exchange rate:", error);
        setExchangeRate(1);
      }
    };
    fetchRate();
  }, [currency]);

  useEffect(() => {
    const total = entries.reduce(
      (sum, entry) => sum + (entry.income - entry.expenses),
      0
    );
    setRunningTotal(total);
  }, [entries]);

  const calculatePercentageChange = () => {
    if (entries.length === 0) return 0;

    const firstEntry = entries[0];
    const initialTotal = firstEntry.income - firstEntry.expenses;
    const currentTotal = runningTotal;

    if (initialTotal === 0) return 0;
    return ((currentTotal - initialTotal) / Math.abs(initialTotal)) * 100;
  };
  const percentageChange = calculatePercentageChange();

  if (auth.loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }
  const { currentUser, logout } = auth;
  // Load entries from Firebase when user is authenticated
  useEffect(() => {
    if (!auth.currentUser) return;

    const entriesRef = ref(db, `users/${auth.currentUser.uid}/entries`);

    const unsubscribe = onValue(entriesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const entriesArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setEntries(entriesArray);
      } else {
        setEntries([]);
      }
      setLoading(false); // this is okay if used for data loading
    });

    return () => unsubscribe();
  }, [auth.currentUser]);

  // Save entries to Firebase when they change
  useEffect(() => {
    if (!loading && currentUser) {
      const entriesRef = ref(db, `users/${currentUser.uid}/entries`);
      const entriesObj = entries.reduce((obj, entry) => {
        obj[entry.id] = {
          date: entry.date,
          income: entry.income,
          expenses: entry.expenses,
          remarks: entry.remarks,
        };
        return obj;
      }, {} as Record<string, Omit<FinancialEntry, "id">>);

      set(entriesRef, entriesObj);
    }
  }, [entries, loading, currentUser]);

  // Calculate monthly data when entries change
  useEffect(() => {
    calculateMonthlyData();
  }, [entries]);

  const addEntry = (entry: FinancialEntry) => {
    setEntries((prev) => [...prev, entry]);
  };

  const deleteEntry = (id: string) => {
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
  };

  const calculateMonthlyData = () => {
    const monthlyMap = new Map<string, MonthlyData>();

    entries.forEach((entry) => {
      const date = new Date(entry.date);
      const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}`;
      const monthName = date.toLocaleString("default", {
        month: "long",
        year: "numeric",
      });

      if (!monthlyMap.has(monthYear)) {
        monthlyMap.set(monthYear, {
          month: monthName,
          totalIncome: 0,
          totalExpenses: 0,
          netProfitLoss: 0,
        });
      }

      const monthData = monthlyMap.get(monthYear)!;
      monthData.totalIncome += entry.income;
      monthData.totalExpenses += entry.expenses;
      monthData.netProfitLoss = monthData.totalIncome - monthData.totalExpenses;
    });

    setMonthlyData(
      Array.from(monthlyMap.values()).sort((a, b) => {
        const aDate = new Date(a.month);
        const bDate = new Date(b.month);
        return aDate.getTime() - bDate.getTime();
      })
    );
  };
  const convertedRunningTotal = runningTotal * exchangeRate;

  return (
    <AuthWrapper>
      <Container
        maxWidth="md"
        sx={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          py: 1,
        }}
      >
        <AppBar position="static" color="info" elevation={1} sx={{ mb: 2 }}>
          <Toolbar sx={{ justifyContent: "space-between" }}>
            <Typography
              variant="overline"
              align="center"
              display="block"
              color="white"
              fontWeight={700}
              letterSpacing={1}
            >
              Finify.io
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Typography variant="body2" sx={{ fontSize: "0.75rem" }}>
                {currentUser?.email}
              </Typography>
              <IconButton
                onClick={handleMenuOpen}
                size="small"
                sx={{
                  ml: "10px",
                  color: "#ffffff",
                  p: 0.25,
                  "& svg": {
                    fontSize: "1.3rem",
                  },
                }}
              >
                <AccountCircleIcon />
              </IconButton>

              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
              >
                <MenuItem onClick={handleCurrencyClick}>
                  Currency ({currency})
                </MenuItem>
                <MenuItem onClick={handleLogoutClick}>Logout</MenuItem>
              </Menu>

              <Menu
                anchorEl={currencyAnchorEl}
                open={Boolean(currencyAnchorEl)}
                onClose={() => setCurrencyAnchorEl(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
              >
                <MenuItem
                  selected={currency === "PHP"}
                  onClick={() => handleCurrencySelect("PHP")}
                >
                  PHP – Philippine Peso
                </MenuItem>
                <MenuItem
                  selected={currency === "USD"}
                  onClick={() => handleCurrencySelect("USD")}
                >
                  USD – US Dollar
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
            p: 1,
            backgroundColor: "background.paper",
            borderRadius: 1,
            boxShadow: 1,
          }}
        >
          <Box>
            <Typography
              variant="overline"
              display="block"
              color="text.secondary"
              sx={{ fontSize: { xs: "0.7rem", sm: "0.8rem" } }}
            >
              NET BALANCE
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color:
                  convertedRunningTotal >= 0 ? "success.light" : "error.light",
                fontSize: { xs: "1.4rem", sm: "2rem" }, // Responsive
              }}
            >
              {convertedRunningTotal.toLocaleString(
                currency === "USD" ? "en-US" : "fil-PH",
                {
                  style: "currency",
                  currency,
                }
              )}
            </Typography>
          </Box>

          <Box sx={{ textAlign: "right" }}>
            <Typography
              variant="overline"
              display="block"
              color="text.secondary"
              sx={{ fontSize: { xs: "0.7rem", sm: "0.8rem" } }}
            >
              {percentageChange >= 0 ? "PROFIT" : "LOSS"}
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: percentageChange >= 0 ? "success.light" : "error.light",
                fontSize: { xs: "1.4rem", sm: "2rem" }, // Responsive
              }}
            >
              {percentageChange >= 0 ? "+" : ""}
              {percentageChange.toFixed(1)}%
            </Typography>
          </Box>
        </Box>

        {/* Chart Section */}
        <Paper elevation={1} sx={{ p: 1, mb: 2, height: 200 }}>
          <MonthlyChart
            data={monthlyData}
            currency={currency}
            exchangeRate={exchangeRate}
          />
        </Paper>

        {/* Tab Navigation */}
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
          sx={{ mb: 1 }}
        >
          <Tab label="Entry" />
          <Tab label="All Entries" />
          <Tab label="Summary" />
        </Tabs>

        {/* Tab Content - made flexible */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
          }}
        >
          {activeTab === 0 && (
            <Paper
              sx={{
                p: { xs: 2, sm: 5 },
              }}
            >
              <EntryForm onAddEntry={addEntry} currency={currency} />
            </Paper>
          )}

          {activeTab === 1 && (
            <Paper
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                minHeight: 0,
              }}
            >
              <EntriesTable
                entries={entries}
                onDelete={deleteEntry}
                currency={currency}
                exchangeRate={exchangeRate}
              />
            </Paper>
          )}

          {activeTab === 2 && (
            <Paper
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                minHeight: 0,
              }}
            >
              <MonthlySummary
                data={monthlyData}
                currency={currency}
                exchangeRate={exchangeRate}
              />
            </Paper>
          )}
        </Box>

        {/* Footer - made more compact */}
        <Box sx={{ py: 1, textAlign: "center" }}>
          <Typography variant="caption">
            Created by{" "}
            <Link href="https://dev-moro.netlify.app/" underline="hover">
              Kyle David Caumeran
            </Link>{" "}
            © {new Date().getFullYear()}
          </Typography>
        </Box>
      </Container>
    </AuthWrapper>
  );
}

export default App;
