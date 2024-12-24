import Banner from "@/components/shared/Banner";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home | Paluwagan",
  description: "Welcome to Paluwagan - Modern and transparent cash management system",
};

const Home = () => {
  return (
    <div className="bg-pattern min-h-screen">
      <div className="page-container">
        <Banner />
      </div>
    </div>
  );
};

export default Home;
