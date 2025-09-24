import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Crown, Check, Heart, Shield, TrendingUp, X } from "lucide-react";
import { Link } from "wouter";

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

interface HealthTipsPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HealthTipsPopup({ isOpen, onClose }: HealthTipsPopupProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isYearly, setIsYearly] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['/api/user'],
    retry: false,
  });

  const { data: subscription } = useQuery({
    queryKey: ['/api/health-tips-subscriptions/user'],
    retry: false,
  });

  // Don't show popup if user already has an active subscription
  if (subscription && subscription.status === 'active') {
    return null;
  }

  const monthlyPlan = {
    name: "Monthly Plan",
    price: 450,
    priceText: "₦450/month",
    billingCycle: "monthly",
    paystackPlan: "PLN_x87irt9cl480knk",
    features: [
      "Daily personalized health tips",
      "Nigerian-focused wellness advice", 
      "Blood pressure & diabetes management",
      "Nutrition recommendations",
      "Exercise and fitness guidance",
      "Priority customer support",
      "Exclusive wellness content"
    ]
  };

  const yearlyPlan = {
    name: "Yearly Plan",
    price: 550,
    priceText: "₦550/year",
    billingCycle: "yearly",
    paystackPlan: "PLN_nd795excv68dnp9",
    features: [
      "Daily personalized health tips",
      "Nigerian-focused wellness advice", 
      "Blood pressure & diabetes management",
      "Nutrition recommendations",
      "Exercise and fitness guidance",
      "Priority customer support",
      "Exclusive wellness content"
    ]
  };

  const handleQuickSubscribe = async () => {
    if (!user) {
      return;
    }

    const selectedPlan = isYearly ? yearlyPlan : monthlyPlan;
    setIsProcessing(true);

    // Ensure Paystack script is loaded
    if (!window.PaystackPop) {
      try {
        await loadPaystackScript();
      } catch (error) {
        console.error('Failed to load Paystack script:', error);
        setIsProcessing(false);
        return;
      }
    }

    try {
      console.log('Popup initializing payment with:', {
        key: 'pk_live_e4512c48de3fef4f92b4b278715d5decfa436d5b',
        plan: selectedPlan.paystackPlan,
        email: user.email,
        amount: selectedPlan.price * 100,
        currency: 'NGN',
        ref: `health-tips-popup-${Date.now()}`,
        PaystackPop: !!window.PaystackPop
      });

      const handler = window.PaystackPop.setup({
        key: 'pk_live_e4512c48de3fef4f92b4b278715d5decfa436d5b',
        plan: selectedPlan.paystackPlan,
        email: user.email,
        amount: selectedPlan.price * 100,
        currency: 'NGN',
        ref: `health-tips-popup-${Date.now()}`,
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
              value: selectedPlan.billingCycle
            },
            {
              display_name: "Source",
              variable_name: "source",
              value: "popup"
            }
          ]
        },
        callback: function() {
          // Close popup and refresh page to update subscription status
          onClose();
          setTimeout(() => {
            window.location.reload();
          }, 500);
        },
        onClose: () => {
          setIsProcessing(false);
        }
      });

      handler.openIframe();
    } catch (error: any) {
      console.error('Payment initialization error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        selectedPlan: selectedPlan,
        user: user,
        PaystackPop: !!window.PaystackPop
      });
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <div className="absolute right-4 top-4">
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <DialogHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-full p-3">
              <Crown className="h-8 w-8 text-white" />
            </div>
          </div>
          <DialogTitle className="text-2xl">
            Get Daily Health Tips!
          </DialogTitle>
          <DialogDescription className="text-base">
            Unlock personalized health guidance with our premium subscription
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
            <div className="text-center mb-4">
              <Badge className="bg-green-500 text-white px-3 py-1 text-sm">
                Special Offer
              </Badge>
              
              {/* Plan Toggle */}
              <div className="flex items-center justify-center gap-4 p-3 bg-white rounded-lg my-4">
                <Label htmlFor="plan-toggle" className={`text-sm font-medium ${!isYearly ? 'text-green-600' : 'text-gray-500'}`}>
                  Monthly
                </Label>
                <Switch
                  id="plan-toggle"
                  checked={isYearly}
                  onCheckedChange={setIsYearly}
                />
                <Label htmlFor="plan-toggle" className={`text-sm font-medium ${isYearly ? 'text-green-600' : 'text-gray-500'}`}>
                  Yearly
                  <Badge variant="secondary" className="ml-1 text-xs">Save ₦900</Badge>
                </Label>
              </div>
              
              <div className="text-3xl font-bold text-gray-900 mt-2">
                {isYearly ? yearlyPlan.priceText : monthlyPlan.priceText}
              </div>
              <p className="text-sm text-gray-600">Start your health journey today</p>
            </div>
            
            <div className="space-y-3">
              {(isYearly ? yearlyPlan : monthlyPlan).features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-2">
              <div className="bg-red-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
                <Heart className="h-6 w-6 text-red-500" />
              </div>
              <p className="text-xs text-gray-600">Heart Health</p>
            </div>
            <div className="space-y-2">
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
                <Shield className="h-6 w-6 text-blue-500" />
              </div>
              <p className="text-xs text-gray-600">Prevention</p>
            </div>
            <div className="space-y-2">
              <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
              <p className="text-xs text-gray-600">Wellness</p>
            </div>
          </div>

          <div className="space-y-3">
            <Button 
              className="w-full" 
              size="lg"
              onClick={handleQuickSubscribe}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <Crown className="h-4 w-4 mr-2" />
                  Subscribe Now - ₦450/month
                </>
              )}
            </Button>
            
            <Link href="/health-tips-subscription">
              <Button variant="outline" className="w-full" onClick={onClose}>
                View All Plans
              </Button>
            </Link>
          </div>

          <p className="text-xs text-gray-500 text-center">
            Secure payment • Cancel anytime • Nigerian health focus
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}