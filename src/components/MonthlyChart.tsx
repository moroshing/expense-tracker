import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import type { MonthlyData } from "../types";
import { useState } from "react";
import {
  ToggleButton,
  ToggleButtonGroup,
  useMediaQuery,
  Box,
} from "@mui/material";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

interface MonthlyChartProps {
  data: MonthlyData[];
  exchangeRate: number;
  currency: "PHP" | "USD";
}

const MonthlyChart: React.FC<MonthlyChartProps> = ({
  data,
  exchangeRate,
  currency,
}) => {
  const [chartType, setChartType] = useState<"bar" | "line">("bar");
  const isSmallScreen = useMediaQuery("(max-width:600px)");

  const formatMonthLabel = (fullMonth: string) => {
    if (!isSmallScreen) return fullMonth;
    const [month] = fullMonth.split(" ");
    return `${month.substring(0, 3)}.`;
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat(currency === "USD" ? "en-US" : "fil-PH", {
      style: "currency",
      currency,
    }).format(value * exchangeRate);

  const chartData = {
    labels: data.map((item) => formatMonthLabel(item.month)),
    datasets: [
      {
        label: "Net Profit/Loss",
        data: data.map((item) => item.netProfitLoss * exchangeRate),
        backgroundColor: data.map((item) =>
          item.netProfitLoss >= 0
            ? "rgba(75, 192, 192, 0.75)"
            : "rgba(255, 99, 132, 0.6)"
        ),
        borderColor: data.map((item) =>
          item.netProfitLoss >= 0
            ? "rgba(75, 192, 192, 1)"
            : "rgba(255, 99, 132, 1)"
        ),
        borderWidth: 1,
        tension: 0.4,
        pointRadius: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Monthly Net Profit/Loss",
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback: function (value: string | number) {
            if (typeof value === "number") {
              return formatCurrency(value / exchangeRate);
            }
            return value;
          },
        },
      },
      x: {
        ticks: {
          autoSkip: false,
          maxRotation: isSmallScreen ? 45 : 0,
        },
      },
    },
  };

  const handleChartTypeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newType: "bar" | "line"
  ) => {
    if (newType !== null) {
      setChartType(newType);
    }
  };

  return (
    <Box
      sx={{
        position: "relative",
        height: 190, // Matches your original height
        width: "100%",
        mb: 2, // Matches your original margin bottom
      }}
    >
      <ToggleButtonGroup
        value={chartType}
        exclusive
        onChange={handleChartTypeChange}
        aria-label="chart type"
        size="small"
        sx={{
          position: "absolute",
          top: 8,
          right: 8,
          zIndex: 1,
          backgroundColor: "background.paper",
        }}
      >
        <ToggleButton value="bar">Bar</ToggleButton>
        <ToggleButton value="line">Line</ToggleButton>
      </ToggleButtonGroup>

      <Box sx={{ height: "100%", width: "100%" }}>
        {chartType === "bar" ? (
          <Bar data={chartData} options={options} />
        ) : (
          <Line data={chartData} options={options} />
        )}
      </Box>
    </Box>
  );
};

export default MonthlyChart;
