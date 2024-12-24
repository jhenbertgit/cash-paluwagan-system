import MobileNav from "@/components/shared/MobileNav";
import Sidebar from "@/components/shared/Sidebar";

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="root-layout">
      {/* Sidebar - Hidden on mobile, visible on desktop */}
      <div className="hide-on-mobile">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="main-content">
        {/* Mobile Navigation - Visible on mobile/tablet, hidden on desktop */}
        <div className="show-on-mobile">
          <MobileNav />
        </div>

        {/* Content Container with proper padding and scrolling */}
        <div className="content-container">
          <div className="page-container">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RootLayout;
