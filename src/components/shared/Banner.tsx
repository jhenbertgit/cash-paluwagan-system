import React from "react";
import Image from "next/image";

const Banner = () => {
  return (
    <>
      <div className="px-2 lg:pt-4">
        <div className="flex flex-col lg:flex-row items-center lg:items-start lg:justify-between">
          <div className="lg:w-7/12 text-center lg:text-left">
            <h1 className="text-4xl lg:text-7xl font-bold mb-5 text-white">
              100% Transparent <br /> Cash Paluwagan
            </h1>
            <p className="text-white/85 md:text-lg font-normal mb-10 px-4">
              Join our Paluwagan system and achieve your financial goals with
              ease! Contribute monthly, and receive the pooled funds through a
              fair, random selection. It&apos;s secure, transparent, and a
              cooperative way to support each other&apos;s dreams!
            </p>
          </div>

          <div className="lg:w-5/12 flex items-center">
            <div className="relative animate-float">
              <Image
                className="rounded-lg shadow-lg"
                src="/assets/images/banner.jpg"
                alt="Piggy bank"
                width={1013}
                height={760}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Banner;
