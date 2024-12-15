import GCash from "@/components/payments/Gcash";
import React from "react";

const Credits = () => {
  return (
    <div>
      <GCash amount={100} description="Testing bayad" />
    </div>
  );
};

export default Credits;
