import Header from "@/components/shared/Header";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserById } from "@/lib/actions/user.actions";
import { getMemberContributionStats } from "@/lib/actions/transaction.action";
import { PaymentForm } from "@/components/forms/PaymentForm";

export const metadata = {
  title: "Pay | Paluwagan",
  description: "Make your monthly contribution securely through PayMongo",
};

const Pay = async () => {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await getUserById(userId);
  if (!user) redirect("/sign-in");

  const memberStats = await getMemberContributionStats(user._id as string);
  const stats = Array.isArray(memberStats) ? memberStats[0] : memberStats;

  const CONTRIBUTION_AMOUNT = 1000;

  return (
    <section className="section-container">
      <div className="space-y-8">
        {/* Header with Navigation */}
        <div className="flex items-start justify-between">
          <div>
            <Header
              title="Make Payment"
              subtitle="Submit your monthly contribution securely"
            />
          </div>
          <Link
            href="/profile"
            className="button-base bg-white hover:bg-gray-50 border border-gray-200"
          >
            ← Back to Profile
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Payment Methods Section */}
          <div className="lg:col-span-2">
            <div className="glass-card p-6 space-y-6">
              <div>
                <h3 className="h3-bold text-gray-900">Payment Methods</h3>
                <p className="text-gray-500 mt-1">
                  Choose your preferred payment method
                </p>
              </div>

              <div className="grid gap-4">
                {/* PayMongo Payment Methods */}
                <div className="payment-method-grid">
                  <div className="payment-option relative cursor-not-allowed opacity-60 group">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-blue-50 flex-center">
                        💸
                      </div>
                      <div>
                        <h4 className="p-16-semibold text-gray-900">GCash</h4>
                        <p className="text-sm text-gray-500">
                          Pay using GCash e-wallet
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-emerald-600 font-medium">
                      Instant confirmation
                    </span>
                    <div className="absolute invisible group-hover:visible bg-gray-900 text-white text-xs rounded py-1 px-2 -top-8 left-1/2 -translate-x-1/2">
                      Not available at this moment you may use Paymongo&apos;s
                      checkout page.
                    </div>
                  </div>

                  <div className="payment-option relative cursor-not-allowed opacity-60 group">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-green-50 flex-center">
                        💵
                      </div>
                      <div>
                        <h4 className="p-16-semibold text-gray-900">GrabPay</h4>
                        <p className="text-sm text-gray-500">
                          Pay using GrabPay wallet
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-emerald-600 font-medium">
                      Instant confirmation
                    </span>
                    <div className="absolute invisible group-hover:visible bg-gray-900 text-white text-xs rounded py-1 px-2 -top-8 left-1/2 -translate-x-1/2">
                      Not available at this moment you may use Paymongo&apos;s
                      checkout page.
                    </div>
                  </div>

                  <div className="payment-option relative cursor-not-allowed opacity-60 group">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gray-50 flex-center">
                        💳
                      </div>
                      <div>
                        <h4 className="p-16-semibold text-gray-900">
                          Credit/Debit Card
                        </h4>
                        <p className="text-sm text-gray-500">
                          Pay with any credit or debit card
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-blue-600 font-medium">
                      Secured by PayMongo
                    </span>
                    <div className="absolute invisible group-hover:visible bg-gray-900 text-white text-xs rounded py-1 px-2 -top-8 left-1/2 -translate-x-1/2">
                      Not available at this moment you may use Paymongo&apos;s
                      checkout page.
                    </div>
                  </div>

                  <div className="payment-option relative cursor-not-allowed opacity-60 group">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-purple-50 flex-center">
                        💰
                      </div>
                      <div>
                        <h4 className="p-16-semibold text-gray-900">Maya</h4>
                        <p className="text-sm text-gray-500">
                          Pay using Maya e-wallet
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-emerald-600 font-medium">
                      Instant confirmation
                    </span>
                    <div className="absolute invisible group-hover:visible bg-gray-900 text-white text-xs rounded py-1 px-2 -top-8 left-1/2 -translate-x-1/2">
                      Not available at this moment you may use Paymongo&apos;s
                      checkout page.
                    </div>
                  </div>
                </div>

                {/* Payment Form */}
                <PaymentForm
                  userId={user._id as string}
                  name={`${user.firstName} ${user.lastName ?? ""}`}
                  email={user.email}
                />
              </div>
            </div>
          </div>

          {/* Payment Summary Section */}
          <div className="lg:col-span-1">
            <div className="glass-card p-6 space-y-6">
              <div>
                <h3 className="h4-semibold text-gray-900">Payment Summary</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Review your contribution details
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Amount Due</span>
                    <span className="p-16-semibold text-gray-900">
                      ₱{CONTRIBUTION_AMOUNT.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Monthly contribution amount
                  </div>
                </div>

                {stats.pendingTransactions > 0 && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <span>⚠️</span>
                      <div>
                        <p className="text-sm text-amber-800 font-medium">
                          Pending Transactions
                        </p>
                        <p className="text-xs text-amber-700 mt-1">
                          You have {stats.pendingTransactions} pending
                          contribution
                          {stats.pendingTransactions > 1 ? "s" : ""}. Please
                          wait for confirmation.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="text-sm text-blue-900 font-medium mb-2">
                    Payment Security
                  </h4>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-xs text-blue-700">
                      <span>🔒</span>
                      <span>Secured by PayMongo</span>
                    </li>
                    <li className="flex items-center gap-2 text-xs text-blue-700">
                      <span>✓</span>
                      <span>Instant payment confirmation</span>
                    </li>
                    <li className="flex items-center gap-2 text-xs text-blue-700">
                      <span>💫</span>
                      <span>24/7 payment support</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pay;
