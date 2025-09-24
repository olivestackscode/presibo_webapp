import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

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

import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Bot, User, Send, Heart, Users, MapPin, Star, Phone, Loader2, History, Crown, CreditCard, LogIn } from "lucide-react";
import { useLocation, Link } from "wouter";
import AiRecommendations from "@/components/ai-recommendations";

interface ChatMessage {
  id: string;
  type: 'user' | 'ai' | 'error';
  content: string;
  timestamp: Date;
  isSubscriptionError?: boolean;
}

interface DoctorRecommendation {
  id: number;
  firstname: string;
  lastname: string;
  specialization: string;
  location: string;
  phone: string;
  email: string;
  years: number;
  cases: string;
  distance?: string;
  reason: string;
}

interface AIResponse {
  response: string;
  doctorRecommendations?: DoctorRecommendation[];
  severity: 'low' | 'medium' | 'high';
  shouldSeekImmediate: boolean;
  remaining?: number;
}

interface GuestChatAccess {
  allowed: boolean;
  remaining: number;
  isGuest: true;
}

interface AuthenticatedChatAccess {
  allowed: boolean;
  remaining: number;
  subscription?: any;
  freeUsed: number;
  isGuest: false;
}

type ChatAccess = GuestChatAccess | AuthenticatedChatAccess;

export default function AI() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const formatName = (name: string | undefined | null): string => {
    if (!name) return '';
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const welcomeName = isAuthenticated ? formatName(user?.FirstName) : 'there';

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      content: `Hello ${welcomeName}! I'm your AI Health Assistant specialized in helping with common health concerns in Nigeria, particularly high blood pressure, diabetes, and other common ailments. ${!isAuthenticated ? 'As a guest, you have 3 free consultations. ' : ''}How can I help you today?`,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Get chat access data - works for both guests and authenticated users
  const { data: chatAccess, refetch: refetchAccess } = useQuery({
    queryKey: ['/api/ai/access'],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest('POST', '/api/ai/chat', { 
        message
      });
      
      if (response.status === 403) {
        const errorData = await response.json();
        if (errorData.needsSubscription || errorData.needsLogin) {
          if (!isAuthenticated) {
            throw new Error('LOGIN_REQUIRED:' + (errorData.error || 'Please log in to continue using AI consultations.'));
          } else {
            setShowSubscriptionModal(true);
            throw new Error('SUBSCRIPTION_REQUIRED:' + (errorData.error || 'You need an active AI chat subscription.'));
          }
        }
      }
      
      return await response.json() as AIResponse;
    },
    onSuccess: (data) => {
      setIsTyping(false);
      const aiMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'ai',
        content: data.response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);

      // Refresh access data to show updated usage
      refetchAccess();

      // Show doctor recommendations if provided
      if (data.doctorRecommendations && data.doctorRecommendations.length > 0) {
        setTimeout(() => {
          const recommendationMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            type: 'ai',
            content: `Based on your symptoms, I recommend consulting with one of these healthcare professionals:`,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, recommendationMessage]);
        }, 1000);
      }

      if (data.shouldSeekImmediate) {
        toast({
          title: "Immediate Medical Attention Needed",
          description: "Please consider seeing a healthcare provider as soon as possible.",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      setIsTyping(false);
      
      // Check if it's a login required error for guests
      if (error.message && error.message.startsWith('LOGIN_REQUIRED:')) {
        const message = error.message.replace('LOGIN_REQUIRED:', '').trim();
        const errorMessage: ChatMessage = {
          id: Date.now().toString(),
          type: 'error',
          content: message || 'You have used all 3 free guest consultations. Please log in to continue.',
          timestamp: new Date(),
          isSubscriptionError: false
        };
        setMessages(prev => [...prev, errorMessage]);
        return;
      }
      
      // Check if it's a subscription error for authenticated users
      if (error.message && error.message.startsWith('SUBSCRIPTION_REQUIRED:')) {
        const message = error.message.replace('SUBSCRIPTION_REQUIRED:', '').trim();
        const errorMessage: ChatMessage = {
          id: Date.now().toString(),
          type: 'error',
          content: message || 'You have reached your free usage limit for AI health consultations.',
          timestamp: new Date(),
          isSubscriptionError: true
        };
        setMessages(prev => [...prev, errorMessage]);
        return;
      }
      
      // Default error handling
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'error',
        content: isAuthenticated 
          ? `Your free AI Doc Consultation limit has been reached. Subscribe for ₦1,000/week to continue getting medical guidance.`
          : `You've used all 3 free guest consultations. Please log in or create an account to continue.`,
        timestamp: new Date(),
        isSubscriptionError: isAuthenticated
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  });

  const sendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    chatMutation.mutate(inputMessage);
    setInputMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const quickQuestions = [
    "I have high blood pressure symptoms",
    "Blood sugar levels concern",
    "Frequent headaches and fatigue",
    "Chest pain or discomfort",
    "Diabetes management questions"
  ];

  const renderDoctorRecommendations = () => {
    const lastAIMessage = messages.filter(m => m.type === 'ai').pop();
    const hasRecommendations = chatMutation.data?.doctorRecommendations && chatMutation.data.doctorRecommendations.length > 0;
    
    if (!hasRecommendations) return null;

    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-naija-green" />
            Recommended Healthcare Providers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {chatMutation.data?.doctorRecommendations?.map((doctor) => (
              <Card key={doctor.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">
                      Dr. {doctor.firstname} {doctor.lastname}
                    </h4>
                    <Badge variant="secondary" className="mb-2">
                      {doctor.specialization}
                    </Badge>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {doctor.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4" />
                        {doctor.years} years experience
                      </div>
                      {doctor.distance && (
                        <div className="text-naija-green font-medium">
                          {doctor.distance}
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 mb-3">
                      <strong>Why recommended:</strong> {doctor.reason}
                    </p>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => window.open(`tel:${doctor.phone}`)}
                        className="bg-naija-green hover:bg-naija-green/90"
                      >
                        <Phone className="w-4 h-4 mr-1" />
                        Call Now
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setLocation('/doctors')}
                      >
                        View All Doctors
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const handleRecommendedQuestion = (question: string) => {
    setInputMessage(question);
    setTimeout(() => {
      sendMessage();
    }, 100);
  };

  return (
    <div className="p-4 space-y-4 max-w-7xl mx-auto">
      {/* Chat History Button - Top Left (only for authenticated users) */}
      {isAuthenticated && (
        <div className="flex justify-start mb-2">
          <Link href="/chat-history">
            <Button variant="outline" size="sm">
              <History className="w-4 h-4 mr-1" />
              Chat History
            </Button>
          </Link>
        </div>
      )}

      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-6 h-6 text-naija-green" />
              <CardTitle>AI Health Assistant</CardTitle>
            </div>
            <div className="flex items-center gap-3">
              {/* Login Button for Guests */}
              {!isAuthenticated && (
                <Link href="/auth">
                  <Button variant="outline" size="sm">
                    <LogIn className="w-4 h-4 mr-1" />
                    Login
                  </Button>
                </Link>
              )}
              
              {/* Usage Status Display */}
              {chatAccess && (
                <div className="text-right">
                  {isAuthenticated && (chatAccess as any)?.subscription?.isActive ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-sm">
                      <div className="flex items-center gap-1 text-green-800 font-medium">
                        <Crown className="w-3 h-3" />
                        Active Subscription
                      </div>
                      <div className="text-xs text-green-600">
                        {(chatAccess as any)?.remaining} consultations remaining
                      </div>
                    </div>
                  ) : (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-sm">
                      <div className="text-blue-800 font-medium">
                        {isAuthenticated ? 'Free Consultations' : 'Guest Consultations'}
                      </div>
                      <div className="text-xs text-blue-600">
                        {(chatAccess as any)?.remaining} of 3 remaining
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <p className="text-gray-600">
            Get instant health guidance for common Nigerian health concerns. 
            Chat about symptoms and get personalized doctor recommendations.
            {!isAuthenticated && " As a guest, you have 3 free consultations."}
          </p>
        </CardHeader>
      </Card>

      {/* Quick Questions */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3">Quick Questions:</h3>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((question, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => {
                  setInputMessage(question);
                  setTimeout(sendMessage, 100);
                }}
                className="text-xs"
              >
                {question}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Area - Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chat Area - Takes 2/3 of the width on large screens */}
        <div className="lg:col-span-2">
          <Card className="min-h-[500px] flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg">Health Chat</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
          <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`flex gap-2 max-w-[80%] ${
                      message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        message.type === 'user'
                          ? 'bg-trust-blue text-white'
                          : message.type === 'error'
                          ? 'bg-red-500 text-white'
                          : 'bg-naija-green text-white'
                      }`}
                    >
                      {message.type === 'user' ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <Bot className="w-4 h-4" />
                      )}
                    </div>
                    <div
                      className={`rounded-lg p-3 ${
                        message.type === 'user'
                          ? 'bg-trust-blue text-white'
                          : message.type === 'error'
                          ? 'bg-red-50 border border-red-200 text-red-800'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <span className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</span>
                      
                      {message.isSubscriptionError && isAuthenticated && (
                        <div className="mt-3 pt-3 border-t border-red-200">
                          <Button
                            onClick={() => setShowSubscriptionModal(true)}
                            className="bg-naija-green hover:bg-naija-green/90 text-white text-sm px-4 py-2 h-auto w-full transition-all duration-200 ease-in-out hover:shadow-md"
                          >
                            Subscribe
                          </Button>
                          <span className="text-xs text-red-600 mt-2 block">
                            You've used all 3 free consultations. Subscribe for unlimited access.
                          </span>
                        </div>
                      )}

                      {message.type === 'error' && !isAuthenticated && (
                        <div className="mt-3 pt-3 border-t border-red-200">
                          <Link href="/auth">
                            <Button
                              className="bg-naija-green hover:bg-naija-green/90 text-white text-sm px-4 py-2 h-auto w-full transition-all duration-200 ease-in-out hover:shadow-md"
                            >
                              <LogIn className="w-4 h-4 mr-1" />
                              Login to Continue
                            </Button>
                          </Link>
                          <span className="text-xs text-red-600 mt-2 block">
                            Create an account for 3 more free consultations.
                          </span>
                        </div>
                      )}
                      
                      <span className="text-xs opacity-70 mt-1 block">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-full bg-naija-green text-white flex items-center justify-center">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-gray-100 rounded-lg p-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <Separator className="my-4" />

          {/* Input Area */}
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your health question here..."
              disabled={chatMutation.isPending}
              className="flex-1"
            />
            <Button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || chatMutation.isPending}
              className="bg-naija-green hover:bg-naija-green/90"
            >
              {chatMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Recommendations Sidebar - Takes 1/3 of the width on large screens */}
        <div className="lg:col-span-1">
          <AiRecommendations onSelectQuestion={handleRecommendedQuestion} />
        </div>
      </div>

      {/* Doctor Recommendations */}
      {renderDoctorRecommendations()}

      {/* Disclaimer */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-2">
            <Heart className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-yellow-800 mb-1">Medical Disclaimer</p>
              <p className="text-yellow-700">
                This AI assistant provides general health information only and is not a substitute for professional medical advice. 
                Always consult with qualified healthcare providers for proper diagnosis and treatment.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Modal - Only for authenticated users */}
      {isAuthenticated && (
        <SubscriptionModal 
          isOpen={showSubscriptionModal}
          onClose={() => setShowSubscriptionModal(false)}
          onSuccess={() => {
            setShowSubscriptionModal(false);
            refetchAccess();
            toast({
              title: "Subscription Activated",
              description: "You now have access to 10 AI consultations this week!",
            });
          }}
        />
      )}
    </div>
  );
}

// Subscription Modal Component - Only shown to authenticated users
function SubscriptionModal({ isOpen, onClose, onSuccess }: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

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

  const handlePaystackSuccess = async (reference: any) => {
    try {
      setIsLoading(true);
      
      // Create subscription with payment reference
      const response = await apiRequest('POST', '/api/ai-chat/subscribe', {
        paymentReference: reference.reference
      });

      if (response.ok) {
        const subscriptionData = await response.json();
        
        // Update subscription status to active since payment was successful
        await apiRequest('PATCH', `/api/ai-chat/subscription/${subscriptionData.id}/status`, {
          status: 'completed'
        });

        onSuccess();
      } else {
        throw new Error('Failed to process subscription');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast({
        title: "Subscription Error",
        description: "Failed to activate subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaystackError = (error: any) => {
    console.error('Paystack error:', error);
    toast({
      title: "Payment Error",
      description: "Payment failed. Please try again.",
      variant: "destructive",
    });
  };

  const initializePaystack = () => {
    if (!window.PaystackPop) {
      toast({
        title: "Payment System Unavailable",
        description: "Please refresh the page and try again.",
        variant: "destructive",
      });
      return;
    }

    const handler = window.PaystackPop.setup({
      key: 'pk_test_074b20c93e42e80cbea47502caa0b0ff0c5e8f1d', // Paystack public key
      email: user?.Email || '',
      amount: 100000, // ₦1,000 in kobo
      onSuccess: handlePaystackSuccess,
      onCancel: () => {
        console.log('Payment cancelled');
      },
      onError: handlePaystackError,
    });

    handler.openIframe();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-naija-green" />
            Subscribe to AI Health Chat
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-naija-green/10 border border-naija-green/20 rounded-lg p-4">
            <h3 className="font-semibold text-naija-green mb-2">Weekly AI Chat Subscription</h3>
            <p className="text-sm text-gray-600 mb-3">
              Get unlimited AI health consultations for one week
            </p>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-naija-green">₦1,000</span>
              <span className="text-sm text-gray-500">/week</span>
            </div>
          </div>
          
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-naija-green rounded-full"></div>
              Unlimited AI health consultations
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-naija-green rounded-full"></div>
              Personalized doctor recommendations
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-naija-green rounded-full"></div>
              Priority health guidance
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-naija-green rounded-full"></div>
              Chat history access
            </li>
          </ul>

          <Button 
            onClick={initializePaystack}
            disabled={isLoading}
            className="w-full bg-naija-green hover:bg-naija-green/90"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Subscribe for ₦1,000/week
              </div>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}