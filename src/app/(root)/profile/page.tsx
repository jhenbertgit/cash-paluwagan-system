import Image from "next/image";
import Header from "@/components/shared/Header";

import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getUserById } from "@/lib/actions/user.actions";

const Profile = async () => {
  const { userId } = await auth();

  if (!userId) redirect("/sign-in");

  const user = await getUserById(userId);

  return (
    <>
      <Header title="Profile" />

      <section className="profile">
        <div className="profile-balance">
          <p className="p-14-medium md:p-16-medium">BALANCE</p>
          <div className="mt-4 flex items-center gap-4">
            <Image
              src="/assets/icons/coins.svg"
              alt="coins"
              width={50}
              height={50}
              className="size-9 md:size-12"
            />
            <h2 className="h2-bold text-dark-600">{user.creditBalance}</h2>
          </div>
        </div>
      </section>
    </>
  );
};

export default Profile;
