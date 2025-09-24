import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Redirect } from "wouter";
import { Loader2, Heart, Shield, Users, Bot, Activity } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import presiboLogo from "@assets/presibo-logo-removebg-preview_1751042157847.png";

interface AuthPageProps {
  defaultTab?: "login" | "signup";
}

export default function AppLogin({ defaultTab = "login" }: AuthPageProps) {
  const { user, loginMutation } = useAuth();
  const { toast } = useToast();

  // Login form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Signup form state
  const [signupData, setSignupData] = useState({
    firstname: "",
    midname: "",
    lastname: "",
    email: "",
    tel: "",
    sex: "",
    birth: "",
    city: "",
    country: "",
    password: "",
    bloodGroup: "",
    whatsappNumber: "",
    address: "",
    referralCode: ""
  });

  const [isSignupLoading, setIsSignupLoading] = useState(false);

  // Redirect if already logged in
  if (user) {
    return <Redirect to="/" />;
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      loginMutation.mutate({ email, password });
    }
  };

  const handleSignupInputChange = (field: string, value: string) => {
    setSignupData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSignupLoading(true);

    try {
      // Send data to local signup API
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstname: signupData.firstname,
          midname: signupData.midname,
          lastname: signupData.lastname,
          email: signupData.email,
          tel: signupData.tel,
          sex: signupData.sex,
          birth: signupData.birth,
          city: signupData.city,
          country: signupData.country,
          password: signupData.password,
          bloodGroup: signupData.bloodGroup,
          whatsappNumber: signupData.whatsappNumber,
          address: signupData.address,
          referralCode: signupData.referralCode
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      toast({
        title: "Registration successful!",
        description: "Welcome to Presibo! You're now logged in.",
      });

      // Redirect to health tips subscription page for new users
      window.location.href = '/health-tips-subscription';

    } catch (error) {
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSignupLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 items-center">
        {/* Auth Forms */}
        <div className="w-full max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto mb-4">
                <img 
                  src={presiboLogo} 
                  alt="Presibo Logo" 
                  className="w-16 h-16"
                />
              </div>
              <CardTitle className="text-2xl font-bold text-naija-green">
                Presibo
              </CardTitle>
              <p className="text-gray-600">
                Smart Health Anytime
              </p>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue={defaultTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="space-y-4">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-naija-green hover:bg-naija-green/90"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        "Sign In"
                      )}
                    </Button>
                  </form>
                  
                  {/* Forgot Password Link */}
                  <div className="text-center">
                    <a 
                      href="/forgot-password" 
                      className="text-sm text-naija-green hover:text-naija-green/80 underline"
                    >
                      Forgot your password?
                    </a>
                  </div>

                </TabsContent>

                <TabsContent value="signup" className="space-y-4">
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstname">First Name*</Label>
                        <Input
                          id="firstname"
                          placeholder="First name"
                          value={signupData.firstname}
                          onChange={(e) => handleSignupInputChange('firstname', e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="midname">Middle Name</Label>
                        <Input
                          id="midname"
                          placeholder="Middle name"
                          value={signupData.midname}
                          onChange={(e) => handleSignupInputChange('midname', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastname">Last Name*</Label>
                      <Input
                        id="lastname"
                        placeholder="Last name"
                        value={signupData.lastname}
                        onChange={(e) => handleSignupInputChange('lastname', e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email*</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="Enter your email"
                        value={signupData.email}
                        onChange={(e) => handleSignupInputChange('email', e.target.value)}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="tel">Phone Number*</Label>
                        <Input
                          id="tel"
                          type="tel"
                          placeholder="Phone number"
                          value={signupData.tel}
                          onChange={(e) => handleSignupInputChange('tel', e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
                        <Input
                          id="whatsappNumber"
                          type="tel"
                          placeholder="WhatsApp number"
                          value={signupData.whatsappNumber}
                          onChange={(e) => handleSignupInputChange('whatsappNumber', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sex">Gender*</Label>
                      <Select onValueChange={(value) => handleSignupInputChange('sex', value)} value={signupData.sex}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="birth">Date of Birth*</Label>
                        <Input
                          id="birth"
                          type="date"
                          value={signupData.birth}
                          onChange={(e) => handleSignupInputChange('birth', e.target.value)}
                          required
                        />
                      </div>

                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City*</Label>
                        <Input
                          id="city"
                          placeholder="City"
                          value={signupData.city}
                          onChange={(e) => handleSignupInputChange('city', e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="country">Country*</Label>
                        <Input
                          id="country"
                          placeholder="Country"
                          value={signupData.country}
                          onChange={(e) => handleSignupInputChange('country', e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bloodGroup">Blood Group</Label>
                      <Select onValueChange={(value) => handleSignupInputChange('bloodGroup', value)} value={signupData.bloodGroup}>
                        <SelectTrigger>
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



                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        placeholder="Full address"
                        value={signupData.address}
                        onChange={(e) => handleSignupInputChange('address', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="referralCode">Referral Code (Optional)</Label>
                      <Input
                        id="referralCode"
                        placeholder="Enter referral code (e.g., PRESIBO1, PRESIBO5)"
                        value={signupData.referralCode}
                        onChange={(e) => handleSignupInputChange('referralCode', e.target.value.toUpperCase())}
                      />
                      <p className="text-xs text-gray-500">
                        Have a referral code? Enter it here to give your friend ₦1000 bonus!
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password*</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="Create password"
                        value={signupData.password}
                        onChange={(e) => handleSignupInputChange('password', e.target.value)}
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-naija-green hover:bg-naija-green/90"
                      disabled={isSignupLoading}
                    >
                      {isSignupLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Hero Section */}
       
        </div>
      </div>
  );
}