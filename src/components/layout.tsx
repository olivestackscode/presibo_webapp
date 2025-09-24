import { ReactNode, useState } from "react";
import { Link } from "wouter";
import BottomNavigation from "./bottom-navigation";
import NotificationPopup from "./notification-popup";
import presiboLogo from "@assets/presibo-logo-removebg-preview_1751042157847.png";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [showNotifications, setShowNotifications] = useState(false);

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
  };

  const handleCloseNotifications = () => {
    setShowNotifications(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white shadow-lg z-50 border-b-2 border-naija-green">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <img 
              src={presiboLogo} 
              alt="Presibo Logo" 
              className="w-10 h-10"
            />
            <h1 className="text-xl font-bold text-naija-green">Presibo</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleNotificationClick}
              className="relative p-2 text-gray-600 hover:text-naija-green transition-colors"
            >
              <i className="fas fa-bell text-lg"></i>
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-health-pink rounded-full text-xs text-white flex items-center justify-center">3</span>
            </button>
            <Link href="/profile">
              <button className="w-8 h-8 bg-trust-blue rounded-full flex items-center justify-center hover:bg-opacity-90 transition-all">
                <i className="fas fa-user text-white text-sm"></i>
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16 pb-20">
        {children}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />

      {/* Notification Popup */}
      <NotificationPopup 
        isOpen={showNotifications} 
        onClose={handleCloseNotifications} 
      />
    </div>
  );
}
