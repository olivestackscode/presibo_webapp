import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

interface ElderCarePlan {
  name: string;
  price: number;
  displayPrice: string;
  description: string;
  features: string[];
  popular?: boolean;
  color: string;
}

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

export default function ElderCare() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Load Paystack script
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    document.head.appendChild(script);

    return () => {
      // Cleanup script when component unmounts
      const existingScript = document.querySelector('script[src="https://js.paystack.co/v1/inline.js"]');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);

  const elderCarePlans: ElderCarePlan[] = [
    {
      name: 'Care',
      price: 15000,
      displayPrice: '₦15,000',
      description: 'Essential elder care monitoring and support',
      features: [
        'Digital medical records',
        'Medication reminders',
        '1 family profile',
        'Basic health monitoring',
        'Emergency contact system'
      ],
      color: 'from-blue-700 to-blue-900'
    },
    {
      name: 'Thrive',
      price: 30000,
      displayPrice: '₦30,000',
      description: 'Comprehensive elder care with priority support',
      features: [
        'All Care benefits',
        'Priority doctor booking',
        'Home monitoring kits',
        'Dedicated case manager',
        '2 family profiles',
        '1 weekly video consultation',
        '24/7 support hotline'
      ],
      popular: true,
      color: 'from-green-700 to-green-900'
    },
    {
      name: 'Vital',
      price: 50000,
      displayPrice: '₦50,000',
      description: 'Premium elder care with home visit services',
      features: [
        'All Thrive benefits',
        '3 family profiles',
        'Home visit option',
        'Advanced health monitoring',
        'Specialist consultations',
        'Personal care coordinator',
        'Monthly health reports'
      ],
      color: 'from-gray-800 to-black'
    }
  ];

  const handlePayment = (plan: ElderCarePlan) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to subscribe to elder care services",
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

    const paystack = window.PaystackPop.setup({
      key: 'pk_live_e4512c48de3fef4f92b4b278715d5decfa436d5b',
      email: user.email,
      amount: plan.price * 100, // Convert to kobo
      onSuccess: async (transaction: any) => {
        // Create subscription record
        try {
          const startDate = new Date();
          const endDate = new Date();
          endDate.setMonth(startDate.getMonth() + 1); // Elder care plans are monthly
          
          const subscriptionData = {
            subscriptionType: 'elder_care',
            amount: plan.price,
            paymentReference: transaction.reference,
            paymentStatus: 'completed',
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            autoRenew: false,
            isActive: true,
            planName: `Elder Care - ${plan.name}`,
            description: `Elder Care ${plan.name} Plan - ${plan.description}`
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
            description: `Successfully subscribed to ${plan.name} plan. Reference: ${transaction.reference}`,
          });
        } catch (error) {
          console.error('Error creating subscription:', error);
          toast({
            title: "Payment Successful!",
            description: `Payment processed but there was an issue activating your subscription. Please contact support. Reference: ${transaction.reference}`,
            variant: "destructive",
          });
        }
        console.log('Payment successful:', transaction);
      },
      onCancel: () => {
        console.log('Payment cancelled');
        toast({
          title: "Payment Cancelled",
          description: "Your payment was cancelled. You can try again anytime.",
          variant: "destructive",
        });
      },
      onError: (error: any) => {
        console.error('Payment error:', error);
        toast({
          title: "Payment Failed",
          description: "Payment failed. Please try again.",
          variant: "destructive",
        });
      },
    });

    paystack.openIframe();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      {/* Header */}
      <div className="mb-8">
        <Button 
          onClick={() => setLocation('/')}
          variant="outline"
          className="mb-4"
        >
          <i className="fas fa-arrow-left mr-2"></i>
          Back to Dashboard
        </Button>
        
        <div className="text-center">
          <div className="mb-6">
            <i className="fas fa-heart text-6xl text-warm-orange mb-4"></i>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Elder Care Services</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Comprehensive care and monitoring for your elderly loved ones. 
            Choose the plan that best fits your family's needs.
          </p>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
        {elderCarePlans.map((plan, index) => (
          <Card 
            key={index} 
            className={`relative overflow-hidden border-2 transition-all duration-300 hover:shadow-2xl ${
              plan.popular ? 'border-naija-green scale-105' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {plan.popular && (
              <div className="absolute top-0 right-0 bg-naija-green text-white px-4 py-1 text-sm font-semibold">
                Most Popular
              </div>
            )}
            
            <CardHeader className={`text-white bg-gradient-to-r ${plan.color} pb-8`}>
              <div className="text-center">
                <CardTitle className="text-2xl font-bold mb-2">{plan.name}</CardTitle>
                <div className="text-4xl font-bold mb-2">{plan.displayPrice}</div>
                <p className="text-sm">/month</p>
                <p className="text-sm opacity-90 mt-2">{plan.description}</p>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center">
                      <i className="fas fa-check-circle text-naija-green mr-3"></i>
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button 
                  className={`w-full py-3 text-lg font-semibold bg-gradient-to-r ${plan.color} hover:opacity-90 text-white border-0`}
                  onClick={() => handlePayment(plan)}
                >
                  <i className="fas fa-credit-card mr-2"></i>
                  Subscribe to {plan.name}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional Information */}
      <div className="max-w-4xl mx-auto mt-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-2xl text-gray-800">
              Why Choose Our Elder Care Services?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start">
                  <i className="fas fa-shield-alt text-trust-blue text-2xl mr-4 mt-1"></i>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Trusted Care</h3>
                    <p className="text-gray-600">Professional healthcare providers with years of experience in elder care</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <i className="fas fa-clock text-warm-orange text-2xl mr-4 mt-1"></i>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">24/7 Monitoring</h3>
                    <p className="text-gray-600">Round-the-clock health monitoring and emergency response</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <i className="fas fa-users text-royal-purple text-2xl mr-4 mt-1"></i>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Family Involvement</h3>
                    <p className="text-gray-600">Keep family members informed and involved in care decisions</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <i className="fas fa-home text-naija-green text-2xl mr-4 mt-1"></i>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Home-Based Care</h3>
                    <p className="text-gray-600">Comfort of home with professional medical support</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contact Section */}
      <div className="max-w-2xl mx-auto mt-8 text-center">
        <Card className="bg-gradient-to-r from-warm-orange/10 to-golden-yellow/10">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Need Help Choosing a Plan?
            </h3>
            <p className="text-gray-600 mb-4">
              Our care coordinators are available to help you select the best plan for your family's needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                className="bg-warm-orange hover:bg-warm-orange/90 text-white"
                onClick={() => window.open('tel:+2347032810862', '_self')}
              >
                <i className="fas fa-phone mr-2"></i>
                Call Us Now
              </Button>
              <Button 
                className="bg-naija-green hover:bg-naija-green/90 text-white"
                onClick={() => window.open('https://wa.me/2347032810862?text=Hello, I need help choosing an elder care plan', '_blank')}
              >
                <i className="fab fa-whatsapp mr-2"></i>
                WhatsApp Us
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}