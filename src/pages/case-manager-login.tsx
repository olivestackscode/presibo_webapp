import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useLocation } from "wouter";
import { Loader2, FileText, Users, UserCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function CaseManagerLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/case-manager/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('caseManagerToken', data.token);
        toast({
          title: "Login successful",
          description: "Welcome to Presibo Case Manager Dashboard",
        });
        setLocation('/case-manager/dashboard');
      } else {
        toast({
          title: "Login failed",
          description: data.message || "Invalid credentials",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Network error. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 items-center">
        {/* Login Form */}
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-naija-green to-teal-600 rounded-full flex items-center justify-center">
                <FileText className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-naija-green">Presibo Case Manager</CardTitle>
            <CardDescription>
              Login to Case Manager Dashboad
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="casemanager@presibo.com"
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
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Feature Overview */}
        <div className="text-center lg:text-left space-y-6">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">
            Healthcare <span className="text-naija-green">Case Management</span>
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Comprehensive dashboard to manage doctors, consultations, prescriptions, and patient records across the Presibo platform.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-naija-green/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <UserCheck className="w-6 h-6 text-naija-green" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Doctor Management</h3>
              <p className="text-gray-600 text-sm">Add, edit, and manage doctor listings and availability</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-naija-green/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6 text-naija-green" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Consultation Tracking</h3>
              <p className="text-gray-600 text-sm">Monitor, confirm, and track all consultations</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-naija-green/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-naija-green" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Patient Records</h3>
              <p className="text-gray-600 text-sm">Access comprehensive patient health data and history</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}