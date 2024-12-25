"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Bar, Doughnut, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface DashboardChartsProps {
  memberContributions: any[];
  memberStatuses: {
    completed: number;
    pending: number;
    failed: number;
  };
  monthlyStats: any[];
}

// Add color constants at the top of the component
const CHART_COLORS = {
  primary: {
    base: "hsl(221, 83%, 53%)",
    light: "hsl(221, 83%, 53%, 0.1)",
  },
  status: {
    success: "hsl(142, 76%, 36%)",
    warning: "hsl(45, 93%, 47%)",
    error: "hsl(0, 84%, 60%)",
  },
  text: {
    primary: "hsl(222, 47%, 11%)",
    secondary: "hsl(217, 19%, 27%)",
  },
  border: "hsl(220, 13%, 91%)",
};

export const DashboardCharts = ({
  memberContributions,
  memberStatuses,
  monthlyStats,
}: DashboardChartsProps) => {
  // Format currency for tooltips
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
    }).format(value);
  };

  // Check if data exists
  const hasMonthlyData = monthlyStats?.length > 0;
  const hasContributionData = memberContributions?.length > 0;
  const hasStatusData = Object.values(memberStatuses).some(
    (value) => value > 0
  );

  const NoDataMessage = () => (
    <div className="flex-center flex-col h-[200px] text-gray-500">
      <p className="p-16-semibold">No data available</p>
      <p className="text-sm">Check back later for updates</p>
    </div>
  );

  // Add default values and null checks for scales
  const maxMonthlyAmount = monthlyStats?.length
    ? Math.max(...monthlyStats.map((stat) => stat?.amount || 0)) * 1.2
    : 1000;

  const maxContributionAmount = memberContributions?.length
    ? Math.max(...memberContributions.map((item) => item?.amount || 0)) * 1.2
    : 1000;

  // Updated chart configurations
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        align: "end" as const,
        labels: {
          boxWidth: 8,
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
      tooltip: {
        backgroundColor: "white",
        titleColor: CHART_COLORS.text.secondary,
        bodyColor: CHART_COLORS.text.secondary,
        borderColor: CHART_COLORS.border,
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (context: any) => {
            return `Amount: ${formatCurrency(context.parsed.y)}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value: number | string) {
            if (typeof value === "number") {
              return formatCurrency(value);
            }
            return value;
          },
        },
        grid: {
          color: CHART_COLORS.border,
        },
        // Add max value to prevent long bars
        max: maxMonthlyAmount,
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  const barChartOptions = {
    ...lineChartOptions,
    plugins: {
      ...lineChartOptions.plugins,
      legend: {
        display: false,
      },
    },
    scales: {
      ...lineChartOptions.scales,
      y: {
        ...lineChartOptions.scales.y,
        // Add max value to prevent long bars
        max: maxContributionAmount,
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Monthly Contributions Line Chart */}
      <div className="glass-card p-6" style={{ height: "400px" }}>
        <h4 className="p-16-semibold text-gray-900 mb-4">Monthly Overview</h4>
        {hasMonthlyData ? (
          <Line
            data={{
              labels: monthlyStats.map((stat) => {
                const date = new Date(stat.month);
                return date.toLocaleDateString("en-PH", {
                  month: "short",
                  year: "numeric",
                });
              }),
              datasets: [
                {
                  label: "Monthly Contributions",
                  data: monthlyStats.map((stat) => stat.amount),
                  borderColor: CHART_COLORS.primary.base,
                  backgroundColor: CHART_COLORS.primary.light,
                  tension: 0.4,
                  fill: true,
                  pointBackgroundColor: CHART_COLORS.primary.base,
                  pointBorderColor: "white",
                  pointBorderWidth: 2,
                  pointRadius: 4,
                  pointHoverRadius: 6,
                  pointHoverBackgroundColor: CHART_COLORS.primary.base,
                  pointHoverBorderColor: "white",
                  pointHoverBorderWidth: 3,
                },
              ],
            }}
            options={{
              ...lineChartOptions,
              scales: {
                ...lineChartOptions.scales,
                x: {
                  ...lineChartOptions.scales.x,
                  ticks: {
                    maxRotation: 45,
                    minRotation: 45,
                  },
                },
              },
              plugins: {
                ...lineChartOptions.plugins,
                tooltip: {
                  ...lineChartOptions.plugins.tooltip,
                  callbacks: {
                    title: (items) => {
                      return items[0].label;
                    },
                    label: (context) => {
                      return `Amount: ${formatCurrency(context.parsed.y)}`;
                    },
                  },
                },
              },
            }}
            className="h-[300px]"
          />
        ) : (
          <NoDataMessage />
        )}
      </div>

      {/* Member Contributions & Status Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Charts with fixed heights */}
        <div className="glass-card p-4" style={{ height: "400px" }}>
          <h4 className="p-16-semibold text-gray-900 mb-2">
            Individual Contributions
          </h4>
          {hasContributionData ? (
            <Bar
              data={{
                labels: memberContributions.map(
                  (item) => item.memberName.split(" ")[0]
                ),
                datasets: [
                  {
                    label: "Amount",
                    data: memberContributions.map((item) => item.amount),
                    backgroundColor: CHART_COLORS.primary.base,
                    borderRadius: 4,
                    maxBarThickness: 32, // Reduced thickness
                  },
                ],
              }}
              options={{
                ...barChartOptions,
                maintainAspectRatio: false,
                layout: {
                  padding: {
                    left: 10,
                    right: 10,
                    top: 0,
                    bottom: 10,
                  },
                },
                scales: {
                  x: {
                    ticks: {
                      autoSkip: false,
                      maxRotation: 45,
                      minRotation: 45,
                      font: {
                        size: 11, // Smaller font size
                      },
                    },
                  },
                },
              }}
              className="h-[280px]" // Slightly reduced height
            />
          ) : (
            <NoDataMessage />
          )}
        </div>

        <div className="glass-card p-6" style={{ height: "400px" }}>
          <h4 className="p-16-semibold text-gray-900 mb-4">
            Payment Status Overview
          </h4>
          {hasStatusData ? (
            <Doughnut
              data={{
                labels: ["Completed", "Pending", "Failed"],
                datasets: [
                  {
                    data: [
                      memberStatuses.completed,
                      memberStatuses.pending,
                      memberStatuses.failed,
                    ],
                    backgroundColor: [
                      CHART_COLORS.status.success,
                      CHART_COLORS.status.warning,
                      CHART_COLORS.status.error,
                    ],
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "right" as const,
                    align: "center" as const,
                    labels: {
                      boxWidth: 8,
                      usePointStyle: true,
                      pointStyle: "circle",
                      padding: 20,
                      font: {
                        size: 12,
                      },
                      generateLabels: (chart) => {
                        const datasets = chart.data.datasets;
                        if (!datasets?.length || !datasets[0]?.data) return [];

                        const colors = datasets[0].backgroundColor as string[];

                        return (chart.data.labels || []).map((label, i) => ({
                          text: `${label} (${datasets[0].data[i] || 0})`,
                          fillStyle: colors?.[i] || "#000",
                          hidden: false,
                          pointStyle: "circle",
                          index: i,
                        }));
                      },
                    },
                  },
                  tooltip: {
                    enabled: false,
                  },
                },
              }}
              className="h-[250px] w-full"
            />
          ) : (
            <NoDataMessage />
          )}
        </div>
      </div>
    </div>
  );
};
