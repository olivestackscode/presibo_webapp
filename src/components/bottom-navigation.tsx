import { useLocation } from "wouter";
import { Link } from "wouter";

const navItems = [
  {
    path: "/",
    icon: "fas fa-home",
    label: "Home",
    page: "dashboard"
  },
  {
    path: "/doctors",
    icon: "fas fa-user-md", 
    label: "Doctors",
    page: "doctors"
  },
  {
    path: "/fitness",
    icon: "fas fa-dumbbell", 
    label: "Fitness",
    page: "fitness"
  },
  {
    path: "/pulse",
    icon: "fas fa-play-circle", 
    label: "Pulse",
    page: "pulse"
  },
  {
    path: "/ai-doc",
    icon: "fas fa-robot",
    label: "AI Doc",
    page: "ai-doc"
  },
  {
    path: "/tracking",
    icon: "fas fa-chart-line",
    label: "Track", 
    page: "tracking"
  }
];

export default function BottomNavigation() {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = location === item.path;
          return (
            <Link key={item.path} href={item.path}>
              <button 
                className={`flex flex-col items-center py-2 px-3 transition-colors ${
                  isActive ? 'text-naija-green' : 'text-gray-400'
                }`}
              >
                <i className={`${item.icon} text-lg mb-1`}></i>
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
