"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { format } from "date-fns";

interface StatsCardsProps {
  userStats: any;
  totalAmount: number;
  nextContributionDate: Date;
  isContributionDue: boolean;
}

interface StatDetail {
  label: string;
  value: string;
  color?: string;
  alert?: boolean;
}

interface Stat {
  title: string;
  value: string;
  subtitle: string;
  details: StatDetail[];
  status: string;
}

export const StatsCards = ({
  userStats,
  totalAmount,
  nextContributionDate,
  isContributionDue,
}: StatsCardsProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  const stats: Stat[] = [
    {
      title: "Your Contributions",
      value: formatCurrency(userStats.totalAmount),
      subtitle: `${userStats.transactionCount} transactions`,
      details: [
        {
          label: "Last Contribution",
          value: userStats.lastTransaction 
            ? format(new Date(userStats.lastTransaction), "MMM d, yyyy")
            : "No contributions yet",
        },
        {
          label: "Next Due",
          value: format(nextContributionDate, "MMM d, yyyy"),
          alert: isContributionDue,
        }
      ],
      status: isContributionDue ? "warning" : "success",
    },
    {
      title: "Your Performance",
      value: `${userStats.successRate.toFixed(1)}%`,
      subtitle: "Success Rate",
      details: [
        {
          label: "Completed",
          value: `${userStats.completedTransactions} transactions`,
          color: "text-emerald-600",
        },
        {
          label: "Pending",
          value: `${userStats.pendingTransactions} transactions`,
          color: "text-amber-600",
        },
        {
          label: "Failed",
          value: `${userStats.failedTransactions} transactions`,
          color: "text-red-600",
        }
      ],
      status: userStats.successRate > 80 ? "success" : "warning",
    },
    {
      title: "Monthly Statistics",
      value: formatCurrency(userStats.averageAmount),
      subtitle: "Average Contribution",
      details: [
        {
          label: "Expected Monthly",
          value: formatCurrency(userStats.averageAmount),
        },
        {
          label: "Your Total",
          value: formatCurrency(userStats.totalAmount),
        }
      ],
      status: "info",
    },
    {
      title: "Pool Overview",
      value: formatCurrency(totalAmount),
      subtitle: "Total Pool Amount",
      details: [
        {
          label: "Your Share",
          value: `${((userStats.totalAmount / totalAmount) * 100).toFixed(1)}%`,
        },
        {
          label: "Monthly Target",
          value: formatCurrency(userStats.averageAmount * 12), // Yearly target
        }
      ],
      status: "success",
    },
  ];

  return (
    <>
      {stats.map((stat, index) => (
        <div
          key={index}
          className="glass-card p-6 hover:shadow-card-hover transition-all duration-200"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="p-16-semibold text-gray-600">{stat.title}</h3>
              <span
                className={`status-badge ${
                  stat.status === "success"
                    ? "status-completed"
                    : stat.status === "warning"
                    ? "status-pending"
                    : "bg-blue-50 text-blue-700"
                }`}
              >
                {stat.status.charAt(0).toUpperCase() + stat.status.slice(1)}
              </span>
            </div>

            <div>
              <p className="h3-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.subtitle}</p>
            </div>

            {/* Detailed Statistics */}
            <div className="pt-3 space-y-2 border-t border-gray-100">
              {stat.details.map((detail, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">{detail.label}</span>
                  <span className={`text-sm font-medium ${detail.color || 'text-gray-700'}`}>
                    {detail.value}
                    {detail.alert && (
                      <span className="ml-2 text-red-500">•</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </>
  );
};
