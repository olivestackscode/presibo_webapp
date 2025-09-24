import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import TrainerStories from "@/components/trainer-stories";
import TrainingHighlights from "@/components/training-highlights";

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

interface FitnessTrainer {
  id: number;
  firstname: string;
  lastname: string;
  phone: string;
  email: string;
  specialization: string;
  cases: string;
  location: string;
  country: string;
  km: number;
  years: number;
  thumbnail: string;
  distance: string;
}

export default function TrainerProfile() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [trainerId, setTrainerId] = useState<string | null>(null);
  const [showStories, setShowStories] = useState(false);

  useEffect(() => {
    // Get trainer ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    setTrainerId(id);

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

  const handlePayment = (amount: number, planName: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Redirecting to login page...",
        variant: "destructive",
      });
      setTimeout(() => {
        setLocation('/auth');
      }, 1000);
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
      amount: amount * 100, // Convert to kobo
      onSuccess: async (transaction: any) => {
        // Create subscription record
        try {
          const startDate = new Date();
          const endDate = new Date();
          endDate.setMonth(startDate.getMonth() + 1); // Trainer services are monthly
          
          const subscriptionData = {
            subscriptionType: 'trainer',
            amount: amount,
            paymentReference: transaction.reference,
            paymentStatus: 'completed',
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            autoRenew: false,
            isActive: true,
            planName: `Trainer Service - ${planName}`,
            description: `Fitness trainer service - ${planName}`
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
            description: `Successfully paid for ${planName}. Reference: ${transaction.reference}`,
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

  // Fetch trainer data
  const { data: trainersData, isLoading } = useQuery<{ users: FitnessTrainer[] }>({
    queryKey: ['/api/fitness-trainers'],
    queryFn: async () => {
      const response = await fetch('https://presibo-wl.vercel.app/trainers.json');
      return response.json();
    },
  });

  const trainer = trainersData?.users?.find(t => t.id.toString() === trainerId);

  if (isLoading) {
    return (
      <div className="p-4 space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="bg-white rounded-2xl p-6 h-32"></div>
          <div className="bg-white rounded-2xl p-6 h-48"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-4 h-32"></div>
            <div className="bg-white rounded-2xl p-4 h-32"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!trainer) {
    return (
      <div className="p-4 space-y-6">
        <Button 
          onClick={() => setLocation('/fitness')}
          variant="outline"
          className="mb-4"
        >
          <i className="fas fa-arrow-left mr-2"></i>
          Back to Fitness
        </Button>
        <div className="text-center py-8 text-gray-500">
          <i className="fas fa-user-times text-4xl mb-4 opacity-50"></i>
          <h2 className="text-xl font-semibold mb-2">Trainer Not Found</h2>
          <p>The requested trainer profile could not be found.</p>
        </div>
      </div>
    );
  }

  const specialties = [
    'Weight Loss Training',
    'Muscle Building',
    'Cardio Fitness',
    'Strength Training',
    'Personal Training',
    'Nutrition Guidance'
  ];

  const services = [
    { name: 'Personal Training Session', price: '₦5,000', duration: '1 hour' },
    { name: 'Group Training Session', price: '₦3,000', duration: '1 hour' },
    { name: 'Fitness Assessment', price: '₦2,000', duration: '30 mins' },
    { name: 'Nutrition Consultation', price: '₦3,500', duration: '45 mins' },
    { name: 'Weekly Training Plan', price: '₦15,000', duration: '7 days' },
    { name: 'Monthly Training Program', price: '₦25,000', duration: '30 days' }
  ];

  const schedule = [
    { day: 'Monday', time: '6:00 AM - 8:00 PM', available: true },
    { day: 'Tuesday', time: '6:00 AM - 8:00 PM', available: true },
    { day: 'Wednesday', time: '6:00 AM - 8:00 PM', available: true },
    { day: 'Thursday', time: '6:00 AM - 8:00 PM', available: true },
    { day: 'Friday', time: '6:00 AM - 8:00 PM', available: true },
    { day: 'Saturday', time: '8:00 AM - 6:00 PM', available: true },
    { day: 'Sunday', time: 'Rest Day', available: false }
  ];

  return (
    <div className="p-4 space-y-6">
      {/* Back Button */}
      <Button 
        onClick={() => setLocation('/fitness')}
        variant="outline"
        className="mb-4"
      >
        <i className="fas fa-arrow-left mr-2"></i>
        Back to Fitness
      </Button>

      {/* Login Prompt for Unauthenticated Users */}
      {!user && (
        <Card className="bg-gradient-to-r from-royal-purple/10 to-trust-blue/10 border-royal-purple/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-royal-purple rounded-full flex items-center justify-center">
                  <i className="fas fa-user-plus text-white"></i>
                </div>
                <div>
                  <h3 className="font-semibold text-royal-purple">Ready to Start Training?</h3>
                  <p className="text-sm text-gray-600">Log in to book sessions and access exclusive features</p>
                </div>
              </div>
              <Button 
                onClick={() => setLocation('/auth')}
                className="bg-royal-purple hover:bg-royal-purple/90 text-white"
              >
                Log In
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trainer Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start space-x-6">
            {/* Profile Picture with Stories Ring */}
            <div className="relative">
              <button
                onClick={() => setShowStories(true)}
                className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-health-pink via-warm-orange to-golden-yellow p-0.5 hover:scale-105 transition-transform"
              >
                <div className="w-full h-full rounded-full bg-white p-0.5">
                  <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    <img 
                      src={`https://presibo-wl.vercel.app/photos/${trainer.thumbnail}.jpg`}
                      alt={`${trainer.firstname} ${trainer.lastname}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/api/placeholder/96/96';
                      }}
                    />
                  </div>
                </div>
              </button>
              {/* Stories indicator */}
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-naija-green rounded-full flex items-center justify-center border-2 border-white">
                <i className="fas fa-camera text-white text-xs"></i>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-2xl font-bold text-gray-800">
                  {trainer.firstname} {trainer.lastname}
                </h1>
                <Badge className="bg-naija-green text-white">
                  Verified Trainer
                </Badge>
              </div>
              
              <p className="text-sm text-gray-500 mb-3">
                <i className="fas fa-camera mr-1"></i>
                Tap profile picture to view training highlights
              </p>
              
              <div className="space-y-2 text-gray-600">
                <div className="flex items-center">
                  <i className="fas fa-dumbbell text-royal-purple mr-3 w-5"></i>
                  <span className="font-medium">{trainer.specialization}</span>
                </div>
                <div className="flex items-center">
                  <i className="fas fa-map-marker-alt text-warm-orange mr-3 w-5"></i>
                  <span>{trainer.location}, {trainer.country}</span>
                </div>
                <div className="flex items-center">
                  <i className="fas fa-clock text-trust-blue mr-3 w-5"></i>
                  <span>{trainer.years} years of experience</span>
                </div>
                <div className="flex items-center">
                  <i className="fas fa-users text-golden-yellow mr-3 w-5"></i>
                  <span>{trainer.cases} clients successfully trained</span>
                </div>
              </div>


            </div>
          </div>
        </CardContent>
      </Card>

      {/* About Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <i className="fas fa-info-circle text-trust-blue mr-2"></i>
            About {trainer.firstname}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 leading-relaxed">
            Professional fitness trainer with {trainer.years} years of experience helping clients achieve their fitness goals. 
            Specializing in {trainer.specialization.toLowerCase()}, I have successfully guided {trainer.cases} clients through 
            their fitness journey. Located in {trainer.location}, I provide personalized training programs tailored to 
            individual needs and fitness levels.
          </p>
        </CardContent>
      </Card>

      {/* Specialties */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <i className="fas fa-star text-golden-yellow mr-2"></i>
            Specialties & Expertise
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {specialties.map((specialty, index) => (
              <div key={index} className="flex items-center space-x-2">
                <i className="fas fa-check-circle text-naija-green"></i>
                <span className="text-sm">{specialty}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Services & Pricing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <i className="fas fa-tags text-warm-orange mr-2"></i>
            Services & Pricing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {services.map((service, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{service.name}</div>
                  <div className="text-sm text-gray-600">{service.duration}</div>
                </div>
                <div className="text-right flex items-center space-x-3">
                  <div className="font-bold text-naija-green">{service.price}</div>
                  <Button 
                    size="sm"
                    className="bg-naija-green hover:bg-naija-green/90 text-white"
                    onClick={() => {
                      // Extract price number from string (e.g., "₦15,000" -> 15000)
                      const price = parseInt(service.price.replace(/[₦,]/g, ''));
                      handlePayment(price, service.name);
                    }}
                  >
                    <i className="fas fa-credit-card mr-1"></i>
                    Pay
                  </Button>
                </div>
              </div>
            ))}
            
            {/* Monthly Online Sessions Payment Option */}
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-royal-purple/10 to-trust-blue/10 rounded-lg border-2 border-dashed border-royal-purple/30">
              <div>
                <div className="font-medium text-royal-purple">Monthly Online Training Sessions</div>
                <div className="text-sm text-gray-600">4 personalized online training sessions per month</div>
                <div className="text-xs text-gray-500 mt-1">✓ Live video sessions ✓ Custom workout plans ✓ Progress tracking</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-royal-purple mb-2">₦30,000/month</div>
                <Button 
                  size="sm"
                  className="bg-royal-purple hover:bg-royal-purple/90 text-white"
                  onClick={() => handlePayment(30000, 'Monthly Online Training Sessions')}
                >
                  <i className="fas fa-credit-card mr-1"></i>
                  Pay Now
                </Button>
              </div>
            </div>
            
            {/* Monthly Offline Sessions Payment Option */}
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-naija-green/10 to-warm-orange/10 rounded-lg border-2 border-dashed border-naija-green/30">
              <div>
                <div className="font-medium text-naija-green">Monthly offline Training Sessions</div>
                <div className="text-sm text-gray-600">8 in-person training sessions per month</div>
                <div className="text-xs text-gray-500 mt-1">✓ Face-to-face sessions ✓ Equipment access ✓ Personalized form correction</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-naija-green mb-2">₦50,000/month</div>
                <Button 
                  size="sm"
                  className="bg-naija-green hover:bg-naija-green/90 text-white"
                  onClick={() => handlePayment(50000, 'Monthly offline Training Sessions')}
                >
                  <i className="fas fa-credit-card mr-1"></i>
                  Pay Now
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <i className="fas fa-calendar text-royal-purple mr-2"></i>
            Training Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {schedule.map((day, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="font-medium">{day.day}</div>
                <div className={`text-sm ${day.available ? 'text-naija-green' : 'text-gray-500'}`}>
                  {day.time}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reviews */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <i className="fas fa-star text-golden-yellow mr-2"></i>
            Client Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-l-4 border-naija-green pl-4">
              <div className="flex items-center mb-2">
                <div className="flex text-golden-yellow">
                  {[...Array(5)].map((_, i) => (
                    <i key={i} className="fas fa-star"></i>
                  ))}
                </div>
                <span className="ml-2 text-sm text-gray-600">5.0 stars</span>
              </div>
              <p className="text-gray-600 text-sm">
                "Excellent trainer! {trainer.firstname} helped me lose 15kg in 6 months. 
                Very professional and motivating."
              </p>
              <p className="text-xs text-gray-500 mt-1">- Sarah M.</p>
            </div>
            
            <div className="border-l-4 border-naija-green pl-4">
              <div className="flex items-center mb-2">
                <div className="flex text-golden-yellow">
                  {[...Array(5)].map((_, i) => (
                    <i key={i} className="fas fa-star"></i>
                  ))}
                </div>
                <span className="ml-2 text-sm text-gray-600">5.0 stars</span>
              </div>
              <p className="text-gray-600 text-sm">
                "Great experience! The training programs are well structured and results-oriented. 
                Highly recommend!"
              </p>
              <p className="text-xs text-gray-500 mt-1">- John D.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact CTA - Updated to Share Profile */}
      <Card className="bg-gradient-to-r from-naija-green to-trust-blue text-white">
        <CardContent className="p-6 text-center">
          <h3 className="text-xl font-bold mb-2">Share This Amazing Trainer!</h3>
          <p className="mb-4 opacity-90">
            Found the perfect trainer? Share {trainer.firstname}'s profile with friends and family
          </p>
          <Button 
            className="bg-white text-naija-green hover:bg-gray-100"
            onClick={() => {
              const profileUrl = `https://presibo.com/trainer/profile?id=${trainerId}`;
              const shareText = `Check out this amazing fitness trainer: ${trainer.firstname} ${trainer.lastname}\n\n🏋️ Specialization: ${trainer.specialization}\n📍 Location: ${trainer.location}\n⭐ ${trainer.years} years experience\n\nView profile: ${profileUrl}`;
              window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
            }}
          >
            <i className="fab fa-whatsapp mr-2"></i>
            Share Trainer Profile
          </Button>
        </CardContent>
      </Card>

      {/* Training Highlights Reels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <i className="fas fa-video text-warm-orange mr-2"></i>
            Training Highlights
            <button
              onClick={() => setShowStories(true)}
              className="ml-auto text-sm text-naija-green hover:text-naija-green/80 flex items-center"
            >
              <i className="fas fa-play-circle mr-1"></i>
              View All
            </button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TrainingHighlights trainerId={trainerId} />
        </CardContent>
      </Card>

      {/* Training Highlights Stories */}
      {trainerId && (
        <TrainerStories 
          trainerId={trainerId}
          isOpen={showStories}
          onClose={() => setShowStories(false)}
        />
      )}
    </div>
  );
}