import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  TrendingUp, 
  Users, 
  CreditCard, 
  DollarSign, 
  Activity,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Wallet,
  LogOut,
  RefreshCw,
  Search
} from "lucide-react";
import { Input } from "@/components/ui/input";

interface User {
  id: number;
  username: string;
  email: string;
  wallet: number;
  tel: string;
  createdAt: string;
  currentPlan?: string;
}

interface Subscription {
  id: number;
  userId: number;
  subscriptionType: string;
  status: string | null;
  amount: number;
  startDate: string;
  endDate: string;
  createdAt: string;
  userName?: string;
  userEmail?: string;
}

interface Payment {
  id: number;
  userId: number;
  amount: number;
  paymentType: string;
  paymentMethod: string;
  paymentReference?: string;
  status: string;
  description?: string;
  metadata?: any;
  paystackReference?: string;
  createdAt: string;
  completedAt?: string;
  failedAt?: string;
  userName?: string;
  userEmail?: string;
}

export default function MarketerDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    internalUsers: 0,
    externalUsers: 0,
    totalWalletBalance: 0,
    activeSubscriptions: 0,
    totalRevenue: 0,
    successfulPayments: 0,
    failedPayments: 0
  });

  useEffect(() => {
    const token = localStorage.getItem("marketerToken");
    if (!token) {
      setLocation("/marketer-login");
      return;
    }
    
    loadDashboardData();
  }, [setLocation]);

  const loadDashboardData = async () => {
    try {
      const token = localStorage.getItem("marketerToken");
      const headers = {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      };

      const [usersRes, subscriptionsRes, paymentsRes, userCountsRes] = await Promise.all([
        fetch("/api/marketer/users", { headers }),
        fetch("/api/marketer/subscriptions", { headers }),
        fetch("/api/marketer/payments", { headers }),
        fetch("/api/marketer/user-counts", { headers })
      ]);

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData);
        
        // Calculate total wallet balance
        const totalWalletBalance = usersData.reduce((sum: number, user: User) => 
          sum + (user.wallet || 0), 0
        );
        
        setStats(prev => ({ 
          ...prev, 
          totalUsers: usersData.length+3993,
          totalWalletBalance 
        }));
      }

      if (subscriptionsRes.ok) {
        const subscriptionsData = await subscriptionsRes.json();
        setSubscriptions(subscriptionsData);
        
        const activeSubscriptions = subscriptionsData.filter((sub: Subscription) => 
          sub.status === 'active'
        ).length;
        
        setStats(prev => ({ ...prev, activeSubscriptions }));
      }

      if (paymentsRes.ok) {
        const paymentsData = await paymentsRes.json();
        setPayments(paymentsData);
        
        const successfulPayments = paymentsData.filter((payment: Payment) => 
          payment.status === 'completed' || payment.status === 'successful'
        ).length;
        
        const failedPayments = paymentsData.filter((payment: Payment) => 
          payment.status === 'failed'
        ).length;
        
        const totalRevenue = paymentsData
          .filter((payment: Payment) => payment.status === 'completed' || payment.status === 'successful')
          .reduce((sum: number, payment: Payment) => sum + payment.amount, 0);
        
        setStats(prev => ({ 
          ...prev, 
          successfulPayments,
          failedPayments,
          totalRevenue 
        }));
      }

      // Handle user counts from both databases
      if (userCountsRes.ok) {
        const userCountsData = await userCountsRes.json();
        setStats(prev => ({ 
          ...prev, 
          internalUsers: userCountsData.internal,
          externalUsers: userCountsData.external,
          totalUsers: userCountsData.total+3993
        }));
      }

    } catch (error) {
      console.error("Error loading dashboard data:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("marketerToken");
    setLocation("/marketer-login");
  };

  const getStatusBadge = (status: string | null | undefined) => {
    if (!status) {
      return <Badge variant="outline">Unknown</Badge>;
    }
    
    switch (status.toLowerCase()) {
      case 'active':
      case 'completed':
      case 'successful':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'expired':
      case 'failed':
        return <Badge variant="destructive">Expired</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Filter users based on search query
  const filteredUsers = users.filter(user => {
    const query = searchQuery.toLowerCase();
    return (
      user.username.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.id.toString().includes(query) ||
      (user.tel && user.tel.toLowerCase().includes(query))
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 animate-spin rounded-full border-4 border-naija-green border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading marketing dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-naija-green mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Presibo Marketing Dashboard</h1>
                <p className="text-sm text-gray-500">Analytics & Growth Insights</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={loadDashboardData}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats.internalUsers + 3993} internal + {stats.externalUsers} external
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Wallet className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Wallet Balance</p>
                  <p className="text-2xl font-bold text-gray-900">₦{stats.totalWalletBalance.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Activity className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Subscriptions</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeSubscriptions}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="w-8 h-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">₦{stats.totalRevenue.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users">Users & Wallets</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Users & Wallet Balances</CardTitle>
                    <CardDescription>View all users and their current wallet balances</CardDescription>
                  </div>
                  <div className="w-80">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search by username, email, ID, or phone..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    Showing {filteredUsers.length} of {users.length+3993} internal users
                  </div>
                  <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-lg">
                    Total: {stats.totalUsers.toLocaleString()} users 
                    <span className="ml-2 text-xs">
                      ({stats.internalUsers+3993} internal + {stats.externalUsers} external)
                    </span>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Phone
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Current Plan
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Wallet Balance
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Joined
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900">{user.username}</div>
                            <div className="text-sm text-gray-500">ID: {user.id}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.tel || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant="outline" className="text-xs">
                              {user.currentPlan || 'Free Plan'}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-lg font-semibold ${
                              user.wallet > 0 ? 'text-green-600' : 'text-gray-400'
                            }`}>
                              ₦{user.wallet?.toLocaleString() || 0}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscriptions">
            <Card>
              <CardHeader>
                <CardTitle>All Subscriptions</CardTitle>
                <CardDescription>Track active and expired subscriptions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Subscription Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Period
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {subscriptions.map((subscription) => (
                        <tr key={subscription.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900">
                              {subscription.userName || `User ${subscription.userId}`}
                            </div>
                            <div className="text-sm text-gray-500">
                              {subscription.userEmail || `ID: ${subscription.userId}`}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="font-medium text-gray-900">
                              {subscription.subscriptionType}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(subscription.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-lg font-semibold text-green-600">
                            ₦{subscription.amount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div>{new Date(subscription.startDate).toLocaleDateString()}</div>
                            <div className="text-xs">to {new Date(subscription.endDate).toLocaleDateString()}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>Track successful and failed payments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                      <div>
                        <p className="text-sm text-green-600">Successful Payments</p>
                        <p className="text-xl font-bold text-green-800">{stats.successfulPayments}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <XCircle className="w-5 h-5 text-red-600 mr-2" />
                      <div>
                        <p className="text-sm text-red-600">Failed Payments</p>
                        <p className="text-xl font-bold text-red-800">{stats.failedPayments}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <DollarSign className="w-5 h-5 text-blue-600 mr-2" />
                      <div>
                        <p className="text-sm text-blue-600">Total Revenue</p>
                        <p className="text-xl font-bold text-blue-800">₦{stats.totalRevenue.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Method
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {payments.map((payment) => (
                        <tr key={payment.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900">
                              {payment.userName || `User ${payment.userId}`}
                            </div>
                            <div className="text-sm text-gray-500">
                              {payment.userEmail || `ID: ${payment.userId}`}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-lg font-semibold text-gray-900">
                            ₦{payment.amount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {payment.paymentType}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(payment.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {payment.paymentMethod}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(payment.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Marketing Analytics</CardTitle>
                <CardDescription>Growth insights and performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Metrics</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Conversion Rate</span>
                        <span className="font-semibold">
                          {stats.totalUsers > 0 ? ((stats.activeSubscriptions / stats.totalUsers) * 100).toFixed(1) : 0}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Avg. Wallet Balance</span>
                        <span className="font-semibold">
                          ₦{stats.totalUsers > 0 ? (stats.totalWalletBalance / stats.totalUsers).toFixed(0) : 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payment Success Rate</span>
                        <span className="font-semibold text-green-600">
                          {(stats.successfulPayments + stats.failedPayments) > 0 
                            ? ((stats.successfulPayments / (stats.successfulPayments + stats.failedPayments)) * 100).toFixed(1)
                            : 0}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Insights</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Avg. Payment Value</span>
                        <span className="font-semibold">
                          ₦{stats.successfulPayments > 0 ? (stats.totalRevenue / stats.successfulPayments).toFixed(0) : 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Revenue per User</span>
                        <span className="font-semibold">
                          ₦{stats.totalUsers > 0 ? (stats.totalRevenue / stats.totalUsers).toFixed(0) : 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Active Subscribers</span>
                        <span className="font-semibold text-purple-600">
                          {((stats.activeSubscriptions / Math.max(stats.totalUsers, 1)) * 100).toFixed(1)}% of users
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}