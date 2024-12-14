import React from "react";

interface Props {
  children: React.ReactNode;
}

const Layout = ({ children }: Props) => {
  return <main className="auth">{children}</main>;
};

export default Layout;
