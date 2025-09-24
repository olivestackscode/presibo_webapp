import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'health' | 'meal' | 'appointment' | 'general';
  unread: boolean;
}

interface NotificationPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationPopup({ isOpen, onClose }: NotificationPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);

  // Sample notifications - in a real app, these would come from an API
  const notifications: NotificationItem[] = [
    {
      id: '1',
      title: 'Health Tip',
      message: 'Try replacing white rice with brown rice for better blood sugar control',
      time: '2 hours ago',
      type: 'health',
      unread: true
    },
    {
      id: '2',
      title: 'Meal Reminder',
      message: 'Time for your healthy lunch! Check your meal plan',
      time: '4 hours ago',
      type: 'meal',
      unread: true
    },
    {
      id: '3',
      title: 'Blood Pressure Check',
      message: 'Remember to take your evening blood pressure reading',
      time: '1 day ago',
      type: 'health',
      unread: false
    }
  ];

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'health':
        return 'fas fa-heartbeat text-health-pink';
      case 'meal':
        return 'fas fa-utensils text-warm-orange';
      case 'appointment':
        return 'fas fa-calendar text-trust-blue';
      default:
        return 'fas fa-info-circle text-naija-green';
    }
  };

  return (
    <div className="fixed inset-0 z-[60]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-20" onClick={onClose} />
      
      {/* Popup */}
      <div 
        ref={popupRef}
        className="absolute top-16 right-4 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-lg shadow-2xl border border-gray-200 max-h-96 overflow-hidden"
      >
        <CardHeader className="pb-3 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-800">
              Notifications
            </CardTitle>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <i className="fas fa-times text-gray-500"></i>
            </button>
          </div>
        </CardHeader>
        
        <CardContent className="p-0 max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <i className="fas fa-bell-slash text-2xl mb-2"></i>
              <p>No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                    notification.unread ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      <i className={`${getNotificationIcon(notification.type)} text-sm`}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className={`text-sm font-medium text-gray-900 ${
                          notification.unread ? 'font-semibold' : ''
                        }`}>
                          {notification.title}
                        </h4>
                        {notification.unread && (
                          <div className="w-2 h-2 bg-health-pink rounded-full flex-shrink-0"></div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {notification.time}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {notifications.length > 0 && (
            <div className="p-4 border-t border-gray-100 bg-gray-50">
              <button className="w-full text-center text-sm text-naija-green hover:text-naija-green/80 font-medium">
                View All Notifications
              </button>
            </div>
          )}
        </CardContent>
      </div>
    </div>
  );
}