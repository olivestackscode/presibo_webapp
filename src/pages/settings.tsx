import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button"; 
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ProfilePhotoUpload from "@/components/profile-photo-upload";

interface NotificationSettings {
  mealReminders: boolean;
  healthTips: boolean;
  readingReminders: boolean;
}

export default function Settings() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationSettings>({
    mealReminders: true,
    healthTips: true,
    readingReminders: false,
  });

  const formatName = (name: string | undefined | null): string => {
    if (!name) return '';
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const handleNotificationChange = (key: keyof NotificationSettings) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const settingsItems = [
    {
      icon: "fas fa-language",
      label: "Language",
      value: "English",
      color: "text-trust-blue"
    },
    {
      icon: "fas fa-shield-alt", 
      label: "Privacy & Security",
      color: "text-naija-green"
    },
    {
      icon: "fas fa-question-circle",
      label: "Help & Support", 
      color: "text-royal-purple"
    },
    {
      icon: "fas fa-info-circle",
      label: "About Presibo",
      color: "text-naija-green",
      action: () => window.location.href = '/about'
    }
  ];

  return (
    <div className="p-4 space-y-6">
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center">
            <i className="fas fa-cog text-gray-600 mr-2"></i>
            Settings
          </h2>
          
          {/* Profile Section */}
          <div className="mb-8">
            <h3 className="font-semibold text-lg mb-4">Profile</h3>
            <div className="flex items-center space-x-4 mb-4">
              <div className="relative">
                <Avatar className="w-16 h-16">
                  <AvatarImage 
                    src={user?.uploads ? `https://presibo-wl.vercel.app/photos/${user.uploads}` : ''} 
                    alt="Profile" 
                  />
                  <AvatarFallback className="bg-naija-green text-white text-xl">
                    {formatName(user?.FirstName)?.charAt(0) || user?.email.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1">
                  <ProfilePhotoUpload 
                    currentPhoto={user?.uploads}
                    onPhotoUpdate={(newPhoto) => {
                      // The component will handle cache invalidation
                      console.log('Profile photo updated:', newPhoto);
                    }}
                  >
                    <Button size="sm" className="h-8 w-8 rounded-full bg-naija-green hover:bg-naija-green/90 p-0">
                      <i className="fas fa-camera text-xs"></i>
                    </Button>
                  </ProfilePhotoUpload>
                </div>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-lg">
                  {user?.FirstName && user?.LastName 
                    ? `${formatName(user.FirstName)} ${formatName(user.LastName)}` 
                    : formatName(user?.FirstName) || 'User'}
                </h4>
                <p className="text-gray-600 text-sm">{user?.email || 'No email'}</p>
                <div className="mt-2">
                  <ProfilePhotoUpload 
                    currentPhoto={user?.uploads}
                    onPhotoUpdate={(newPhoto) => {
                      console.log('Profile photo updated:', newPhoto);
                    }}
                  >
                    <Button variant="outline" size="sm" className="text-xs">
                      <i className="fas fa-camera mr-1"></i>
                      Update Photo
                    </Button>
                  </ProfilePhotoUpload>
                </div>
              </div>
            </div>
            <Link href="/profile">
              <Button variant="outline" className="w-full">
                Edit Profile Details
              </Button>
            </Link>
          </div>
          
          {/* Notifications */}
          <div className="mb-8">
            <h3 className="font-semibold text-lg mb-4">Notifications</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Meal Reminders</div>
                  <div className="text-sm text-gray-600">Get notified for breakfast, lunch, and dinner</div>
                </div>
                <Switch
                  checked={notifications.mealReminders}
                  onCheckedChange={() => handleNotificationChange('mealReminders')}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Health Tips</div>
                  <div className="text-sm text-gray-600">Daily health advice and tips</div>
                </div>
                <Switch
                  checked={notifications.healthTips}
                  onCheckedChange={() => handleNotificationChange('healthTips')}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Reading Reminders</div>
                  <div className="text-sm text-gray-600">Reminders to check blood pressure and sugar</div>
                </div>
                <Switch
                  checked={notifications.readingReminders}
                  onCheckedChange={() => handleNotificationChange('readingReminders')}
                />
              </div>
            </div>
          </div>
          
          {/* App Settings */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">App Settings</h3>
            
            {settingsItems.map((item, index) => (
              <Button
                key={index}
                variant="ghost"
                onClick={item.action}
                className="w-full flex items-center justify-between p-4 border border-gray-100 rounded-xl h-auto"
              >
                <div className="flex items-center space-x-3">
                  <i className={`${item.icon} ${item.color}`}></i>
                  <span>{item.label}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {item.value && (
                    <span className="text-gray-600">{item.value}</span>
                  )}
                  <i className="fas fa-chevron-right text-gray-400"></i>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
