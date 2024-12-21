import React from "react";
import Image from "next/image";

const Banner = () => {
  return (
    <div className="container mx-auto">
      <div className="flex flex-col lg:flex-row items-center lg:items-center gap-12 lg:gap-20">
        {/* Text content */}
        <div className="lg:w-1/2">
          <h1 className="text-5xl lg:text-7xl font-bold mb-6 text-white  leading-tight">
            100% Transparent{" "}
            <span className="text-dark-600/85">Cash Paluwagan</span>
          </h1>
          <p className="text-white/85 text-lg lg:text-xl font-normal mb-10 leading-relaxed">
            Join our Paluwagan system and achieve your financial goals with
            ease! Contribute monthly, and receive the pooled funds through a
            fair, random selection. It&apos;s secure, transparent, and a
            cooperative way to support each other&apos;s dreams!
          </p>
        </div>

        {/* Image section */}
        <div className="lg:w-1/2">
          <div className="relative animate-float">
            {/* Shadow blur effect - adjusted opacity and color */}
            <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-4/5 h-8 bg-black/40 blur-2xl rounded-full"></div>
            {/* Purple glow effect - adjusted color and opacity */}
            <div className="absolute -inset-4 bg-purple-400/40 rounded-3xl blur-3xl"></div>
            <Image
              className="relative rounded-2xl shadow-2xl"
              src="/assets/images/banner.jpg"
              alt="Piggy bank"
              width={1200}
              height={900}
              priority
              style={{
                objectFit: "cover",
                maxWidth: "100%",
                height: "auto",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;
