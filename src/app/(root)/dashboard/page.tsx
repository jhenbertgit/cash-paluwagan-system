import React from "react";
import Header from "@/components/shared/Header";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserById } from "@/lib/actions/user.actions";

const Dashboard = async () => {
  const { userId } = await auth();

  if (!userId) redirect("/sign-in");

  const user = await getUserById(userId);

  return (
    <>
      <Header title="Dashboard" />

      <section className="dashboard">
        <div className="dashboard-card">
          <h2 className="h2-bold mb-3">Welcome</h2>
          <h3 className="h3-bold text-dark-600">{user.firstName}</h3>
        </div>

        <div className="dashboard-container">
          <div className="dashboard-card">
            <h2 className="h2-bold mb-3">Payment Made</h2>
            <h3 className="h3-bold text-dark-600">data transaction</h3>
          </div>

          <div className="dashboard-card">
            <h2 className="h2-bold mb-3">Pooled Cash</h2>
            <h3 className="h3-bold text-dark-600">$10,000</h3>
          </div>

          <div className="dashboard-card">
            <h2 className="h2-bold mb-3">Total Members</h2>
            <h3 className="h3-bold text-dark-600">50</h3>
          </div>
        </div>
      </section>
    </>
  );
};

export default Dashboard;
