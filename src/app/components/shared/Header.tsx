import React from "react";

interface Props {
  title: string;
  subtitle?: string;
}

const Header = ({ title, subtitle }: Props) => {
  return (
    <div className="mb-8">
      <h2 className="h2-bold text-gray-900">{title}</h2>
      {subtitle && (
        <p className="p-16-semibold mt-2 text-gray-600">{subtitle}</p>
      )}
    </div>
  );
};

export default Header;
