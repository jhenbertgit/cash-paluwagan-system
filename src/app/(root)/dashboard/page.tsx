/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import Header from "@/app/components/shared/Header";
import { DashboardCharts } from "@/app/components/shared/DashboardCharts";
import { isBefore } from "date-fns";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserById, getTotalUsers } from "@/lib/actions/user.actions";
import { selectCashRecipient } from "@/lib/actions/recipient.actions";
import { StatsCards } from "@/app/components/shared/StatsCards";
import { TransactionsTable } from "@/app/components/shared/TransactionsTable";
import { format } from "date-fns";
import {
  getMemberContributionStats,
  getMemberMonthlyStats,
  getTransactions,
  getContributionSummary,
} from "@/lib/actions/transaction.action";

export const metadata = {
  title: "Dashboard | Paluwagan",
  description: "Monitor your contributions and system statistics",
};

const Dashboard = async () => {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  try {
    const user = await getUserById(userId);
    if (!user) redirect("/sign-in");

    const userID = user._id as string;

    const summary = (await getContributionSummary()) || {
      totalAmount: 0,
      totalTransactions: 0,
    };

    const totalMembers = (await getTotalUsers()) || 0;

    // Ensure rawStat is treated as a single object
    const rawStat = (await getMemberContributionStats(userID)) || {
      transactionCount: 0,
      lastTransaction: new Date(),
      completedTransactions: 0,
      failedTransactions: 0,
      pendingTransactions: 0,
      totalAmount: 0,
      averageAmount: 0,
      successRate: 0,
    };

    const stat = {
      transactionCount: Array.isArray(rawStat)
        ? rawStat[0].transactionCount || 0
        : rawStat.transactionCount || 0,
      lastTransaction: Array.isArray(rawStat)
        ? rawStat[0].lastTransaction?.toISOString() || new Date().toISOString()
        : rawStat.lastTransaction?.toISOString() || new Date().toISOString(),
      completedTransactions: Array.isArray(rawStat)
        ? rawStat[0].completedTransactions || 0
        : rawStat.completedTransactions || 0,
      failedTransactions: Array.isArray(rawStat)
        ? rawStat[0].failedTransactions || 0
        : rawStat.failedTransactions || 0,
      pendingTransactions: Array.isArray(rawStat)
        ? rawStat[0].pendingTransactions || 0
        : rawStat.pendingTransactions || 0,
      totalAmount: Array.isArray(rawStat)
        ? rawStat[0].totalAmount || 0
        : rawStat.totalAmount || 0,
      averageAmount: Array.isArray(rawStat)
        ? rawStat[0].averageAmount || 0
        : rawStat.averageAmount || 0,
      successRate: Array.isArray(rawStat)
        ? rawStat[0].successRate || 0
        : rawStat.successRate || 0,
    };

    const monthlyStats = (await getMemberMonthlyStats(userID)) || [];
    const formattedMonthlyStats = monthlyStats
      .map((stat: any) => {
        const date = new Date(stat.month);
        // Check if date is valid before formatting
        if (isNaN(date.getTime())) {
          return {
            month: "Unknown",
            amount: stat.totalAmount || 0,
          };
        }
        return {
          month: date.toLocaleDateString("en-PH", {
            month: "short",
            year: "numeric",
          }),
          amount: stat.totalAmount || 0,
        };
      })
      .filter((stat: any) => stat.month !== "Unknown");

    // Calculate next contribution date
    const lastContributionDate = stat.lastTransaction
      ? new Date(stat.lastTransaction)
      : new Date();

    const nextContributionDate = new Date(
      lastContributionDate.getFullYear(),
      lastContributionDate.getMonth() + 1,
      30
    );

    // Check if contribution is due
    const isContributionDue = isBefore(nextContributionDate, new Date());

    // Get all transactions and serialize them
    const rawTransactions = await getTransactions();
    const allTransactions = rawTransactions.map((t: any) => ({
      id: t._id?.toString() || "",
      amount: t.amount || 0,
      status: t.status || "unknown",
      createdAt:
        t.createdAt instanceof Date
          ? t.createdAt.toISOString()
          : new Date(t.createdAt).toISOString(),
      member: {
        firstName: t.member?.firstName || "Unknown",
        lastName: t.member?.lastName || "User",
        email: t.member?.email || "N/A",
      },
    }));

    // Get current cash recipient and serialize
    const rawRecipient = await selectCashRecipient();
    const recipientInfo =
      rawRecipient && rawRecipient.member
        ? {
            member: {
              firstName: rawRecipient.member.firstName,
              lastName: rawRecipient.member.lastName,
            },
          }
        : null;

    // Ensure recipientInfo is not null before accessing properties
    const recipientDisplay = recipientInfo ? (
      <div className="mt-4 p-4 bg-primary-50 rounded-lg border border-primary-100">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary-100 flex-center">
            {recipientInfo.member.firstName[0]}
            {recipientInfo.member.lastName[0]}
          </div>
          <div>
            <div className="p-16-semibold text-gray-900">
              {recipientInfo.member.firstName} {recipientInfo.member.lastName}
            </div>
            <p className="text-sm text-gray-500">Current Month Recipient</p>
          </div>
        </div>
      </div>
    ) : (
      <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
        <div className="flex items-center gap-3">
          <span className="text-emerald-500">ℹ️</span>
          <p className="text-sm text-emerald-700 font-medium">
            Selection will be made once all members have contributed
          </p>
        </div>
      </div>
    );

    // Update the data processing for charts
    const processedData = {
      memberContributions: allTransactions
        .filter((t: any) => t.status === "completed")
        .reduce((acc: any[], t: any) => {
          const existingMember = acc.find(
            (m: any) =>
              m.memberName === `${t.member.firstName} ${t.member.lastName}`
          );

          if (existingMember) {
            existingMember.amount += t.amount;
          } else {
            acc.push({
              memberName: `${t.member.firstName} ${t.member.lastName}`,
              amount: t.amount,
            });
          }
          return acc;
        }, []),

      // Update how we process status counts
      memberStatuses: {
        completed: allTransactions.filter((t: any) => t.status === "completed")
          .length,
        pending: allTransactions.filter((t: any) => t.status === "pending")
          .length,
        failed: allTransactions.filter((t: any) => t.status === "failed")
          .length,
      },

      monthlyStats: formattedMonthlyStats,
    };

    return (
      <section className="section-container">
        <div className="space-y-8">
          {/* Header with Action Button */}
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <Header
                title="Dashboard Overview"
                subtitle="Monitor your contributions and system statistics"
              />
              <p className="text-sm text-gray-500">
                Next contribution due:{" "}
                {format(nextContributionDate, "MMMM d, yyyy")}
              </p>
            </div>

            {isContributionDue && (
              <a
                href="/pay"
                className="button-primary flex items-center gap-2 animate-pulse"
              >
                <span>Make Contribution</span>
                <span>→</span>
              </a>
            )}
          </div>

          {/* Quick Stats Overview */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatsCards
              userStats={stat}
              totalAmount={summary.totalAmount}
              nextContributionDate={nextContributionDate}
              isContributionDue={isContributionDue}
            />
          </div>

          {/* System Info Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Current Recipient Card */}
            <div className="glass-card p-6 hover:shadow-card-hover transition-all">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="h3-bold text-gray-900">Current Recipient</h3>
                  <p className="text-sm text-gray-500">
                    Selected member for this month&apos;s pool
                  </p>
                </div>
                {isContributionDue && (
                  <span className="badge badge-warning">Action Required</span>
                )}
              </div>
              {recipientDisplay}
            </div>

            {/* System Stats Card */}
            <div className="glass-card p-6 hover:shadow-card-hover transition-all">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="h3-bold text-gray-900">System Statistics</h3>
                  <p className="text-sm text-gray-500">
                    Overall system performance
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <div className="stat-item">
                  <span className="stat-label">Active Members</span>
                  <span className="stat-value">{totalMembers}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Total Contributions</span>
                  <span className="stat-value">
                    {summary.totalTransactions}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Success Rate</span>
                  <span className="stat-value">
                    {stat.successRate.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Analytics Section */}
          <div className="glass-card p-6 hover:shadow-card-hover transition-all">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="h3-bold text-gray-900">
                    Contribution Analytics
                  </h3>
                  <p className="text-sm text-gray-500">
                    Track contribution patterns and member participation
                  </p>
                </div>
                <select className="select-base">
                  <option>Last 6 months</option>
                  <option>This year</option>
                  <option>All time</option>
                </select>
              </div>
              <DashboardCharts {...processedData} />
            </div>
          </div>

          {/* Transactions Section */}
          <TransactionsTable transactions={allTransactions} />
        </div>
      </section>
    );
  } catch (error) {
    console.error("Dashboard Error:", error);
    return (
      <div className="flex-center flex-col min-h-[60vh] gap-4">
        <h3 className="h3-bold text-gray-900">Something went wrong</h3>
        <p className="text-gray-500">Please try again later</p>
      </div>
    );
  }
};

export default Dashboard;
