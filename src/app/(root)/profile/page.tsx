import Image from "next/image";
import Header from "@/components/shared/Header";
import TableData from "@/components/shared/TableData";

import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getUserById } from "@/lib/actions/user.actions";
import {
  getMemberTransactionStats,
  getMemberTransactions,
} from "@/lib/actions/transaction.action";

const Profile = async () => {
  const { userId } = await auth();

  if (!userId) redirect("/sign-in");

  const user = await getUserById(userId);

  const stat = await getMemberTransactionStats(user._id);

  const transactions = await getMemberTransactions(user._id);

  return (
    <>
      <Header title="Profile" />

      <section className="profile mb-4">
        <div className="profile-balance">
          <p className="p-14-medium md:p-16-medium">Total Amount Paid</p>
          <div className="mt-4 flex items-center gap-4">
            <Image
              src="/assets/icons/coins.svg"
              alt="coins"
              width={50}
              height={50}
              className="size-9 md:size-12"
            />
            <h2 className="h2-bold text-dark-600">
              ₱{" "}
              {stat.totalAmount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h2>
          </div>
        </div>
      </section>

      <TableData data={transactions} />
    </>
  );
};

export default Profile;
