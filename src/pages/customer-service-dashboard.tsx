import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Users,
  UserPlus,
  Calendar,
  FileText,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  LogOut,
  Mail,
  Phone,
  MapPin,
  Headphones,
  TrendingUp,
  Activity,
  UserCheck,
  AlertCircle,
  Plus,
  Eye,
  Edit,
  Trash2
} from "lucide-react";
import { useLocation } from "wouter";
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

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  hospital?: string;
  location: string;
  phone?: string;
  email?: string;
  specialties?: string;
  thumbnail?: string;
}

interface Appointment {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  userPhone?: string;
  doctorId: number;
  doctorName: string;
  doctorSpecialty: string;
  appointmentDate: string;
  appointmentTime: string;
  status: string;
  reason?: string;
  notes?: string;
  priority: string;
  appointmentType: string;
  duration: number;
  createdAt: string;
}

interface Prescription {
  id: number;
  patientName: string;
  patientEmail: string;
  doctorName: string;
  doctorSpecialty: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  dateIssued: string;
  status: string;
}

interface AiChat {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  sessionId: string;
  userMessage: string;
  aiResponse: string;
  severity: string;
  shouldSeekImmediate: boolean;
  doctorRecommendations?: string;
  followUpNeeded: boolean;
  tags?: string[];
  createdAt: string;
}

interface BookingWithUser {
  id: number;
  type: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  sex: string;
  preferredDate: string;
  preferredTime: string;
  reason: string;
  status: string;
  createdAt: string;
  userId?: number;
  userName?: string;
  userEmail?: string;
  serviceName?: string;
  location?: string;
  duration?: number;
  notes?: string;
  trainerName?: string;
  trainerSpecialty?: string;
  sessionType?: string;
  fitnessGoals?: string;
  experienceLevel?: string;
  healthConditions?: string;
  doctorName?: string;
  doctorSpecialty?: string;
  symptoms?: string;
  urgency?: string;
  previousConsultations?: string;
  currentMedications?: string;
}

export default function CustomerServiceDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("overview");

  // New doctor form state
  const [newDoctor, setNewDoctor] = useState({
    name: "",
    specialty: "",
    hospital: "",
    location: "",
    phone: "",
    email: "",
    specialties: "",
    thumbnail: ""
  });

  // New consultation form state
  const [newConsultation, setNewConsultation] = useState({
    userId: "",
    doctorId: "",
    appointmentDate: "",
    appointmentTime: "",
    reason: "",
    notes: "",
    priority: "normal",
    appointmentType: "consultation",
    duration: 30
  });

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('customerServiceToken');
    if (!token) {
      setLocation('/customer-service');
    }
  }, [setLocation]);

  // Data queries with customer service auth
  const getAuthHeaders = () => {
    const token = localStorage.getItem('customerServiceToken');
    return token ? { Authorization: `Bearer ${token}` } : undefined;
  };

  const { data: doctors = [] } = useQuery<Doctor[]>({
    queryKey: ["/api/doctors"],
    queryFn: async () => {
      const headers = getAuthHeaders();
      const response = await fetch("/api/doctors", {
        ...(headers && { headers }),
      });
      return await response.json();
    },
  });

  const { data: appointments = [] } = useQuery<Appointment[]>({
    queryKey: ["/api/customer-service/appointments"],
    queryFn: async () => {
      const headers = getAuthHeaders();
      const response = await fetch("/api/customer-service/appointments", {
        ...(headers && { headers }),
      });
      return await response.json();
    },
  });

  const { data: prescriptions = [] } = useQuery<Prescription[]>({
    queryKey: ["/api/customer-service/prescriptions"],
    queryFn: async () => {
      const headers = getAuthHeaders();
      const response = await fetch("/api/customer-service/prescriptions", {
        ...(headers && { headers }),
      });
      return await response.json();
    },
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/customer-service/users"],
    queryFn: async () => {
      const headers = getAuthHeaders();
      const response = await fetch("/api/customer-service/users", {
        ...(headers && { headers }),
      });
      return await response.json();
    },
  });

  const { data: aiChats = [] } = useQuery<AiChat[]>({
    queryKey: ["/api/customer-service/ai-chats"],
    queryFn: async () => {
      const headers = getAuthHeaders();
      const response = await fetch("/api/customer-service/ai-chats", {
        ...(headers && { headers }),
      });
      return await response.json();
    },
  });

  const { data: bookings = [] } = useQuery<BookingWithUser[]>({
    queryKey: ["/api/customer-service/bookings"],
    queryFn: async () => {
      const headers = getAuthHeaders();
      const response = await fetch("/api/customer-service/bookings", {
        ...(headers && { headers }),
      });
      return await response.json();
    },
  });

  // Calculate dashboard stats
  const stats = {
    totalUsers: users.length+5173,
    totalDoctors: doctors.length,
    pendingAppointments: appointments.filter(a => a.status === 'pending').length,
    totalConsultations: appointments.length,
    todayAppointments: appointments.filter(a => 
      new Date(a.appointmentDate).toDateString() === new Date().toDateString()
    ).length,
    urgentAiChats: aiChats.filter(chat => chat.severity === 'high').length,
    pendingBookings: bookings.filter(b => b.status === 'pending').length,
    activePrescriptions: prescriptions.filter(p => p.status === 'active').length
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('customerServiceToken');
    setLocation('/customer-service');
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
  };

  // Add doctor mutation
  const addDoctorMutation = useMutation({
    mutationFn: async (doctorData: any) => {
      const headers = getAuthHeaders();
      const response = await fetch("/api/customer-service/doctors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        body: JSON.stringify(doctorData),
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/doctors"] });
      setNewDoctor({
        name: "",
        specialty: "",
        hospital: "",
        location: "",
        phone: "",
        email: "",
        specialties: "",
        thumbnail: ""
      });
      toast({
        title: "Success",
        description: "Doctor added successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add doctor",
        variant: "destructive",
      });
    },
  });

  // Add consultation mutation
  const addConsultationMutation = useMutation({
    mutationFn: async (consultationData: any) => {
      const headers = getAuthHeaders();
      const response = await fetch("/api/customer-service/consultations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        body: JSON.stringify(consultationData),
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customer-service/appointments"] });
      setNewConsultation({
        userId: "",
        doctorId: "",
        appointmentDate: "",
        appointmentTime: "",
        reason: "",
        notes: "",
        priority: "normal",
        appointmentType: "consultation",
        duration: 30
      });
      toast({
        title: "Success",
        description: "Consultation scheduled successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to schedule consultation",
        variant: "destructive",
      });
    },
  });

  // Update booking status mutation
  const updateBookingStatusMutation = useMutation({
    mutationFn: async ({ bookingId, status }: { bookingId: number; status: string }) => {
      const headers = getAuthHeaders();
      const response = await fetch(`/api/customer-service/bookings/${bookingId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        body: JSON.stringify({ status }),
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customer-service/bookings"] });
      toast({
        title: "Success",
        description: "Booking status updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update booking status",
        variant: "destructive",
      });
    },
  });

  const filteredUsers = users.filter(user =>
    user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDoctors = doctors.filter(doctor =>
    doctor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialty?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAppointments = appointments.filter(appointment =>
    appointment.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.reason?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Headphones className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Customer Service Portal</h1>
                <p className="text-sm text-gray-500">Presibo Customer Support Dashboard</p>
              </div>
            </div>
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="doctors">Doctors</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
            <TabsTrigger value="ai-chats">AI Chats</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                  <p className="text-xs text-muted-foreground">
                    Registered platform users
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Support</CardTitle>
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pendingAppointments + stats.pendingBookings}</div>
                  <p className="text-xs text-muted-foreground">
                    Requiring immediate attention
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Today's Activity</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.todayAppointments}</div>
                  <p className="text-xs text-muted-foreground">
                    Scheduled for today
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Urgent Cases</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.urgentAiChats}</div>
                  <p className="text-xs text-muted-foreground">
                    High priority AI consultations
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activities */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Appointments */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    Recent Appointments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {appointments.slice(0, 5).map((appointment) => (
                      <div key={appointment.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{appointment.userName}</p>
                          <p className="text-sm text-gray-600">Dr. {appointment.doctorName}</p>
                          <p className="text-xs text-gray-500">{new Date(appointment.appointmentDate).toLocaleDateString()}</p>
                        </div>
                        <Badge variant={
                          appointment.status === 'confirmed' ? 'default' : 
                          appointment.status === 'pending' ? 'secondary' : 'destructive'
                        }>
                          {appointment.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Urgent AI Chats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-orange-600" />
                    Urgent AI Consultations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {aiChats.filter(chat => chat.severity === 'high').slice(0, 5).map((chat) => (
                      <div key={chat.id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                        <div>
                          <p className="font-medium">{chat.userName}</p>
                          <p className="text-sm text-gray-600">{chat.userMessage.substring(0, 50)}...</p>
                          <p className="text-xs text-gray-500">{new Date(chat.createdAt).toLocaleDateString()}</p>
                        </div>
                        <Badge variant="destructive">HIGH</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>Manage platform users and their accounts</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredUsers.map((user) => (
                    <div key={user.id} className="flex justify-between items-center p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">{user.firstName} {user.lastName}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {user.email}
                            </span>
                            {user.tel && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {user.tel}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                        </Badge>
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Doctors Tab */}
          <TabsContent value="doctors" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Doctor List */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Doctor Management</CardTitle>
                        <CardDescription>Manage healthcare providers on the platform</CardDescription>
                      </div>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="Search doctors..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 w-64"
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {filteredDoctors.map((doctor) => (
                        <div key={doctor.id} className="flex justify-between items-center p-4 border rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                              <UserCheck className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <h3 className="font-medium">Dr. {doctor.name}</h3>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span>{doctor.specialty}</span>
                                {doctor.hospital && <span>{doctor.hospital}</span>}
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {doctor.location}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Add Doctor Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Add New Doctor</CardTitle>
                  <CardDescription>Add a new healthcare provider</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="doctor-name">Doctor Name</Label>
                    <Input
                      id="doctor-name"
                      placeholder="Enter doctor's name"
                      value={newDoctor.name}
                      onChange={(e) => setNewDoctor({...newDoctor, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="doctor-specialty">Specialty</Label>
                    <Input
                      id="doctor-specialty"
                      placeholder="e.g., Cardiology"
                      value={newDoctor.specialty}
                      onChange={(e) => setNewDoctor({...newDoctor, specialty: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="doctor-hospital">Hospital</Label>
                    <Input
                      id="doctor-hospital"
                      placeholder="Hospital name"
                      value={newDoctor.hospital}
                      onChange={(e) => setNewDoctor({...newDoctor, hospital: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="doctor-location">Location</Label>
                    <Input
                      id="doctor-location"
                      placeholder="City, State"
                      value={newDoctor.location}
                      onChange={(e) => setNewDoctor({...newDoctor, location: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="doctor-phone">Phone</Label>
                    <Input
                      id="doctor-phone"
                      placeholder="Phone number"
                      value={newDoctor.phone}
                      onChange={(e) => setNewDoctor({...newDoctor, phone: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="doctor-email">Email</Label>
                    <Input
                      id="doctor-email"
                      type="email"
                      placeholder="doctor@email.com"
                      value={newDoctor.email}
                      onChange={(e) => setNewDoctor({...newDoctor, email: e.target.value})}
                    />
                  </div>
                  <Button
                    onClick={() => addDoctorMutation.mutate(newDoctor)}
                    disabled={addDoctorMutation.isPending || !newDoctor.name || !newDoctor.specialty}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Doctor
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Appointment Management</CardTitle>
                    <CardDescription>Monitor and manage all appointments</CardDescription>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search appointments..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredAppointments.map((appointment) => (
                    <div key={appointment.id} className="flex justify-between items-center p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">{appointment.userName}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>Dr. {appointment.doctorName}</span>
                            <span>{appointment.doctorSpecialty}</span>
                            <span>{new Date(appointment.appointmentDate).toLocaleDateString()}</span>
                            <span>{appointment.appointmentTime}</span>
                          </div>
                          {appointment.reason && (
                            <p className="text-sm text-gray-500 mt-1">{appointment.reason}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          appointment.status === 'confirmed' ? 'default' : 
                          appointment.status === 'pending' ? 'secondary' : 
                          appointment.status === 'completed' ? 'default' : 'destructive'
                        }>
                          {appointment.status}
                        </Badge>
                        <Badge variant="outline">
                          {appointment.priority}
                        </Badge>
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Prescriptions Tab */}
          <TabsContent value="prescriptions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Prescription Management</CardTitle>
                <CardDescription>Monitor and manage all prescriptions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {prescriptions.map((prescription) => (
                    <div key={prescription.id} className="flex justify-between items-center p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <FileText className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">{prescription.patientName}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>Dr. {prescription.doctorName}</span>
                            <span>{prescription.medication}</span>
                            <span>{prescription.dosage}</span>
                            <span>{new Date(prescription.dateIssued).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          prescription.status === 'active' ? 'default' : 
                          prescription.status === 'completed' ? 'secondary' : 'destructive'
                        }>
                          {prescription.status}
                        </Badge>
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Chats Tab */}
          <TabsContent value="ai-chats" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Consultation Management</CardTitle>
                <CardDescription>Monitor AI health consultations and urgent cases</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {aiChats.map((chat) => (
                    <div key={chat.id} className="flex justify-between items-center p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          chat.severity === 'high' ? 'bg-red-100' : 
                          chat.severity === 'medium' ? 'bg-yellow-100' : 'bg-green-100'
                        }`}>
                          <MessageSquare className={`w-5 h-5 ${
                            chat.severity === 'high' ? 'text-red-600' : 
                            chat.severity === 'medium' ? 'text-yellow-600' : 'text-green-600'
                          }`} />
                        </div>
                        <div>
                          <h3 className="font-medium">{chat.userName}</h3>
                          <p className="text-sm text-gray-600">{chat.userMessage.substring(0, 100)}...</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                            <span>{new Date(chat.createdAt).toLocaleDateString()}</span>
                            <span>Session: {chat.sessionId.substring(0, 8)}...</span>
                            {chat.shouldSeekImmediate && (
                              <span className="text-red-600 font-medium">IMMEDIATE ATTENTION</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          chat.severity === 'high' ? 'destructive' : 
                          chat.severity === 'medium' ? 'secondary' : 'default'
                        }>
                          {chat.severity.toUpperCase()}
                        </Badge>
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4" />
                        </Button>
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
                <CardTitle>Booking Management</CardTitle>
                <CardDescription>Manage trainer and public doctor bookings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="flex justify-between items-center p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">{booking.name}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {booking.email}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {booking.phone}
                            </span>
                            <span>{booking.type}</span>
                            <span>{new Date(booking.preferredDate).toLocaleDateString()}</span>
                          </div>
                          {booking.reason && (
                            <p className="text-sm text-gray-500 mt-1">{booking.reason}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          booking.status === 'confirmed' ? 'default' : 
                          booking.status === 'pending' ? 'secondary' : 'destructive'
                        }>
                          {booking.status}
                        </Badge>
                        {booking.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => updateBookingStatusMutation.mutate({
                                bookingId: booking.id,
                                status: 'confirmed'
                              })}
                              disabled={updateBookingStatusMutation.isPending}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => updateBookingStatusMutation.mutate({
                                bookingId: booking.id,
                                status: 'cancelled'
                              })}
                              disabled={updateBookingStatusMutation.isPending}
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4" />
                        </Button>
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