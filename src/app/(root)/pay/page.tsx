import Header from "@/components/shared/Header";
import Image from "next/image";

import { checkoutPayment } from "@/lib/actions/transaction.action";
import { getUserById } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { auth } from "@clerk/nextjs/server";

const Pay = async () => {
  const { userId } = await auth();

  if (!userId) redirect("/sign-in");

  const user = await getUserById(userId);

  const transaction: CheckoutTransactionParams = {
    name: `${user.firstName} ${user.lastName ?? ""}`,
    email: user.email,
    userId: user._id,
  };

  const onCheckOut = async () => {
    "use server";

    await checkoutPayment(transaction);
  };

  return (
    <>
      <Header
        title="Pay via E-Wallet"
        subtitle="Pay monthly amortization amounting to Php 1,000.00"
      />

      <div className="pay">
        {/* GCash Card */}
        <div className="pay-image">
          <Image
            src="/assets/images/logo-icon.png"
            alt="Icon logo"
            className="mx-auto mb-4 object-contain"
            height={200}
            width={200}
          />

          <form action={onCheckOut}>
            <Button
              type="submit"
              className="bg-purple-gradient bg-cover w-full py-6 text-lg font-semibold rounded-3xl hover:opacity-90 transition-all shadow-lg hover:shadow-xl"
            >
              Checkout Payment
            </Button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Pay;
