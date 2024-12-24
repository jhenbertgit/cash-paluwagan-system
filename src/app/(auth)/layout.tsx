interface Props {
  children: React.ReactNode;
}

const AuthLayout = ({ children }: Props) => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-white p-4 sm:p-8">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
};

export default AuthLayout;
