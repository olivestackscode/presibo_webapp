import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

declare global {
  interface Window {
    PaystackPop: {
      setup: (config: {
        key: string;
        email: string;
        amount: number;
        onSuccess: (transaction: any) => void;
        onCancel: () => void;
        onError: (error: any) => void;
      }) => {
        openIframe: () => void;
      };
    };
  }
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  duration: string;
  amount: number; // Amount in kobo for Paystack
}

export default function Subscribe() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [autoRenewStates, setAutoRenewStates] = useState({
    monthly: false,
    weekly: false,
    daily: false,
    aidoc: false
  });

  const subscriptionPlans: SubscriptionPlan[] = [
    {
      id: 'monthly',
      name: 'Monthly Plan',
      price: 10000,
      duration: 'month',
      amount: 1000000 // 10,000 NGN in kobo
    },
    {
      id: 'weekly',
      name: 'Weekly Plan',
      price: 3000,
      duration: 'week',
      amount: 300000 // 3,000 NGN in kobo
    },
    {
      id: 'daily',
      name: 'Daily Plan',
      price: 500,
      duration: 'day',
      amount: 50000 // 500 NGN in kobo
    },
    {
      id: 'aidoc',
      name: 'AI Doc Chat',
      price: 1000,
      duration: 'week',
      amount: 100000 // 1,000 NGN in kobo
    }
  ];

  useEffect(() => {
    // Load Paystack script
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    document.head.appendChild(script);

    return () => {
      // Cleanup script when component unmounts
      document.head.removeChild(script);
    };
  }, []);

  const handleAutoRenewChange = (planId: string, checked: boolean) => {
    setAutoRenewStates(prev => ({
      ...prev,
      [planId]: checked
    }));
  };

  const getPlanBenefits = (planId: string) => {
    switch (planId) {
      case 'aidoc':
        return [
          '10 AI health consultations per week',
          'Personalized health advice',
          'Doctor recommendations based on symptoms',
          'Priority health alerts',
          'Chat history saved'
        ];
      case 'monthly':
        return [
          'Unlimited food analysis',
          'Comprehensive health tracking',
          'Doctor consultations',
          'Fitness goals tracking',
          'Priority support'
        ];
      case 'weekly':
        return [
          'Limited food analysis',
          'Basic health tracking',
          'Doctor consultations',
          'Fitness tracking',
          'Standard support'
        ];
      case 'daily':
        return [
          'Basic food analysis',
          'Daily health tips',
          'Doctor access',
          'Basic tracking',
          'Community support'
        ];
      default:
        return [];
    }
  };

  const handleSubscribe = (plan: SubscriptionPlan) => {
    if (!user?.email) {
      toast({
        title: "Authentication Required",
        description: "Please log in to subscribe",
        variant: "destructive",
      });
      return;
    }

    if (!window.PaystackPop) {
      toast({
        title: "Payment Loading",
        description: "Payment system is loading. Please try again in a moment.",
        variant: "destructive",
      });
      return;
    }

    const handler = window.PaystackPop.setup({
      key: 'pk_live_e4512c48de3fef4f92b4b278715d5decfa436d5b', // Live public key
      email: user.email,
      amount: plan.amount,
      onSuccess: async (transaction: any) => {
        console.log("Transaction Successful", transaction);
        
        // Create subscription record
        try {
          const startDate = new Date();
          const endDate = new Date();
          
          // Calculate end date based on plan duration
          switch (plan.duration) {
            case 'day':
              endDate.setDate(startDate.getDate() + 1);
              break;
            case 'week':
              endDate.setDate(startDate.getDate() + 7);
              break;
            case 'month':
              endDate.setMonth(startDate.getMonth() + 1);
              break;
          }
          
          const subscriptionData = {
            subscriptionType: plan.id,
            amount: plan.price,
            paymentReference: transaction.reference,
            paymentStatus: 'completed',
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            autoRenew: autoRenewStates[plan.id as keyof typeof autoRenewStates] || false,
            isActive: true,
            planName: plan.name,
            description: `${plan.name} - ${plan.duration}ly subscription`
          };
          
          await fetch('/api/subscriptions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(subscriptionData),
          });
          
          toast({
            title: "Payment Successful!",
            description: `Welcome to the ${plan.name}! Reference: ${transaction.reference}`,
          });
          
        } catch (error) {
          console.error('Error creating subscription:', error);
          toast({
            title: "Payment Successful!",
            description: `Payment processed but there was an issue activating your subscription. Please contact support. Reference: ${transaction.reference}`,
            variant: "destructive",
          });
        }
      },
      onCancel: () => {
        console.log("Payment Cancelled");
        toast({
          title: "Payment Cancelled",
          description: "Your payment was cancelled. You can try again anytime.",
          variant: "destructive",
        });
      },
      onError: (error: any) => {
        console.log("Error: ", error.message);
        toast({
          title: "Payment Failed",
          description: `An error occurred: ${error.message}`,
          variant: "destructive",
        });
      }
    });

    handler.openIframe();
  };

  return (
    <div className="p-4 space-y-6">
      {/* Elder Care Button */}
      <div className="text-center">
        <Button 
          onClick={() => setLocation('/elder-care')}
          className="bg-gradient-to-r from-warm-orange to-golden-yellow hover:from-warm-orange/90 hover:to-golden-yellow/90 text-white px-8 py-3 text-lg font-semibold rounded-xl shadow-lg"
        >
          <i className="fas fa-heart mr-3"></i>
          Elder Care Services
          <i className="fas fa-arrow-right ml-3"></i>
        </Button>
        <p className="text-sm text-gray-500 mt-2">Specialized care plans for elderly family members</p>
      </div>

      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-naija-green">Choose Your Plan</h1>
        <p className="text-gray-600">Select a subscription plan that works best for you</p>
      </div>

      {/* Subscription Plans */}
      <div className="space-y-4">
        {subscriptionPlans.map((plan) => (
          <Card key={plan.id} className="border-2 hover:border-naija-green transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{plan.name}</span>
                <span className="text-2xl font-bold text-naija-green">
                  ₦{plan.price.toLocaleString()} / {plan.duration}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Plan Benefits */}
              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="font-semibold text-sm mb-2">What's included:</h4>
                <ul className="space-y-1">
                  {getPlanBenefits(plan.id).map((benefit, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-600">
                      <i className="fas fa-check text-naija-green mr-2 text-xs"></i>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center justify-between">
                <Button
                  onClick={() => handleSubscribe(plan)}
                  className={`flex-1 mr-4 text-white ${
                    plan.id === 'aidoc' 
                      ? 'bg-purple-600 hover:bg-purple-700' 
                      : 'bg-naija-green hover:bg-naija-green/90'
                  }`}
                >
                  {plan.id === 'aidoc' ? (
                    <>
                      <i className="fas fa-robot mr-2"></i>
                      Subscribe for AI Chat
                    </>
                  ) : (
                    'Pay Now'
                  )}
                </Button>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id={`auto-renew-${plan.id}`}
                    checked={autoRenewStates[plan.id as keyof typeof autoRenewStates]}
                    onCheckedChange={(checked) => handleAutoRenewChange(plan.id, checked)}
                  />
                  <Label htmlFor={`auto-renew-${plan.id}`} className="text-sm">
                    Auto renew
                  </Label>
                </div>
              </div>
              
              {autoRenewStates[plan.id as keyof typeof autoRenewStates] && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    <i className="fas fa-info-circle mr-2"></i>
                    Auto-renewal is enabled. Your subscription will automatically renew every {plan.duration}.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Benefits Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <i className="fas fa-star text-golden-yellow mr-2"></i>
            Subscription Benefits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <i className="fas fa-check-circle text-naija-green mt-1"></i>
              <div>
                <h4 className="font-semibold">AI Health Analysis</h4>
                <p className="text-sm text-gray-600">Advanced food analysis and health recommendations</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <i className="fas fa-check-circle text-naija-green mt-1"></i>
              <div>
                <h4 className="font-semibold">AI Doc Consultations</h4>
                <p className="text-sm text-gray-600">10 weekly AI health consultations with personalized advice</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <i className="fas fa-check-circle text-naija-green mt-1"></i>
              <div>
                <h4 className="font-semibold">Doctor Consultations</h4>
                <p className="text-sm text-gray-600">Connect with verified Nigerian healthcare professionals</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <i className="fas fa-check-circle text-naija-green mt-1"></i>
              <div>
                <h4 className="font-semibold">Health Tracking</h4>
                <p className="text-sm text-gray-600">Monitor blood pressure, sugar levels, and fitness goals</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <i className="fas fa-check-circle text-naija-green mt-1"></i>
              <div>
                <h4 className="font-semibold">Doctor Recommendations</h4>
                <p className="text-sm text-gray-600">AI-powered doctor matching based on symptoms and location</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <i className="fas fa-check-circle text-naija-green mt-1"></i>
              <div>
                <h4 className="font-semibold">Personalized Tips</h4>
                <p className="text-sm text-gray-600">Daily health tips tailored to Nigerian lifestyle</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <i className="fas fa-shield-alt text-blue-600 mt-1"></i>
          <div>
            <h4 className="font-semibold text-blue-800">Secure Payment</h4>
            <p className="text-sm text-blue-600">
              Your payment is processed securely through Paystack. We don't store your payment information.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Support */}
      <Card className="bg-gradient-to-r from-naija-green/10 to-warm-orange/10">
        <CardContent className="p-6 text-center">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Need Help With Your Subscription?
          </h3>
          <p className="text-gray-600 mb-4">
            Our support team is here to help you with any questions about plans, payments, or features.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              className="bg-warm-orange hover:bg-warm-orange/90 text-white"
              onClick={() => window.open('tel:+2347032810862', '_self')}
            >
              <i className="fas fa-phone mr-2"></i>
              Call Support
            </Button>
            <Button 
              className="bg-naija-green hover:bg-naija-green/90 text-white"
              onClick={() => window.open('https://wa.me/2347032810862?text=Hello, I need help with my subscription', '_blank')}
            >
              <i className="fab fa-whatsapp mr-2"></i>
              WhatsApp Support
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}