import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Crown, Check, ArrowLeft, Calendar, DollarSign, Users, Phone, MessageCircle } from "lucide-react";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Declare Paystack interface for TypeScript
declare global {
  interface Window {
    PaystackPop: any;
  }
}

// Load Paystack script
const loadPaystackScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.PaystackPop) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Paystack script'));
    document.head.appendChild(script);
  });
};

export default function HealthTipsSubscription() {
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paystackLoaded, setPaystackLoaded] = useState(false);
  const { toast } = useToast();

  // Load Paystack script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.onload = () => setPaystackLoaded(true);
    script.onerror = () => {
      console.error('Failed to load Paystack script');
      toast({
        title: "Payment Error",
        description: "Failed to load payment system. Please refresh the page.",
        variant: "destructive",
      });
    };
    document.head.appendChild(script);

    return () => {
      //document.head.removeChild(script);
    };
  }, []);

  const { data: user } = useQuery({
    queryKey: ['/api/user'],
    retry: false,
  });

  const { data: subscription } = useQuery({
    queryKey: ['/api/health-tips-subscriptions/user'],
    retry: false,
  });

  const plans = [
    {
      id: "monthly",
      name: "Monthly Plan",
      price: 450,
      priceText: "₦450/month",
      billingCycle: "monthly",
      paystackPlan: "PLN_x87irt9cl480knk",
      features: [
        "Daily personalized health tips",
        "Nigerian-focused wellness advice",
        "Blood pressure & diabetes management tips",
        "Nutrition recommendations",
        "Exercise and fitness guidance",
        "Heart health insights",
        "Mental health support",
        "Hygiene and prevention tips",
        "Priority customer support",
        "Exclusive wellness content",
        "Cancel anytime with no penalty"
      ],
      recommended: true
    },
    {
      id: "yearly",
      name: "Yearly Plan", 
      price: 550,
      priceText: "₦550/year",
      billingCycle: "yearly",
      paystackPlan: "PLN_nd795excv68dnp9",
      features: [
        "Daily personalized health tips",
        "Nigerian-focused wellness advice",
        "Blood pressure & diabetes management tips",
        "Nutrition recommendations",
        "Exercise and fitness guidance",
        "Heart health insights",
        "Mental health support",
        "Hygiene and prevention tips",
        "Priority customer support",
        "Exclusive wellness content"
      ],
      savings: "Save ₦9,000 per year"
    }
  ];

  const handlePayment = async (plan: typeof plans[0]) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to subscribe to health tips.",
        variant: "destructive",
      });
      return;
    }

    if (!paystackLoaded || !window.PaystackPop) {
      toast({
        title: "Payment Error",
        description: "Payment system is loading. Please try again in a moment.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setSelectedPlan(plan.id);

    // Ensure Paystack script is loaded
    if (!window.PaystackPop) {
      try {
        await loadPaystackScript();
      } catch (error) {
        console.error('Failed to load Paystack script:', error);
        toast({
          title: "Payment Error",
          description: "Failed to load payment system. Please refresh the page and try again.",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }
    }

    try {
      console.log('Initializing payment with:', {
        key: 'pk_live_e4512c48de3fef4f92b4b278715d5decfa436d5b',
        plan: plan.paystackPlan,
        email: user.email,
        amount: plan.price * 100,
        currency: 'NGN',
        ref: `health-tips-${Date.now()}`,
        PaystackPop: !!window.PaystackPop
      });

      const handler = window.PaystackPop.setup({
        key: 'pk_live_e4512c48de3fef4f92b4b278715d5decfa436d5b',
        plan: plan.paystackPlan,
        email: user.email,
        amount: plan.price * 100,
        currency: 'NGN',
        ref: `health-tips-${Date.now()}`,
        metadata: {
          custom_fields: [
            {
              display_name: "User ID",
              variable_name: "user_id",
              value: user.id.toString()
            },
            {
              display_name: "Plan Type",
              variable_name: "plan_type",
              value: plan.name
            },
            {
              display_name: "Billing Cycle",
              variable_name: "billing_cycle",
              value: plan.billingCycle
            }
          ]
        },
        callback: function(response: any) {
          // Create health tips subscription record
          const healthTipsPromise = apiRequest('/api/health-tips-subscriptions', 'POST', {
            planType: plan.billingCycle, // Use 'monthly' or 'yearly' instead of plan name
            amount: plan.price,
            paymentReference: response.reference,
            paystackPlanCode: plan.paystackPlan,
            status: 'active'
          });
          
          // Create main subscription record for unified tracking
          const startDate = new Date();
          const endDate = new Date();
          
          // Calculate end date based on plan type
          if (plan.billingCycle === 'monthly') {
            endDate.setMonth(startDate.getMonth() + 1);
          } else if (plan.billingCycle === 'yearly') {
            endDate.setFullYear(startDate.getFullYear() + 1);
          }
          
          const mainSubscriptionPromise = fetch('/api/subscriptions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              subscriptionType: 'health_tips',
              amount: plan.price,
              paymentReference: response.reference,
              paymentStatus: 'completed',
              startDate: startDate.toISOString(),
              endDate: endDate.toISOString(),
              autoRenew: true,
              isActive: true,
              planName: `Health Tips - ${plan.name}`,
              description: `Daily personalized health tips - ${plan.billingCycle} subscription`
            }),
          });
          
          Promise.all([healthTipsPromise, mainSubscriptionPromise]).then(() => {
            toast({
              title: "Subscription Successful!",
              description: `You've successfully subscribed to ${plan.name}. You'll now receive daily personalized health tips.`,
              variant: "default",
            });

            // Refresh subscription data
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          }).catch((error: any) => {
            console.error('Subscription creation error:', error);
            toast({
              title: "Subscription Processing Error",
              description: "Payment successful but subscription setup failed. Please contact support.",
              variant: "destructive",
            });
          });
        },
        onClose: () => {
          setIsProcessing(false);
          setSelectedPlan("");
          toast({
            title: "Payment Cancelled",
            description: "Your subscription payment was cancelled.",
            variant: "destructive",
          });
        }
      });

      handler.openIframe();
    } catch (error: any) {
      console.error('Payment initialization error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        plan: plan,
        user: user,
        PaystackPop: !!window.PaystackPop
      });
      toast({
        title: "Payment Error",
        description: `Failed to initialize payment: ${error.message || 'Unknown error'}. Please try again.`,
        variant: "destructive",
      });
      setIsProcessing(false);
      setSelectedPlan("");
    }
  };

  if (subscription && subscription.status === 'active') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <Link href="/">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              <span className="text-sm font-medium">Premium Member</span>
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Health Tips Subscription
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              You're currently subscribed to our premium health tips service
            </p>
          </div>

          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Crown className="h-8 w-8 text-yellow-500" />
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Active Subscription
                </Badge>
              </div>
              <CardTitle className="text-2xl">{subscription.planType}</CardTitle>
              <CardDescription className="text-lg">
                ₦{subscription.amount.toLocaleString()}/{subscription.billingCycle}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <span>Started: {new Date(subscription.startDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-green-500" />
                  <span>Expires: {new Date(subscription.endDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-yellow-500" />
                  <span>Auto-renew: {subscription.autoRenew ? 'Enabled' : 'Disabled'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Status: Active</span>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-3">Your Benefits:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {[
                    "Daily personalized health tips",
                    "Nigerian-focused wellness advice",
                    "Blood pressure & diabetes management",
                    "Nutrition recommendations",
                    "Exercise and fitness guidance",
                    "Heart health insights",
                    "Mental health support",
                    "Hygiene and prevention tips"
                  ].map((benefit, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Need Help?
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Contact our support team for subscription management or health tips customization.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => window.open('tel:+2347032810862')}
                    className="flex items-center gap-2"
                  >
                    <Phone className="h-4 w-4" />
                    Call Support
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => window.open('https://wa.me/2347032810862?text=Hello, I need help with my Health Tips subscription')}
                    className="flex items-center gap-2"
                  >
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp Support
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          {user && (
            <div className="text-sm text-gray-600">
              Welcome, {user.firstName || user.FirstName || 'User'}
            </div>
          )}
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Daily Health Tips Subscription
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Get personalized health tips delivered daily to help you maintain optimal wellness with Nigerian-focused advice and expert guidance.
          </p>
          <div className="mt-6">
            <p className="text-sm text-gray-500">
              Complete your wellness journey by subscribing to our premium health tips service
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative ${plan.recommended ? 'ring-2 ring-green-500 shadow-lg' : ''}`}
            >
              {plan.recommended && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-green-500 text-white px-4 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Crown className="h-8 w-8 text-yellow-500" />
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription className="text-3xl font-bold text-gray-900">
                  {plan.priceText}
                </CardDescription>
                {plan.savings && (
                  <Badge variant="secondary" className="mt-2 bg-green-100 text-green-800">
                    {plan.savings}
                  </Badge>
                )}
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={() => handlePayment(plan)}
                  disabled={isProcessing}
                >
                  {isProcessing && selectedPlan === plan.id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Crown className="h-4 w-4 mr-2" />
                      Subscribe Now
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-center">What You'll Get</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Daily Tips</h3>
              <p className="text-sm text-gray-600">
                Receive personalized health tips every day tailored to your health profile and goals.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Nigerian Focus</h3>
              <p className="text-sm text-gray-600">
                Health advice specifically designed for Nigerian lifestyle, diet, and health challenges.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Crown className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Expert Guidance</h3>
              <p className="text-sm text-gray-600">
                Tips from healthcare professionals covering nutrition, exercise, mental health, and more.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Secure payments • Cancel anytime • 24/7 support available
          </p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => window.open('tel:+2347032810862')}
              className="flex items-center gap-2"
            >
              <Phone className="h-4 w-4" />
              +234 703 281 0862
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => window.open('https://wa.me/2347032810862?text=Hello, I have questions about the Health Tips subscription')}
              className="flex items-center gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp Support
            </Button>
          </div>
        </div>
      </div>

    </div>
  );
}