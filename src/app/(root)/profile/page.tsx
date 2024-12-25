import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserById } from "@/lib/actions/user.actions";
import { getTransactionsByMember } from "@/lib/actions/transaction.action";
import { format } from "date-fns";
import Link from "next/link";
import { getMemberContributionStats } from "@/lib/actions/transaction.action";

interface UserDocument {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt?: Date;
  // ... other fields
}

const ProfilePage = async () => {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await getUserById(userId);

  if (!user) {
    redirect("/sign-in");
    return;
  }

  const userDocument = user as UserDocument;

  const userID = user._id as string;

  const memberStats = await getMemberContributionStats(userID);
  const stats = Array.isArray(memberStats) ? memberStats[0] : memberStats;

  const transactions = (await getTransactionsByMember(
    userID,
    6
  )) as PopulatedTransaction[];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  const formatDate = (dateString: string | Date | undefined) => {
    if (!dateString) return "Not available";

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Not available";

    return format(date, "MMM d, yyyy");
  };

  return (
    <div className="section-container">
      <div className="space-y-8">
        {/* Profile Header with Action Items */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="h1-bold text-gray-900">Profile</h1>
            <p className="text-gray-500">
              View and manage your contribution history and account details
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="button-base bg-white hover:bg-gray-50 border border-gray-200"
            >
              ← Back to Dashboard
            </Link>
            <Link
              href="/pay"
              className={`button-primary flex items-center gap-2 ${
                stats.pendingTransactions > 0 ? "animate-pulse" : ""
              }`}
            >
              <span>Make Contribution</span>
              <span>→</span>
            </Link>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Personal Information Card */}
          <div className="lg:col-span-2">
            <div className="glass-card p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-primary-100 flex-center">
                    <span className="h2-bold text-primary-600">
                      {userDocument.firstName[0]}
                      {userDocument.lastName[0]}
                    </span>
                  </div>
                  <div>
                    <h2 className="h3-bold text-gray-900">
                      {userDocument.firstName} {userDocument.lastName}
                    </h2>
                    <p className="text-gray-500">{userDocument.email}</p>
                  </div>
                </div>
                {stats.pendingTransactions > 0 && (
                  <div className="px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-700 font-medium">
                      {stats.pendingTransactions} pending contribution
                      {stats.pendingTransactions > 1 ? "s" : ""}
                    </p>
                  </div>
                )}
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p className="p-16-semibold text-gray-900">
                    {formatDate(userDocument.createdAt)}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Membership Status</p>
                  <div className="flex items-center gap-2">
                    <span className="status-badge status-completed">
                      Active Member
                    </span>
                    {stats.successRate >= 90 && (
                      <span className="badge bg-blue-50 text-blue-700">
                        🌟 Top Contributor
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contribution Summary Card */}
          <div className="glass-card p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="h4-semibold text-gray-900">
                  Contribution Summary
                </h3>
                <span className="text-xs text-gray-500">
                  Last updated: {formatDate(new Date())}
                </span>
              </div>

              <div className="space-y-3">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">
                      Total Contributed
                    </span>
                    <span className="p-16-semibold text-gray-900">
                      {formatCurrency(stats.totalAmount || 0)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Over {stats.transactionCount || 0} transactions
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">Success Rate</span>
                    <span
                      className={`p-16-semibold ${
                        stats.successRate > 80
                          ? "text-emerald-600"
                          : stats.successRate > 60
                          ? "text-amber-600"
                          : "text-red-600"
                      }`}
                    >
                      {stats.successRate?.toFixed(1) || "0.0"}%
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {stats.completedTransactions || 0} successful out of{" "}
                    {stats.transactionCount || 0}
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">
                      Average Contribution
                    </span>
                    <span className="p-16-semibold text-gray-900">
                      {formatCurrency(stats.averageAmount || 0)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">Per transaction</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions Section */}
        <div className="glass-card p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="h4-semibold text-gray-900">Recent Transactions</h3>
              <p className="text-sm text-gray-500">
                Your last {Math.min(transactions.length, 5)} contribution
                activities
              </p>
            </div>
            <div className="flex items-center gap-3">
              {transactions.length > 5 && (
                <Link
                  href="/transactions"
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                >
                  View All Transactions
                  <span aria-hidden="true">→</span>
                </Link>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="text-left p-3 text-sm font-semibold text-gray-600">
                    Date
                  </th>
                  <th className="text-left p-3 text-sm font-semibold text-gray-600">
                    Amount
                  </th>
                  <th className="text-left p-3 text-sm font-semibold text-gray-600">
                    Status
                  </th>
                  <th className="text-right p-3 text-sm font-semibold text-gray-600">
                    Payment Method
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions
                  .slice(0, 5)
                  .map((transaction: PopulatedTransaction) => (
                    <tr key={transaction._id} className="hover:bg-gray-50/50">
                      <td className="p-3 text-sm text-gray-600">
                        {formatDate(transaction.createdAt)}
                      </td>
                      <td className="p-3 text-sm font-medium text-gray-900">
                        {formatCurrency(transaction.amount)}
                      </td>
                      <td className="p-3">
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
                      </td>
                      <td className="p-3 text-right text-sm text-gray-600">
                        <span className="inline-flex items-center gap-1">
                          {transaction.paymentMethod ? (
                            <>
                              {(() => {
                                switch (transaction.paymentMethod) {
                                  case "gcash":
                                    return "💸 GCash";
                                  case "paymaya":
                                    return "💳 PayMaya";
                                  case "grab_pay":
                                    return "💵 GrabPay";
                                  case "card":
                                    return "💳 Card";
                                  default:
                                    return transaction.paymentMethod;
                                }
                              })()}
                            </>
                          ) : (
                            "N/A"
                          )}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>

            {transactions.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No transactions yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
