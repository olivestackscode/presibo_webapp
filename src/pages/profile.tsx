import { useState, useRef, useEffect } from "react";

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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Camera, User, Mail, Phone, MapPin, Droplets, Calendar, Clock, LogOut, Plus, CreditCard, History, Edit3, Save, X, Settings } from "lucide-react";
import { useLocation } from "wouter";

export default function Profile() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    tel: '',
    sex: '',
    birth: '',
    city: '',
    country: '',
    age: '',
    bloodGroup: '',
    whatsappNumber: '',
    mobilePhone: '',
    address: ''
  });

  const formatName = (name: string | undefined | null): string => {
    if (!name) return '';
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Initialize form with current user data when editing
  useEffect(() => {
    if (isEditing && user) {
      setEditForm({
        firstName: user.FirstName || '',
        middleName: '',
        lastName: user.LastName || '',
        tel: user.tel || user.mobile || '',
        sex: user.sex || '',
        birth: '',
        city: '',
        country: '',
        age: user.age?.toString() || '',
        bloodGroup: user.blood_group || '',
        whatsappNumber: user.whatsappNumber || user.whatsapp_number || user.whatsapp || '',
        mobilePhone: user.tel || user.mobile || '',
        address: user.address || ''
      });
    }
  }, [isEditing, user]);

  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: typeof editForm) => {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error?.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(editForm);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({
      firstName: '',
      middleName: '',
      lastName: '',
      tel: '',
      sex: '',
      birth: '',
      city: '',
      country: '',
      age: '',
      bloodGroup: '',
      whatsappNumber: '',
      mobilePhone: '',
      address: ''
    });
  };

  const handleInputChange = (field: keyof typeof editForm, value: string) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };

  // Fetch wallet top-ups history
  const { data: topUps } = useQuery({
    queryKey: ['/api/wallet/top-ups/user'],
    enabled: !!user
  });

  // Wallet top-up mutation
  const topUpMutation = useMutation({
    mutationFn: async (amount: number) => {
      const response = await apiRequest('POST', '/api/wallet/top-up', {
        amount,
        description: `Wallet top-up of ₦${amount.toLocaleString()}`
      });
      return await response.json();
    },
    onSuccess: (data) => {
      // Ensure we have a valid email
      const userEmail = user?.email || '';
      if (!userEmail) {
        toast({
          title: "Email Required",
          description: "A valid email address is required for payment processing",
          variant: "destructive",
        });
        return;
      }

      // Ensure amount is properly parsed
      const amountInKobo = Math.round(parseFloat(topUpAmount) * 100);
      
      console.log('Initiating Paystack payment with:', {
        email: userEmail,
        amount: amountInKobo,
        ref: data.paymentReference,
        paystackAvailable: !!(window as any).PaystackPop
      });

      // Check if Paystack is loaded
      if (!(window as any).PaystackPop) {
        toast({
          title: "Payment System Loading",
          description: "Please wait for the payment system to load and try again",
          variant: "destructive",
        });
        return;
      }

      // Initialize Paystack payment
      const handler = (window as any).PaystackPop.setup({
        key: 'pk_live_e4512c48de3fef4f92b4b278715d5decfa436d5b', // Live public key
        email: userEmail,
        amount: amountInKobo, // Amount in kobo
        onSuccess: function(transaction: any) {
          console.log("Transaction Successful", transaction);
          // Payment successful
          toast({
            title: "Payment Successful!",
            description: `Your wallet has been topped up with ₦${parseFloat(topUpAmount).toLocaleString()}. Reference: ${transaction.reference}`,
          });
          
          // Update payment status to completed
          apiRequest('PATCH', `/api/wallet/top-up/${data.id}/status`, {
            status: 'completed'
          }).then(() => {
            // Refresh user data and top-ups history
            window.location.reload();
          });
          
          setTopUpAmount('');
          setIsTopUpModalOpen(false);
        },
        onCancel: function() {
          console.log("Payment Cancelled");
          toast({
            title: "Payment Cancelled",
            description: "Your payment was cancelled. You can try again anytime.",
            variant: "destructive",
          });
          
          // Update payment status to cancelled
          apiRequest('PATCH', `/api/wallet/top-up/${data.id}/status`, {
            status: 'cancelled'
          });
        },
        onError: function(error: any) {
          console.log("Error: ", error.message);
          toast({
            title: "Payment Failed",
            description: `An error occurred: ${error.message}`,
            variant: "destructive",
          });
          
          // Update payment status to failed
          apiRequest('PATCH', `/api/wallet/top-up/${data.id}/status`, {
            status: 'failed'
          });
        }
      });
      
      handler.openIframe();
    },
    onError: (error: any) => {
      toast({
        title: "Top-up Failed",
        description: error.message || "Failed to initiate wallet top-up",
        variant: "destructive",
      });
    }
  });

  const handleTopUp = () => {
    const amount = parseFloat(topUpAmount);
    if (amount < 100) {
      toast({
        title: "Invalid Amount",
        description: "Minimum top-up amount is ₦100",
        variant: "destructive",
      });
      return;
    }
    if (amount > 1000000) {
      toast({
        title: "Invalid Amount", 
        description: "Maximum top-up amount is ₦1,000,000",
        variant: "destructive",
      });
      return;
    }
    topUpMutation.mutate(amount);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-healing-mint via-soft-lavender to-gentle-peach p-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">Please log in to view your profile</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-healing-mint via-soft-lavender to-gentle-peach p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your personal information</p>
        </div>

        {/* Profile Photo & Basic Info */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage 
                    src={profileImage || (user.uploads ? `https://presibo-wl.vercel.app/photos/${user.uploads}` : '')} 
                    alt="Profile" 
                  />
                  <AvatarFallback className="bg-trust-blue text-white text-2xl">
                    {formatName(user.FirstName)?.charAt(0) || user.email.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                  onClick={triggerImageUpload}
                >
                  <Camera className="w-4 h-4" />
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
              <div className="text-center">
                <h2 className="text-xl font-semibold">
                  {user.FirstName && user.LastName 
                    ? `${formatName(user.FirstName)} ${formatName(user.LastName)}` 
                    : formatName(user.FirstName) || 'User'}
                </h2>
                <p className="text-gray-600">{user.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Personal Information</span>
              </div>
              {!isEditing ? (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit</span>
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleCancelEdit}
                    className="flex items-center space-x-2"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={handleSaveProfile}
                    disabled={updateProfileMutation.isPending}
                    className="flex items-center space-x-2 bg-trust-blue hover:bg-trust-blue/90"
                  >
                    <Save className="w-4 h-4" />
                    <span>{updateProfileMutation.isPending ? 'Saving...' : 'Save'}</span>
                  </Button>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">First Name</Label>
                  <div className="mt-1 p-2 bg-gray-50 rounded-md">
                    {formatName(user.FirstName) || 'Not provided'}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Last Name</Label>
                  <div className="mt-1 p-2 bg-gray-50 rounded-md">
                    {formatName(user.LastName) || 'Not provided'}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Age</Label>
                  <div className="mt-1 p-2 bg-gray-50 rounded-md">
                    {user.age || 'Not provided'}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Sex</Label>
                  <div className="mt-1 p-2 bg-gray-50 rounded-md">
                    {user.sex || 'Not provided'}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Blood Group</Label>
                  <div className="mt-1 p-2 bg-gray-50 rounded-md flex items-center space-x-2">
                    <Droplets className="w-4 h-4 text-red-500" />
                    <span>{user.blood_group || 'Not provided'}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Phone</Label>
                  <div className="mt-1 p-2 bg-gray-50 rounded-md">
                    {user.tel || user.mobile || 'Not provided'}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">WhatsApp</Label>
                  <div className="mt-1 p-2 bg-gray-50 rounded-md">
                    {user.whatsappNumber || user.whatsapp_number || user.whatsapp || 'Not provided'}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Address</Label>
                  <div className="mt-1 p-2 bg-gray-50 rounded-md">
                    {user.address || 'Not provided'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">First Name</Label>
                  <Input
                    value={editForm.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="mt-1"
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Last Name</Label>
                  <Input
                    value={editForm.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="mt-1"
                    placeholder="Enter last name"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Age</Label>
                  <Input
                    value={editForm.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                    className="mt-1"
                    placeholder="Enter age"
                    type="number"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Sex</Label>
                  <Select value={editForm.sex} onValueChange={(value) => handleInputChange('sex', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select sex" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Blood Group</Label>
                  <Select value={editForm.bloodGroup} onValueChange={(value) => handleInputChange('bloodGroup', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select blood group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem>
                      <SelectItem value="AB-">AB-</SelectItem>
                      <SelectItem value="O+">O+</SelectItem>
                      <SelectItem value="O-">O-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Phone Number</Label>
                  <Input
                    value={editForm.tel}
                    onChange={(e) => handleInputChange('tel', e.target.value)}
                    className="mt-1"
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">WhatsApp Number</Label>
                  <Input
                    value={editForm.whatsappNumber}
                    onChange={(e) => handleInputChange('whatsappNumber', e.target.value)}
                    className="mt-1"
                    placeholder="Enter WhatsApp number"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label className="text-sm font-medium text-gray-700">Address</Label>
                  <Input
                    value={editForm.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="mt-1"
                    placeholder="Enter address"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>



        {/* Appointment Information */}
        {user.appointment && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Current Appointment</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-trust-blue/10 p-4 rounded-lg">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Doctor:</span>
                    <span>{user.appointment.name || 'Not specified'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>Date:</span>
                    </span>
                    <span>{user.appointment.date}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>Time:</span>
                    </span>
                    <span>{user.appointment.time}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Subscription Information */}
        {user.subscriptions && user.subscriptions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Subscription History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {user.subscriptions.map((sub, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <span className="font-medium">{sub.month} {sub.year}</span>
                    <Badge variant="outline">₦{sub.amount}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Test Results */}
        {user.testResults && user.testResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {user.testResults.map((test, index) => (
                  <div key={index} className="p-3 border rounded-md">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{test.testName}</span>
                      <span className="text-sm text-gray-500">{test.date}</span>
                    </div>
                    <p className="text-sm text-gray-700">{test.result}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Wallet Balance */}
        {user.wallet !== undefined && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center space-x-2">
                  <CreditCard className="w-5 h-5" />
                  <span>Wallet Balance</span>
                </span>
                <Dialog open={isTopUpModalOpen} onOpenChange={setIsTopUpModalOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-naija-green hover:bg-naija-green/90 text-white">
                      <Plus className="w-4 h-4 mr-1" />
                      Add Money
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add Money to Wallet</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="amount">Amount (₦)</Label>
                        <Input
                          id="amount"
                          type="number"
                          placeholder="Enter amount (min ₦100)"
                          value={topUpAmount}
                          onChange={(e) => setTopUpAmount(e.target.value)}
                          min="100"
                          max="1000000"
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setTopUpAmount('1000')}
                        >
                          ₦1,000
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setTopUpAmount('5000')}
                        >
                          ₦5,000
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setTopUpAmount('10000')}
                        >
                          ₦10,000
                        </Button>
                      </div>
                      <Button
                        onClick={handleTopUp}
                        disabled={!topUpAmount || topUpMutation.isPending}
                        className="w-full bg-naija-green hover:bg-naija-green/90 text-white"
                      >
                        {topUpMutation.isPending ? 'Processing...' : 'Add Money'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-naija-green">
                  ₦{user.wallet?.toLocaleString() || '0'}
                </div>
                <p className="text-gray-600 mt-1">Available balance</p>
              </div>
              
              {/* Top-up History */}
              {topUps && topUps.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <History className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Recent Top-ups</span>
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {topUps.slice(0, 5).map((topUp: any) => (
                      <div key={topUp.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                        <div>
                          <div className="text-sm font-medium">₦{topUp.amount?.toLocaleString()}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(topUp.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <Badge 
                          variant={topUp.paymentStatus === 'completed' ? 'default' : 'secondary'}
                          className={topUp.paymentStatus === 'completed' ? 'bg-naija-green text-white' : ''}
                        >
                          {topUp.paymentStatus}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Share with Friends - Referral System */}
        <Card className="bg-gradient-to-r from-naija-green to-trust-blue text-white">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <i className="fas fa-users"></i>
              <span>Share with Friends</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-white/90 mb-4">
                Earn ₦1000 per new invite ({(user as any).totalReferrals || 0} friends invited) - ₦{(((user as any).totalReferrals || 0) * 1000).toLocaleString()} earned
              </p>
              <div className="bg-white/20 p-3 rounded-lg mb-4">
                <Label className="text-white/80 text-sm">Your Referral Code</Label>
                <div className="text-xl font-bold mt-1">
                  {(user as any).referralCode || `PRESIBO${user.id}`}
                </div>
              </div>
              <h4 className="text-lg font-semibold text-black mb-2">Earn ₦1,000 per invite</h4>
              <span className="text-yellow-400 font-medium text-sm mb-4 block">{(user as any).totalReferrals || 0} friends invited</span>
              <Button
                className="w-full bg-black text-white hover:bg-gray-900"
                onClick={() => {
                  const referralCode = (user as any).referralCode || `PRESIBO${user.id}`;
                  const shareText = `🏥 *PRESIBO - Smart Healthcare without Stress*\n\n✨ *Get access to smart healthcare anytime:*\n• AI-powered food analysis & health insights\n• Expert medical consultations with certified doctors\n• Fitness training programs & wellness tracking\n• 24/7 health monitoring & personalized recommendations\n• Elder care services for your loved ones\n\n💰 *Earn ₦1000 per invite!* Use my referral code *${referralCode}* and get ₦1000 bonus!\n\n📱 *Join Presibo:* https://presibo.com?ref=${referralCode}\n\n#SmartHealthcare #PresiboCare #HealthTech #Nigeria`;
                  
                  if (navigator.share) {
                    navigator.share({
                      title: 'Join Presibo - Smart Healthcare',
                      text: shareText,
                    });
                  } else {
                    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
                  }
                }}
              >
                <i className="fab fa-whatsapp mr-2"></i>
                Invite
              </Button>
            </div>
            
            {/* Referral Stats */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="text-center bg-white/10 p-3 rounded-lg">
                <div className="text-2xl font-bold">{(user as any).totalReferrals || 0}</div>
                <div className="text-white/80 text-sm">Friends Invited</div>
              </div>
              <div className="text-center bg-white/10 p-3 rounded-lg">
                <div className="text-2xl font-bold">₦{(((user as any).totalReferrals || 0) * 1000).toLocaleString()}</div>
                <div className="text-white/80 text-sm">Earned</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings and Logout Section */}
        <Card>
          <CardContent className="p-6 space-y-3">
            {/* Settings Button */}
            <Button
              onClick={() => setLocation('/settings')}
              variant="outline"
              className="w-full flex items-center space-x-2"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </Button>
            
            {/* Logout Button */}
            <Button
              onClick={() => logoutMutation.mutate()}
              variant="destructive"
              className="w-full flex items-center space-x-2"
              disabled={logoutMutation.isPending}
            >
              <LogOut className="w-4 h-4" />
              <span>{logoutMutation.isPending ? 'Logging out...' : 'Logout'}</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}