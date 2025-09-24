import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  FileText,
  Users,
  UserCheck,
  Calendar,
  Stethoscope,
  Clock,
  Search,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  LogOut,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  Star,
  Activity
} from "lucide-react";

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  hospital?: string;
  location: string;
  rating: number;
  reviewCount: number;
  phone?: string;
  email?: string;
  specialties?: string[];
  available: boolean;
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
  duration: number;
  reason: string;
  notes?: string;
  status: string;
  priority: string;
  appointmentType: string;
  location?: string;
  fees?: number;
  paymentStatus?: string;
  createdAt: string;
}

interface Prescription {
  id: number;
  doctorName: string;
  doctorEmail: string;
  patientName: string;
  patientId: string;
  prescriptionDate: string;
  prescriptionTime: string;
  medication: string;
  additionalInstructions?: string;
  userId?: number;
  createdAt: string;
}

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  tel?: string;
  sex?: string;
  birth?: string;
  city?: string;
  country?: string;
  bloodGroup?: string;
  whatsappNumber?: string;
  address?: string;
  wallet: number;
  createdAt: string;
}

interface AIChat {
  id: number;
  userId: number;
  userName?: string;
  userEmail?: string;
  messages: any;
  status: string;
  consultationType: string;
  createdAt: string;
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
  paymentStatus: string;
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

export default function CaseManagerDashboard() {
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
    const token = localStorage.getItem('caseManagerToken');
    if (!token) {
      setLocation('/case-manager');
    }
  }, [setLocation]);

  // Data queries with case manager auth
  const getAuthHeaders = () => {
    const token = localStorage.getItem('caseManagerToken');
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
    queryKey: ["/api/case-manager/appointments"],
    queryFn: async () => {
      const headers = getAuthHeaders();
      const response = await fetch("/api/case-manager/appointments", {
        ...(headers && { headers }),
      });
      return await response.json();
    },
  });

  const { data: prescriptions = [] } = useQuery<Prescription[]>({
    queryKey: ["/api/case-manager/prescriptions"],
    queryFn: async () => {
      const headers = getAuthHeaders();
      const response = await fetch("/api/case-manager/prescriptions", {
        ...(headers && { headers }),
      });
      return await response.json();
    },
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/case-manager/users"],
    queryFn: async () => {
      const headers = getAuthHeaders();
      const response = await fetch("/api/case-manager/users", {
        ...(headers && { headers }),
      });
      return await response.json();
    },
  });

  const { data: aiChats = [] } = useQuery<AIChat[]>({
    queryKey: ["/api/case-manager/ai-chats"],
    queryFn: async () => {
      const headers = getAuthHeaders();
      const response = await fetch("/api/case-manager/ai-chats", {
        ...(headers && { headers }),
      });
      return await response.json();
    },
  });

  const { data: bookingsData } = useQuery<BookingsData>({
    queryKey: ["/api/case-manager/bookings"],
    queryFn: async () => {
      const headers = getAuthHeaders();
      const response = await fetch("/api/case-manager/bookings", {
        ...(headers && { headers }),
      });
      return await response.json();
    },
  });

  // Fetch external database count
  const { data: externalUsersCount = 0 } = useQuery<number>({
    queryKey: ["/api/external-users-count"],
    queryFn: async () => {
      try {
        const response = await fetch("https://presibo-wl.vercel.app/database.json");
        const data = await response.json();
        return data.users?.length || 0;
      } catch (error) {
        console.error("Error fetching external users:", error);
        return 0;
      }
    },
    refetchInterval: 60000, // Refetch every minute
  });

  // Filter data based on search term
  const filteredUsers = users.filter(user => 
    user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.tel?.includes(searchTerm)
  );

  const filteredAppointments = appointments.filter(appointment => 
    appointment.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.reason?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPrescriptions = prescriptions.filter(prescription => 
    prescription.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prescription.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prescription.medication?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDoctors = doctors.filter(doctor => 
    doctor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialty?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.hospital?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Mutations
  const addDoctorMutation = useMutation({
    mutationFn: async (doctorData: any) => {
      const authHeaders = getAuthHeaders();
      const response = await fetch("/api/case-manager/doctors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authHeaders || {}),
        },
        body: JSON.stringify(doctorData),
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/doctors"] });
      toast({ title: "Doctor added successfully" });
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
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add doctor",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateAppointmentMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await fetch(`/api/case-manager/appointments/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ status }),
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/case-manager/appointments"] });
      toast({ title: "Appointment updated successfully" });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update appointment",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createConsultationMutation = useMutation({
    mutationFn: async (consultationData: any) => {
      const authHeaders = getAuthHeaders();
      const response = await fetch("/api/case-manager/consultations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authHeaders || {}),
        },
        body: JSON.stringify(consultationData),
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/case-manager/appointments"] });
      toast({ title: "Consultation created successfully" });
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
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create consultation",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateBookingStatusMutation = useMutation({
    mutationFn: async ({ type, id, status }: { type: 'public' | 'trainer', id: number, status: string }) => {
      const endpoint = type === 'public' 
        ? `/api/case-manager/bookings/public/${id}`
        : `/api/case-manager/bookings/trainer/${id}`;
      
      const authHeaders = getAuthHeaders();
      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(authHeaders || {}),
        },
        body: JSON.stringify({ status }),
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/case-manager/bookings"] });
      toast({ title: "Booking status updated successfully" });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update booking status",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    localStorage.removeItem('caseManagerToken');
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    setLocation('/case-manager');
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "outline",
      confirmed: "default",
      completed: "secondary",
      cancelled: "destructive",
      rejected: "destructive"
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case "high":
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  // Filter data based on search


  // Stats calculations
  const pendingAppointments = appointments.filter(a => a.status === 'pending').length;
  const totalConsultations = appointments.length;
  const activeDoctors = doctors.filter(d => d.available).length;
  const totalPatients = ((users.length)+externalUsersCount+3993);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-naija-green mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Presibo Case Manager Dashboard</h1>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={handleLogout} variant="outline">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search patients, doctors, consultations, prescriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Appointments</p>
                  <p className="text-2xl font-bold text-gray-900">{pendingAppointments}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Stethoscope className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Consultations</p>
                  <p className="text-2xl font-bold text-gray-900">{totalConsultations}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <UserCheck className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Doctors</p>
                  <p className="text-2xl font-bold text-gray-900">{activeDoctors}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Patients</p>
                  <p className="text-2xl font-bold text-gray-900">{totalPatients}</p>
                  <p className="text-xs text-gray-500">+{externalUsersCount} from external database</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="consultations" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="consultations">Consultations</TabsTrigger>
            <TabsTrigger value="doctors">Doctors</TabsTrigger>
            <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
            <TabsTrigger value="patients">Patients</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="ai-consultations">AI Consultations</TabsTrigger>
            <TabsTrigger value="create">Create New</TabsTrigger>
          </TabsList>

          {/* Consultations Tab */}
          <TabsContent value="consultations" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Consultations & Appointments</h2>
              <Button onClick={() => queryClient.invalidateQueries()}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
            
            <div className="grid gap-4">
              {filteredAppointments.map((appointment) => (
                <Card key={appointment.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">{appointment.userName}</h3>
                          {getStatusBadge(appointment.status)}
                          {getPriorityIcon(appointment.priority)}
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p><Mail className="w-4 h-4 inline mr-2" />{appointment.userEmail}</p>
                          {appointment.userPhone && (
                            <p><Phone className="w-4 h-4 inline mr-2" />{appointment.userPhone}</p>
                          )}
                          <p><UserCheck className="w-4 h-4 inline mr-2" />Dr. {appointment.doctorName} - {appointment.doctorSpecialty}</p>
                          <p><Calendar className="w-4 h-4 inline mr-2" />{appointment.appointmentDate} at {appointment.appointmentTime}</p>
                          <p><Clock className="w-4 h-4 inline mr-2" />{appointment.duration} minutes</p>
                          <p><Activity className="w-4 h-4 inline mr-2" />{appointment.reason}</p>
                          {appointment.notes && <p><FileText className="w-4 h-4 inline mr-2" />{appointment.notes}</p>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {appointment.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => updateAppointmentMutation.mutate({ id: appointment.id, status: 'confirmed' })}
                              disabled={updateAppointmentMutation.isPending}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => updateAppointmentMutation.mutate({ id: appointment.id, status: 'rejected' })}
                              disabled={updateAppointmentMutation.isPending}
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        {appointment.status === 'confirmed' && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => updateAppointmentMutation.mutate({ id: appointment.id, status: 'completed' })}
                            disabled={updateAppointmentMutation.isPending}
                          >
                            Mark Complete
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Doctors Tab */}
          <TabsContent value="doctors" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Doctor Management</h2>
            </div>
            
            <div className="grid gap-4">
              {filteredDoctors.map((doctor) => (
                <Card key={doctor.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">Dr. {doctor.name}</h3>
                          <Badge variant={doctor.available ? "default" : "secondary"}>
                            {doctor.available ? "Available" : "Unavailable"}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p><Stethoscope className="w-4 h-4 inline mr-2" />{doctor.specialty}</p>
                          {doctor.hospital && <p><MapPin className="w-4 h-4 inline mr-2" />{doctor.hospital}</p>}
                          <p><MapPin className="w-4 h-4 inline mr-2" />{doctor.location}</p>
                          {doctor.phone && <p><Phone className="w-4 h-4 inline mr-2" />{doctor.phone}</p>}
                          {doctor.email && <p><Mail className="w-4 h-4 inline mr-2" />{doctor.email}</p>}
                          <p><Star className="w-4 h-4 inline mr-2" />{doctor.rating}/5 ({doctor.reviewCount} reviews)</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Prescriptions Tab */}
          <TabsContent value="prescriptions" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Prescriptions</h2>
            </div>
            
            <div className="grid gap-4">
              {filteredPrescriptions.map((prescription) => (
                <Card key={prescription.id}>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-lg">{prescription.patientName}</h3>
                        <Badge variant="outline">ID: {prescription.patientId}</Badge>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><UserCheck className="w-4 h-4 inline mr-2" /> {prescription.doctorName}</p>
                        <p><Mail className="w-4 h-4 inline mr-2" />{prescription.doctorEmail}</p>
                        <p><Calendar className="w-4 h-4 inline mr-2" />{prescription.prescriptionDate} at {prescription.prescriptionTime}</p>
                        <p><FileText className="w-4 h-4 inline mr-2" />Medication: {prescription.medication}</p>
                        {prescription.additionalInstructions && (
                          <p><Activity className="w-4 h-4 inline mr-2" />Instructions: {prescription.additionalInstructions}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Patients Tab */}
          <TabsContent value="patients" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Patient Records</h2>
            </div>
            
            <div className="grid gap-4">
              {filteredUsers.map((user) => (
                <Card key={user.id}>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-lg">{user.firstName} {user.lastName}</h3>
                        <Badge variant="outline">ID: {user.id}</Badge>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><Mail className="w-4 h-4 inline mr-2" />{user.email}</p>
                        {user.tel && <p><Phone className="w-4 h-4 inline mr-2" />{user.tel}</p>}
                        {user.whatsappNumber && <p><Phone className="w-4 h-4 inline mr-2" />WhatsApp: {user.whatsappNumber}</p>}
                        {user.sex && <p><Users className="w-4 h-4 inline mr-2" />Gender: {user.sex}</p>}
                        {user.birth && <p><Calendar className="w-4 h-4 inline mr-2" />DOB: {user.birth}</p>}
                        {user.bloodGroup && <p><Activity className="w-4 h-4 inline mr-2" />Blood Group: {user.bloodGroup}</p>}
                        {user.city && user.country && <p><MapPin className="w-4 h-4 inline mr-2" />{user.city}, {user.country}</p>}
                        {user.address && <p><MapPin className="w-4 h-4 inline mr-2" />Address: {user.address}</p>}
                        <p><Activity className="w-4 h-4 inline mr-2" />Wallet: ₦{user.wallet}</p>
                        <p><Calendar className="w-4 h-4 inline mr-2" />Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Bookings Management</h2>
              <Button onClick={() => queryClient.invalidateQueries()}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
            
            <div className="space-y-6">
              {/* Public Bookings */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Doctor Bookings ({bookingsData?.publicBookings?.length || 0})</h3>
                <div className="grid gap-4">
                  {bookingsData?.publicBookings?.map((booking) => (
                    <Card key={booking.id}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <h4 className="font-semibold text-lg">{booking.name}</h4>
                              <Badge variant={booking.status === 'confirmed' ? 'default' : booking.status === 'pending' ? 'secondary' : 'destructive'}>
                                {booking.status}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <p><Mail className="w-4 h-4 inline mr-2" />{booking.email}</p>
                              <p><Phone className="w-4 h-4 inline mr-2" />{booking.phone}</p>
                              <p><UserCheck className="w-4 h-4 inline mr-2" />Age: {booking.age}, Sex: {booking.sex}</p>
                              <p><MapPin className="w-4 h-4 inline mr-2" />{booking.location}</p>
                              <p><Stethoscope className="w-4 h-4 inline mr-2" />{booking.doctorName} - {booking.doctorSpecialty}</p>
                              {booking.appointmentDate && booking.appointmentTime && (
                                <p><Calendar className="w-4 h-4 inline mr-2" /><strong>Appointment Date/Time:</strong> {booking.appointmentDate} at {booking.appointmentTime}</p>
                              )}
                              <p><Clock className="w-4 h-4 inline mr-2" /><strong>Booked:</strong> {booking.formattedDate} at {booking.formattedTime}</p>
                              {booking.message && <p><FileText className="w-4 h-4 inline mr-2" />{booking.message}</p>}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {booking.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => updateBookingStatusMutation.mutate({ type: 'public', id: booking.id, status: 'confirmed' })}
                                  disabled={updateBookingStatusMutation.isPending}
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => updateBookingStatusMutation.mutate({ type: 'public', id: booking.id, status: 'cancelled' })}
                                  disabled={updateBookingStatusMutation.isPending}
                                >
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )) || (
                    <Card>
                      <CardContent className="p-6 text-center text-gray-500">
                        No doctor bookings found
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>

              {/* Trainer Bookings */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Trainer Bookings ({bookingsData?.trainerBookings?.length || 0})</h3>
                <div className="grid gap-4">
                  {bookingsData?.trainerBookings?.map((booking) => (
                    <Card key={booking.id}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <h4 className="font-semibold text-lg">{booking.userName}</h4>
                              <Badge variant={booking.status === 'confirmed' ? 'default' : booking.status === 'pending' ? 'secondary' : 'destructive'}>
                                {booking.status}
                              </Badge>
                              <Badge variant={booking.paymentStatus === 'completed' ? 'default' : 'secondary'}>
                                {booking.paymentStatus}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <p><Mail className="w-4 h-4 inline mr-2" />{booking.userEmail}</p>
                              <p><UserCheck className="w-4 h-4 inline mr-2" />{booking.trainerName} - {booking.trainerSpecialty}</p>
                              <p><Activity className="w-4 h-4 inline mr-2" />Service: {booking.serviceType}</p>
                              <p><span className="w-4 h-4 inline mr-2">₦</span>Amount: ₦{booking.amount}</p>
                              {booking.sessionDate && booking.sessionTime && (
                                <p><Calendar className="w-4 h-4 inline mr-2" /><strong>Appointment Date/Time:</strong> {booking.sessionDate} at {booking.sessionTime}</p>
                              )}
                              <p><Clock className="w-4 h-4 inline mr-2" /><strong>Booked:</strong> {booking.formattedDate} at {booking.formattedTime}</p>
                              {booking.paymentReference && <p><FileText className="w-4 h-4 inline mr-2" />Ref: {booking.paymentReference}</p>}
                              {booking.notes && <p><FileText className="w-4 h-4 inline mr-2" />{booking.notes}</p>}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {booking.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => updateBookingStatusMutation.mutate({ type: 'trainer', id: booking.id, status: 'confirmed' })}
                                  disabled={updateBookingStatusMutation.isPending}
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => updateBookingStatusMutation.mutate({ type: 'trainer', id: booking.id, status: 'cancelled' })}
                                  disabled={updateBookingStatusMutation.isPending}
                                >
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )) || (
                    <Card>
                      <CardContent className="p-6 text-center text-gray-500">
                        No trainer bookings found
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* AI Consultations Tab */}
          <TabsContent value="ai-consultations" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">AI Consultations</h2>
            </div>
            
            <div className="grid gap-4">
              {aiChats.map((chat) => (
                <Card key={chat.id}>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-lg">{chat.userName || 'Anonymous'}</h3>
                        <Badge variant="outline">{chat.status}</Badge>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        {chat.userEmail && <p><Mail className="w-4 h-4 inline mr-2" />{chat.userEmail}</p>}
                        <p><Activity className="w-4 h-4 inline mr-2" />Type: {chat.consultationType}</p>
                        <p><Calendar className="w-4 h-4 inline mr-2" />Started: {new Date(chat.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Create New Tab */}
          <TabsContent value="create" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Add New Doctor */}
              <Card>
                <CardHeader>
                  <CardTitle>Add New Doctor</CardTitle>
                  <CardDescription>Add a new doctor to the platform</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="doctor-name">Doctor Name</Label>
                    <Input
                      id="doctor-name"
                      value={newDoctor.name}
                      onChange={(e) => setNewDoctor({ ...newDoctor, name: e.target.value })}
                      placeholder="Dr. John Smith"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="doctor-specialty">Specialty</Label>
                    <Input
                      id="doctor-specialty"
                      value={newDoctor.specialty}
                      onChange={(e) => setNewDoctor({ ...newDoctor, specialty: e.target.value })}
                      placeholder="Cardiology"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="doctor-hospital">Hospital</Label>
                    <Input
                      id="doctor-hospital"
                      value={newDoctor.hospital}
                      onChange={(e) => setNewDoctor({ ...newDoctor, hospital: e.target.value })}
                      placeholder="Lagos University Teaching Hospital"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="doctor-location">Location</Label>
                    <Input
                      id="doctor-location"
                      value={newDoctor.location}
                      onChange={(e) => setNewDoctor({ ...newDoctor, location: e.target.value })}
                      placeholder="Lagos, Nigeria"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="doctor-phone">Phone</Label>
                    <Input
                      id="doctor-phone"
                      value={newDoctor.phone}
                      onChange={(e) => setNewDoctor({ ...newDoctor, phone: e.target.value })}
                      placeholder="+234 800 000 0000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="doctor-email">Email</Label>
                    <Input
                      id="doctor-email"
                      type="email"
                      value={newDoctor.email}
                      onChange={(e) => setNewDoctor({ ...newDoctor, email: e.target.value })}
                      placeholder="doctor@hospital.com"
                    />
                  </div>
                  <Button
                    onClick={() => addDoctorMutation.mutate(newDoctor)}
                    disabled={addDoctorMutation.isPending}
                    className="w-full"
                  >
                    {addDoctorMutation.isPending ? "Adding..." : "Add Doctor"}
                  </Button>
                </CardContent>
              </Card>

              {/* Create New Consultation */}
              <Card>
                <CardHeader>
                  <CardTitle>Create New Consultation</CardTitle>
                  <CardDescription>Schedule a new consultation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="consultation-user">Patient ID</Label>
                    <Input
                      id="consultation-user"
                      value={newConsultation.userId}
                      onChange={(e) => setNewConsultation({ ...newConsultation, userId: e.target.value })}
                      placeholder="Patient ID"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="consultation-doctor">Doctor ID</Label>
                    <Select onValueChange={(value) => setNewConsultation({ ...newConsultation, doctorId: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select doctor" />
                      </SelectTrigger>
                      <SelectContent>
                        {doctors.map((doctor) => (
                          <SelectItem key={doctor.id} value={doctor.id.toString()}>
                            Dr. {doctor.name} - {doctor.specialty}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="consultation-date">Date</Label>
                    <Input
                      id="consultation-date"
                      type="date"
                      value={newConsultation.appointmentDate}
                      onChange={(e) => setNewConsultation({ ...newConsultation, appointmentDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="consultation-time">Time</Label>
                    <Input
                      id="consultation-time"
                      type="time"
                      value={newConsultation.appointmentTime}
                      onChange={(e) => setNewConsultation({ ...newConsultation, appointmentTime: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="consultation-reason">Reason</Label>
                    <Textarea
                      id="consultation-reason"
                      value={newConsultation.reason}
                      onChange={(e) => setNewConsultation({ ...newConsultation, reason: e.target.value })}
                      placeholder="Consultation reason"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="consultation-priority">Priority</Label>
                    <Select onValueChange={(value) => setNewConsultation({ ...newConsultation, priority: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={() => createConsultationMutation.mutate(newConsultation)}
                    disabled={createConsultationMutation.isPending}
                    className="w-full"
                  >
                    {createConsultationMutation.isPending ? "Creating..." : "Create Consultation"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}