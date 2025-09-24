import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Crown, X, Zap, Star } from "lucide-react";
import { useLocation } from "wouter";

interface SubscriptionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  feature: string; // 'food_analysis' | 'ai_doc'
}

export default function SubscriptionPopup({ isOpen, onClose, message, feature }: SubscriptionPopupProps) {
  const [, setLocation] = useLocation();

  const handleSubscribe = () => {
    onClose();
    setLocation('/subscribe');
  };

  const getFeatureTitle = () => {
    switch (feature) {
      case 'food_analysis':
        return 'Food Analysis';
      case 'ai_doc':
        return 'AI Health Consultation';
      default:
        return 'AI Features';
    }
  };

  const getFeatureDescription = () => {
    switch (feature) {
      case 'food_analysis':
        return 'Get unlimited AI-powered food analysis with detailed nutritional breakdowns, health scoring, and personalized recommendations.';
      case 'ai_doc':
        return 'Access unlimited AI health consultations with Nigerian health expertise, symptom analysis, and doctor recommendations.';
      default:
        return 'Unlock unlimited access to all premium AI features in Presibo.';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="w-6 h-6 text-yellow-600" />
            Upgrade to Premium
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute right-4 top-4 p-2"
          >
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-6">
          {/* Usage Limit Message */}
          <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="text-orange-800 font-medium mb-2">Free Usage Limit Reached</div>
            <p className="text-orange-700 text-sm">{message}</p>
          </div>

          {/* Premium Benefits */}
          <Card className="border-2 border-naija-green">
            <CardContent className="p-6">
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-naija-green mb-2">
                  Premium {getFeatureTitle()}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {getFeatureDescription()}
                </p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-naija-green" />
                  <span className="text-sm">Unlimited AI analyses per month</span>
                </div>
                <div className="flex items-center gap-3">
                  <Star className="w-5 h-5 text-naija-green" />
                  <span className="text-sm">Advanced health insights & recommendations</span>
                </div>
                <div className="flex items-center gap-3">
                  <Crown className="w-5 h-5 text-naija-green" />
                  <span className="text-sm">Priority access to new features</span>
                </div>
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-naija-green" />
                  <span className="text-sm">Nigerian health expertise & cultural context</span>
                </div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-naija-green mb-1">₦10,000</div>
                <div className="text-gray-600 text-sm mb-4">per month</div>
                
                <Button
                  onClick={handleSubscribe}
                  className="w-full bg-naija-green hover:bg-naija-green/90 text-white font-semibold py-3"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Subscribe Now
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Contact Support */}
          <div className="text-center text-sm text-gray-600">
            Need help? Contact us at{' '}
            <a href="tel:+2347032810862" className="text-naija-green font-medium">
              +234 703 281 0862
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}