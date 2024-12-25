"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

const Banner = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 15 },
    },
  };

  return (
    <div className="page-container">
      <motion.div
        className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Text content */}
        <motion.div className="lg:w-1/2 space-y-6" variants={itemVariants}>
          <div className="space-y-4">
            <motion.h1 
              className="h1-bold"
              variants={itemVariants}
            >
              <span className="gradient-primary gradient-text">
                100% Transparent
              </span>{" "}
              <span className="text-gray-900">Cash Paluwagan</span>
            </motion.h1>
            <motion.p 
              className="p-18-semibold text-gray-600"
              variants={itemVariants}
            >
              Join our Paluwagan system and achieve your financial goals with
              ease! Contribute monthly, and receive the pooled funds through a
              fair, random selection.
            </motion.p>
          </div>

          <motion.div 
            className="flex flex-wrap gap-4" 
            variants={itemVariants}
          >
            <div className="glass-card px-4 py-2 flex items-center gap-2">
              <span className="text-blue-600">🔒</span>
              <span className="p-16-semibold text-gray-700">Secure System</span>
            </div>
            <div className="glass-card px-4 py-2 flex items-center gap-2">
              <span className="text-blue-600">🎯</span>
              <span className="p-16-semibold text-gray-700">Fair Selection</span>
            </div>
            <div className="glass-card px-4 py-2 flex items-center gap-2">
              <span className="text-blue-600">📊</span>
              <span className="p-16-semibold text-gray-700">Full Transparency</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Image section */}
        <motion.div 
          className="lg:w-1/2"
          variants={itemVariants}
        >
          <div className="relative">
            {/* Modern gradient background */}
            <div className="absolute -inset-4 bg-gradient-to-r from-[hsl(var(--primary-blue)/0.2)] to-[hsl(var(--primary-purple)/0.2)] rounded-3xl blur-3xl"></div>
            
            {/* Image container */}
            <motion.div
              className="relative rounded-2xl overflow-hidden shadow-elevated"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Image
                className="w-full h-auto rounded-2xl"
                src="/assets/images/banner.jpg"
                alt="Paluwagan System"
                width={1200}
                height={900}
                priority
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQtJSEkMjU1LC0yMi4xODY6Oj03MjU5RUVHUkNESk5PT0VVWVNSWERKTUr/2wBDAR..."
                style={{
                  objectFit: "cover",
                  width: "100%",
                  height: "auto",
                }}
              />
              
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--primary-blue)/0.1)] to-transparent"></div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Banner;
