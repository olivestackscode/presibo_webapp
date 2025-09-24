import { useEffect } from 'react';
import { useAuth } from './use-auth';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';

export function useSessionTracking() {
  const { user } = useAuth();
  const [location] = useLocation();

  useEffect(() => {
    if (user) {
      trackSession();
    }
  }, [location, user]);

  const trackSession = async () => {
    if (!user) return;

    try {
      const referralId = `@PRESIBO${user.id}`;
      const sessionData = {
        userId: user.id,
        referralId: referralId,
        page: location,
        ipAddress: await getClientIP(),
        userAgent: navigator.userAgent
      };

      await apiRequest('POST', '/api/sessions/track', sessionData);
    } catch (error) {
      // Silently fail - don't disrupt user experience
      console.log('Session tracking failed:', error);
    }
  };

  const getClientIP = async (): Promise<string | null> => {
    try {
      // Use a reliable IP service for actual IP detection
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return null;
    }
  };
}