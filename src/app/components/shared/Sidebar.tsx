"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { navLinks } from "@/constants";
import { Button } from "../ui/button";

const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="sidebar-container custom-scrollbar">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <Link href="/" className="flex-center p-4">
          <Image
            src="/assets/images/logo-text.svg"
            alt="logo"
            width={200}
            height={38}
            className="object-contain"
          />
        </Link>

        {/* Navigation */}
        <nav className="flex flex-col flex-1">
          <SignedIn>
            {/* Primary Navigation - Dashboard */}
            <div className="px-2 mt-8">
              {navLinks.slice(0, 1).map((link) => {
                const isActive = link.route === pathname;
                return (
                  <Link
                    key={link.route}
                    href={link.route}
                    className={`sidebar-link ${
                      isActive ? "sidebar-link-active" : ""
                    }`}
                  >
                    <Image
                      src={link.icon}
                      alt={link.label}
                      width={24}
                      height={24}
                      className={isActive ? "brightness-0" : ""}
                    />
                    <span className="p-16-semibold">{link.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Bottom Section with Profile, Pay, and User Button */}
            <div className="mt-auto">
              {/* Separator */}
              <div className="px-2">
                <div className="h-px bg-gray-200" />
              </div>

              {/* Secondary Navigation - Profile & Pay */}
              <div className="px-2 py-4 space-y-1">
                {navLinks.slice(1).map((link) => {
                  const isActive = link.route === pathname;
                  return (
                    <Link
                      key={link.route}
                      href={link.route}
                      className={`sidebar-link ${
                        isActive ? "sidebar-link-active" : ""
                      }`}
                    >
                      <Image
                        src={link.icon}
                        alt={link.label}
                        width={24}
                        height={24}
                        className={isActive ? "brightness-0" : ""}
                      />
                      <span className="p-16-semibold">{link.label}</span>
                    </Link>
                  );
                })}

                {/* User Profile */}
                <div className="sidebar-link">
                  <UserButton
                    afterSwitchSessionUrl="/"
                    showName
                    appearance={{
                      elements: {
                        rootBox: "flex items-center gap-3 w-full",
                        avatarBox: "h-10 w-10",
                        username: "p-16-semibold text-gray-700",
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          </SignedIn>

          <SignedOut>
            <div className="px-2">
              <Button asChild className="btn-primary w-full">
                <Link href="/sign-in">Login</Link>
              </Button>
            </div>
          </SignedOut>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
