import React from "react";

interface Props {
  title: string;
  subtitle?: string;
}

const Header = ({ title, subtitle }: Props) => {
  return (
    <>
      <h2 className="h2-bold text-white/85">{title}</h2>
      {subtitle && (
        <p className="p-16-regular mt-4 text-white/85">{subtitle}</p>
      )}
    </>
  );
};

export default Header;
