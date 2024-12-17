import Header from "@/components/shared/Header";
import { Button } from "@/components/ui/button";
import { checkoutPayment } from "@/lib/actions/transaction.action";
import { getUserById } from "@/lib/actions/user.actions";
import { auth } from "@clerk/nextjs/server";
import Image from "next/image";
import { redirect } from "next/navigation";

const Credits = async () => {
  const { userId } = await auth();

  if (!userId) redirect("/sign-in");

  const user = await getUserById(userId);

  const billing: CheckoutTransactionParams = {
    name: `${user.firstName} ${user.lastName}`,
    email: user.email,
  };

  const onCheckOut = async () => {
    "use server";

    await checkoutPayment(billing);
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

          <form action={onCheckOut} method="POST">
            <Button
              type="submit"
              className="button bg-purple-gradient bg-cover w-full"
            >
              Checkout Payment
            </Button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Credits;
