"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "../ui/button";
import { navLinks } from "@/constants";

const MobileNav = () => {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`mobile-nav ${isScrolled ? 'shadow-sm' : ''}`}>
      <div className="mobile-nav-content">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/assets/images/logo-text.svg"
            alt="logo"
            width={180}
            height={28}
            className="object-contain"
          />
        </Link>

        <div className="flex items-center gap-4">
          <SignedIn>
            <UserButton afterSwitchSessionUrl="/" />
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Image
                    src="/assets/icons/menu.svg"
                    alt="menu"
                    width={24}
                    height={24}
                    className="cursor-pointer"
                  />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="sheet-content">
                <div className="flex flex-col h-full">
                  <Image
                    src="/assets/images/logo-text.svg"
                    alt="logo"
                    width={152}
                    height={23}
                  />

                  <nav className="mt-8 flex flex-col gap-2">
                    {navLinks.map((link) => {
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
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </SignedIn>

          <SignedOut>
            <Button asChild className="btn-primary">
              <Link href="/sign-in">Login</Link>
            </Button>
          </SignedOut>
        </div>
      </div>
    </nav>
  );
};

export default MobileNav;
