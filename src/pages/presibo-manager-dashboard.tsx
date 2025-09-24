import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Users, 
  Calendar, 
  FileText, 
  MessageSquare, 
  UserPlus, 
  LogOut, 
  CreditCard,
  UsersIcon,
  TrendingUp,
  Building,
  DollarSign,
  Target,
  BarChart3,
  Search
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  tel?: string;
  age?: number;
  bloodGroup?: string;
  sex?: string;
  createdAt?: string;
}

interface TeamMember {
  id: number;
  name: string;
  email: string;
  title: string;
  role: string;
  reportsTo?: string;
  department: string;
  joinDate: string;
  status: 'active' | 'inactive';
  progress?: {
    tasksCompleted: number;
    totalTasks: number;
    performanceScore: number;
  };
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
  userReferralId?: string;
  userEmail?: string;
  userPhone?: string;
  userName?: string;
  formattedDate?: string;
  formattedTime?: string;
}

interface Subscription {
  id: number;
  userId: number;
  planType: string;
  amount: number;
  status: string;
  userName?: string;
  userEmail?: string;
  formattedDate?: string;
}

interface PublicBooking {
  id: number;
  type: 'public';
  name: string;
  email: string;
  phone: string;
  age: number;
  sex: string;
  location: string;
  doctorId: number;
  doctorName: string;
  doctorSpecialty: string;
  appointmentDate?: string;
  appointmentTime?: string;
  message?: string;
  status: string;
  createdAt: string;
  formattedDate: string;
  formattedTime: string;
}

interface TrainerBooking {
  id: number;
  type: 'trainer';
  userId: number;
  userName: string;
  userEmail: string;
  trainerId: number;
  trainerName: string;
  trainerSpecialty: string;
  serviceType: string;
  amount: number;
  status: string;
  paymentReference?: string;
  sessionDate?: string;
  sessionTime?: string;
  status: string;
  notes?: string;
  createdAt: string;
  formattedDate: string;
  formattedTime: string;
}

interface BookingsData {
  publicBookings: PublicBooking[];
  trainerBookings: TrainerBooking[];
}

export default function PresiboManagerDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [aiChats, setAiChats] = useState<any[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [bookingsData, setBookingsData] = useState<BookingsData>({ publicBookings: [], trainerBookings: [] });
  const [externalUsersCount, setExternalUsersCount] = useState(0);
  const [isAddDoctorOpen, setIsAddDoctorOpen] = useState(false);
  const [isAddTeamMemberOpen, setIsAddTeamMemberOpen] = useState(false);
  const [newTeamMember, setNewTeamMember] = useState({
    name: "",
    email: "",
    title: "",
    role: "",
    reportsTo: "",
    department: ""
  });

  useEffect(() => {
    const token = localStorage.getItem("presibo-manager-token");
    if (!token) {
      setLocation("/presibo-manager");
      return;
    }
    
    fetchData();
  }, [setLocation]);

  const fetchData = async () => {
    const token = localStorage.getItem("presibo-manager-token");
    const headers = {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    };

    try {
      const [usersRes, appointmentsRes, prescriptionsRes, aiChatsRes, paymentsRes, subscriptionsRes, teamRes, doctorsRes, bookingsRes, externalRes] = await Promise.all([
        fetch("/api/presibo-manager/users", { headers }),
        fetch("/api/presibo-manager/appointments", { headers }),
        fetch("/api/presibo-manager/prescriptions", { headers }),
        fetch("/api/presibo-manager/ai-chats", { headers }),
        fetch("/api/presibo-manager/payments", { headers }),
        fetch("/api/presibo-manager/subscriptions", { headers }),
        fetch("/api/presibo-manager/team", { headers }),
        fetch("/api/doctors", { headers }),
        fetch("/api/presibo-manager/bookings", { headers }),
        fetch("https://presibo-wl.vercel.app/database.json")
      ]);

      if (usersRes.ok) setUsers(await usersRes.json());
      if (appointmentsRes.ok) setAppointments(await appointmentsRes.json());
      if (prescriptionsRes.ok) setPrescriptions(await prescriptionsRes.json());
      if (aiChatsRes.ok) setAiChats(await aiChatsRes.json());
      if (paymentsRes.ok) setPayments(await paymentsRes.json());
      if (subscriptionsRes.ok) setSubscriptions(await subscriptionsRes.json());
      if (teamRes.ok) setTeamMembers(await teamRes.json());
      if (doctorsRes.ok) setDoctors(await doctorsRes.json());
      if (bookingsRes.ok) setBookingsData(await bookingsRes.json());
      if (externalRes.ok) {
        const externalData = await externalRes.json();
        setExternalUsersCount(externalData.users?.length || 0);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("presibo-manager-token");
    setLocation("/presibo-manager");
  };

  const handleUpdateBookingStatus = async (type: 'public' | 'trainer', id: number, status: string) => {
    const token = localStorage.getItem("presibo-manager-token");
    const endpoint = type === 'public' 
      ? `/api/presibo-manager/bookings/public/${id}`
      : `/api/presibo-manager/bookings/trainer/${id}`;
    
    try {
      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        toast({
          title: "Booking status updated successfully",
        });
        fetchData(); // Refresh data
      } else {
        throw new Error('Failed to update booking status');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update booking status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddTeamMember = async () => {
    const token = localStorage.getItem("presibo-manager-token");
    try {
      const response = await fetch("/api/presibo-manager/team", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...newTeamMember,
          joinDate: new Date().toISOString(),
          status: "active"
        })
      });

      if (response.ok) {
        toast({ title: "Team member added successfully" });
        setIsAddTeamMemberOpen(false);
        setNewTeamMember({ name: "", email: "", title: "", role: "", reportsTo: "", department: "" });
        fetchData();
      }
    } catch (error) {
      toast({ title: "Error adding team member", variant: "destructive" });
    }
  };

  const confirmPayment = async (paymentId: number) => {
    const token = localStorage.getItem("presibo-manager-token");
    try {
      const response = await fetch(`/api/presibo-manager/payments/${paymentId}/confirm`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        toast({ title: "Payment confirmed successfully" });
        fetchData();
      }
    } catch (error) {
      toast({ title: "Error confirming payment", variant: "destructive" });
    }
  };

  // Filter data based on search term
  const filteredUsers = users.filter(user => 
    user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTeamMembers = teamMembers.filter(member => 
    member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPayments = payments.filter(payment => 
    payment.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.userEmail?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSubscriptions = subscriptions.filter(subscription => 
    subscription.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subscription.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subscription.planType?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate stats
  const totalRevenue = payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);
  const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;
  const pendingPayments = payments.filter(p => p.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Building className="h-8 w-8 text-green-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Presibo Manager</h1>
              <p className="text-sm text-gray-600">Comprehensive Management Dashboard</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="p-6">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search users, team members, payments, subscriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-9">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
            <TabsTrigger value="ai-chats">AI Chats</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{users.length+externalUsersCount+3993}</div>
                  <p className="text-xs text-muted-foreground">+{externalUsersCount} from external database</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₦{totalRevenue.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activeSubscriptions}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                  <UsersIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{teamMembers.length}</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">{appointments.length} appointments today</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MessageSquare className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{aiChats.length} AI consultations</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CreditCard className="h-4 w-4 text-orange-600" />
                      <span className="text-sm">{pendingPayments} pending payments</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button className="w-full" onClick={() => setActiveTab("team")}>
                    <UsersIcon className="mr-2 h-4 w-4" />
                    Manage Team
                  </Button>
                  <Button className="w-full" variant="outline" onClick={() => setActiveTab("payments")}>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Review Payments
                  </Button>
                  <Button className="w-full" variant="outline" onClick={() => setActiveTab("subscriptions")}>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Manage Subscriptions
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Total Users: {users.length+3993}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredUsers.map((user) => (
                    <div key={user.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{user.firstName} {user.lastName}</h3>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          <p className="text-sm text-gray-600">@{user.username}</p>
                          {user.tel && <p className="text-sm text-gray-600">{user.tel}</p>}
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">ID: {user.id}</Badge>
                          {user.age && <p className="text-sm mt-1">Age: {user.age}</p>}
                          {user.bloodGroup && <p className="text-sm">Blood: {user.bloodGroup}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Payment Management</CardTitle>
                <CardDescription>Total Revenue: ₦{totalRevenue.toLocaleString()}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredPayments.map((payment) => (
                    <div key={payment.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold">{payment.userName || `User ${payment.userId}`}</h3>
                          <p className="text-sm text-gray-600">{payment.userEmail}</p>
                          <p className="text-sm text-gray-600">₦{payment.amount.toLocaleString()}</p>
                          <p className="text-sm text-gray-600">{payment.formattedDate} {payment.formattedTime}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={payment.status === 'completed' ? 'default' : payment.status === 'pending' ? 'secondary' : 'destructive'}>
                            {payment.status}
                          </Badge>
                          {payment.status === 'pending' && (
                            <Button size="sm" onClick={() => confirmPayment(payment.id)}>
                              Confirm
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscriptions Tab */}
          <TabsContent value="subscriptions">
            <Card>
              <CardHeader>
                <CardTitle>Subscription Management</CardTitle>
                <CardDescription>Active Subscriptions: {activeSubscriptions}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredSubscriptions.map((subscription) => (
                    <div key={subscription.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold">{subscription.userName || `User ${subscription.userId}`}</h3>
                          <p className="text-sm text-gray-600">{subscription.userEmail}</p>
                          <p className="text-sm text-gray-600">{subscription.planType} - ₦{subscription.amount.toLocaleString()}</p>
                          <p className="text-sm text-gray-600">{subscription.formattedDate}</p>
                        </div>
                        <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>
                          {subscription.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Bookings Management</CardTitle>
                <CardDescription>Manage doctor and trainer bookings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Public Bookings */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Doctor Bookings ({bookingsData.publicBookings.length})</h3>
                  <div className="space-y-4">
                    {bookingsData.publicBookings.map((booking) => (
                      <div key={booking.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <h4 className="font-semibold text-lg">{booking.name}</h4>
                              <Badge variant={booking.status === 'confirmed' ? 'default' : booking.status === 'pending' ? 'secondary' : 'destructive'}>
                                {booking.status}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <p>📧 {booking.email}</p>
                              <p>📞 {booking.phone}</p>
                              <p>👤 Age: {booking.age}, Sex: {booking.sex}</p>
                              <p>📍 {booking.location}</p>
                              <p>🩺 {booking.doctorName} - {booking.doctorSpecialty}</p>
                              {booking.appointmentDate && booking.appointmentTime && (
                                <p>📅 <strong>Appointment Date/Time:</strong> {booking.appointmentDate} at {booking.appointmentTime}</p>
                              )}
                              <p>⏰ <strong>Booked:</strong> {booking.formattedDate} at {booking.formattedTime}</p>
                              {booking.message && <p>💬 {booking.message}</p>}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {booking.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleUpdateBookingStatus('public', booking.id, 'confirmed')}
                                >
                                  Confirm
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleUpdateBookingStatus('public', booking.id, 'cancelled')}
                                >
                                  Cancel
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {bookingsData.publicBookings.length === 0 && (
                      <div className="text-center text-gray-500 p-4">
                        No doctor bookings found
                      </div>
                    )}
                  </div>
                </div>

                {/* Trainer Bookings */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Trainer Bookings ({bookingsData.trainerBookings.length})</h3>
                  <div className="space-y-4">
                    {bookingsData.trainerBookings.map((booking) => (
                      <div key={booking.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <h4 className="font-semibold text-lg">{booking.userName}</h4>
                              <Badge variant={booking.status === 'confirmed' ? 'default' : booking.status === 'pending' ? 'secondary' : 'destructive'}>
                                {booking.status}
                              </Badge>
                              <Badge variant={booking.status === 'completed' ? 'default' : 'secondary'}>
                                {booking.status}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <p>📧 {booking.userEmail}</p>
                              <p>👨‍🏋️ {booking.trainerName} - {booking.trainerSpecialty}</p>
                              <p>🏃‍♂️ Service: {booking.serviceType}</p>
                              <p>💰 Amount: ₦{booking.amount}</p>
                              {booking.sessionDate && booking.sessionTime && (
                                <p>📅 <strong>Appointment Date/Time:</strong> {booking.sessionDate} at {booking.sessionTime}</p>
                              )}
                              <p>⏰ <strong>Booked:</strong> {booking.formattedDate} at {booking.formattedTime}</p>
                              {booking.paymentReference && <p>🧾 Ref: {booking.paymentReference}</p>}
                              {booking.notes && <p>📝 {booking.notes}</p>}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {booking.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleUpdateBookingStatus('trainer', booking.id, 'confirmed')}
                                >
                                  Confirm
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleUpdateBookingStatus('trainer', booking.id, 'cancelled')}
                                >
                                  Cancel
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {bookingsData.trainerBookings.length === 0 && (
                      <div className="text-center text-gray-500 p-4">
                        No trainer bookings found
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team Management Tab */}
          <TabsContent value="team">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Team Management</CardTitle>
                    <CardDescription>Manage team members, roles, and progress</CardDescription>
                  </div>
                  <Dialog open={isAddTeamMemberOpen} onOpenChange={setIsAddTeamMemberOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Add Team Member
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Team Member</DialogTitle>
                        <DialogDescription>Enter the details for the new team member</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="name">Name</Label>
                            <Input
                              id="name"
                              value={newTeamMember.name}
                              onChange={(e) => setNewTeamMember({...newTeamMember, name: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              value={newTeamMember.email}
                              onChange={(e) => setNewTeamMember({...newTeamMember, email: e.target.value})}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="title">Title</Label>
                            <Input
                              id="title"
                              value={newTeamMember.title}
                              onChange={(e) => setNewTeamMember({...newTeamMember, title: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="role">Role</Label>
                            <Select value={newTeamMember.role} onValueChange={(value) => setNewTeamMember({...newTeamMember, role: value})}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select role" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="manager">Manager</SelectItem>
                                <SelectItem value="developer">Developer</SelectItem>
                                <SelectItem value="designer">Designer</SelectItem>
                                <SelectItem value="analyst">Analyst</SelectItem>
                                <SelectItem value="support">Support</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="department">Department</Label>
                            <Select value={newTeamMember.department} onValueChange={(value) => setNewTeamMember({...newTeamMember, department: value})}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select department" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="engineering">Engineering</SelectItem>
                                <SelectItem value="design">Design</SelectItem>
                                <SelectItem value="product">Product</SelectItem>
                                <SelectItem value="marketing">Marketing</SelectItem>
                                <SelectItem value="sales">Sales</SelectItem>
                                <SelectItem value="operations">Operations</SelectItem>
                                <SelectItem value="hr">Human Resources</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="reportsTo">Reports To</Label>
                            <Input
                              id="reportsTo"
                              value={newTeamMember.reportsTo}
                              onChange={(e) => setNewTeamMember({...newTeamMember, reportsTo: e.target.value})}
                              placeholder="Manager name"
                            />
                          </div>
                        </div>
                        <Button onClick={handleAddTeamMember} className="w-full">
                          Add Team Member
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTeamMembers.map((member) => (
                    <Card key={member.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{member.name}</CardTitle>
                            <CardDescription>{member.title}</CardDescription>
                          </div>
                          <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                            {member.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <p className="text-sm"><strong>Email:</strong> {member.email}</p>
                          <p className="text-sm"><strong>Role:</strong> {member.role}</p>
                          <p className="text-sm"><strong>Department:</strong> {member.department}</p>
                          {member.reportsTo && <p className="text-sm"><strong>Reports To:</strong> {member.reportsTo}</p>}
                          <p className="text-sm"><strong>Join Date:</strong> {new Date(member.joinDate).toLocaleDateString()}</p>
                          
                          {member.progress && (
                            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                              <h4 className="text-sm font-semibold mb-2">Progress Tracking</h4>
                              <div className="space-y-1">
                                <div className="flex justify-between text-sm">
                                  <span>Tasks Completed</span>
                                  <span>{member.progress.tasksCompleted}/{member.progress.totalTasks}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-green-600 h-2 rounded-full" 
                                    style={{ width: `${(member.progress.tasksCompleted / member.progress.totalTasks) * 100}%` }}
                                  ></div>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span>Performance Score</span>
                                  <span>{member.progress.performanceScore}%</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Other tabs remain the same as case manager */}
          <TabsContent value="appointments">
            <Card>
              <CardHeader>
                <CardTitle>Appointment Management</CardTitle>
                <CardDescription>Total Appointments: {appointments.length}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <div key={appointment.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{appointment.userName}</h3>
                          <p className="text-sm text-gray-600">{appointment.userEmail}</p>
                          <p className="text-sm text-gray-600">{appointment.appointmentDate} at {appointment.appointmentTime}</p>
                          <p className="text-sm text-gray-600">Doctor: {appointment.doctorName}</p>
                        </div>
                        <Badge variant={appointment.status === 'completed' ? 'default' : appointment.status === 'pending' ? 'secondary' : 'destructive'}>
                          {appointment.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="prescriptions">
            <Card>
              <CardHeader>
                <CardTitle>Prescription Management</CardTitle>
                <CardDescription>Total Prescriptions: {prescriptions.length}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {prescriptions.map((prescription) => (
                    <div key={prescription.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">Dr. {prescription.doctorName}</h3>
                          <p className="text-sm text-gray-600">Patient: {prescription.patientName}</p>
                          <p className="text-sm text-gray-600">Email: {prescription.patientEmail}</p>
                          <p className="text-sm text-gray-600">Phone: {prescription.patientPhone}</p>
                          <p className="text-sm text-gray-600 mt-2"><strong>Prescription:</strong> {prescription.prescriptionText}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">ID: {prescription.id}</Badge>
                          <p className="text-sm text-gray-600 mt-1">{new Date(prescription.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai-chats">
            <Card>
              <CardHeader>
                <CardTitle>AI Chat Management</CardTitle>
                <CardDescription>Total AI Consultations: {aiChats.length}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {aiChats.map((chat) => (
                    <div key={chat.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold">User ID: {chat.userId}</h3>
                          <p className="text-sm text-gray-600 mb-2">Session: {chat.sessionId}</p>
                          <div className="bg-gray-50 p-3 rounded mb-2">
                            <p className="text-sm"><strong>User:</strong> {chat.userMessage}</p>
                          </div>
                          <div className="bg-blue-50 p-3 rounded">
                            <p className="text-sm"><strong>AI:</strong> {chat.aiResponse}</p>
                          </div>
                          {chat.severity && (
                            <Badge variant="outline" className="mt-2">Severity: {chat.severity}</Badge>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-sm text-gray-600">{new Date(chat.timestamp).toLocaleDateString()}</p>
                          <p className="text-sm text-gray-600">{new Date(chat.timestamp).toLocaleTimeString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}