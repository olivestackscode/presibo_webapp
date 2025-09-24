import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Stethoscope, 
  Users, 
  Calendar, 
  MessageSquare, 
  Wallet, 
  BarChart3, 
  Settings,
  Video,
  Phone,
  FileText,
  Shield,
  Brain,
  LogOut,
  Clock,
  DollarSign,
  TrendingUp,
  UserPlus,
  AlertCircle,
  CheckCircle,
  Activity,
  Edit,
  Plus,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Save,
  X
} from "lucide-react";

interface Doctor {
  id: number;
  name: string;
  email: string;
  specialty: string;
  hospital?: string;
  location: string;
  consultationFee: number;
  walletBalance: number;
  totalConsultations: number;
  totalEarnings: number;
  rating: number;
  reviewCount: number;
  verified: boolean;
  thumbnail?: string;
  qualifications?: string[];
  experienceYears: number;
  bio?: string;
}

interface DashboardStats {
  todayConsultations: number;
  pendingConsultations: number;
  totalPatients: number;
  todayEarnings: number;
  monthlyEarnings: number;
  averageRating: number;
  completionRate: number;
}

interface Consultation {
  id: number;
  patientName: string;
  patientEmail: string;
  consultationType: string;
  status: string;
  scheduledAt: string;
  duration?: number;
  fees: number;
  paymentStatus: string;
  reason?: string;
  notes?: string;
  source?: string;
}

interface Patient {
  id: number;
  patientName: string;
  patientEmail: string;
  patientPhone?: string;
  totalConsultations: number;
  lastConsultation?: string;
  isActive: boolean;
}

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: number;
  type: 'consultation' | 'break' | 'unavailable';
  patientName?: string;
  patientEmail?: string;
  notes?: string;
}

export default function DoctorDashboard() {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Calendar state
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [newEvent, setNewEvent] = useState<Partial<CalendarEvent>>({
    title: '',
    date: '',
    time: '',
    duration: 30,
    type: 'consultation',
    notes: ''
  });

  // AI Diagnostic Assistant state
  const [showDiagnosticDialog, setShowDiagnosticDialog] = useState(false);
  const [diagnosticLoading, setDiagnosticLoading] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<any>(null);

  // Withdrawal state
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawForm, setWithdrawForm] = useState({
    amount: '',
    bankName: '',
    accountNumber: '',
    accountName: ''
  });
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [withdrawalsLoading, setWithdrawalsLoading] = useState(false);
  const [patientData, setPatientData] = useState({
    patientName: '',
    age: '',
    gender: '',
    chiefComplaint: '',
    symptoms: '',
    medicalHistory: '',
    currentMedications: '',
    allergies: '',
    vitals: {
      temperature: '',
      bloodPressure: '',
      heartRate: '',
      respiratoryRate: '',
      oxygenSaturation: ''
    },
    labResults: '',
    imagingResults: ''
  });

  useEffect(() => {
    const token = localStorage.getItem("doctorToken");
    if (!token) {
      setLocation("/doctor-login");
      return;
    }
    
    loadDashboardData();
  }, [setLocation]);

  // Load withdrawals
  const loadWithdrawals = async () => {
    try {
      const token = localStorage.getItem("doctorToken");
      const response = await fetch("/api/doctor/withdrawals", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (response.ok) {
        const withdrawalsData = await response.json();
        setWithdrawals(withdrawalsData);
      }
    } catch (error) {
      console.error("Error loading withdrawals:", error);
    }
  };

  const loadDashboardData = async () => {
    try {
      const token = localStorage.getItem("doctorToken");
      const headers = {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      };

      const [doctorRes, statsRes, consultationsRes, patientsRes] = await Promise.all([
        fetch("/api/doctor/profile", { headers }),
        fetch("/api/doctor/stats", { headers }),
        fetch("/api/doctor/consultations", { headers }),
        fetch("/api/doctor/patients", { headers })
      ]);

      if (doctorRes.ok) {
        const doctorData = await doctorRes.json();
        setDoctor(doctorData);
        
        // Once doctor is loaded, fetch additional data
        setTimeout(() => {
          fetchDoctorBookings();
          fetchDoctorPrescriptions();
          fetchAllPatientNotes();
          loadWithdrawals();
        }, 100);
      }
      if (statsRes.ok) setStats(await statsRes.json());
      if (consultationsRes.ok) setConsultations(await consultationsRes.json());
      if (patientsRes.ok) {
        const patientsData = await patientsRes.json();
        setPatients(patientsData);
        setDoctorPatients(patientsData); // Also set for patient management
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
    localStorage.removeItem("doctorToken");
    localStorage.removeItem("doctorId");
    setLocation("/doctor-login");
  };

  // Calendar helper functions
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const getEventsForDate = (date: string) => {
    return calendarEvents.filter(event => event.date === date);
  };

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(clickedDate);
    setNewEvent({
      ...newEvent,
      date: formatDate(clickedDate)
    });
  };

  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.date || !newEvent.time) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const event: CalendarEvent = {
      id: Date.now().toString(),
      title: newEvent.title!,
      date: newEvent.date!,
      time: newEvent.time!,
      duration: newEvent.duration || 30,
      type: newEvent.type as 'consultation' | 'break' | 'unavailable',
      patientName: newEvent.patientName,
      patientEmail: newEvent.patientEmail,
      notes: newEvent.notes
    };

    setCalendarEvents([...calendarEvents, event]);
    setShowEventDialog(false);
    setNewEvent({
      title: '',
      date: '',
      time: '',
      duration: 30,
      type: 'consultation',
      notes: ''
    });

    toast({
      title: "Success",
      description: "Event added to calendar",
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  // AI Diagnostic Assistant functions
  const handleDiagnosticAnalysis = async () => {
    if (!patientData.patientName || !patientData.chiefComplaint || !patientData.symptoms) {
      toast({
        title: "Missing Information",
        description: "Patient name, chief complaint, and symptoms are required",
        variant: "destructive",
      });
      return;
    }

    setDiagnosticLoading(true);
    try {
      const token = localStorage.getItem("doctorToken");
      const response = await fetch("/api/doctor/diagnostic-analysis", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...patientData,
          age: patientData.age ? parseInt(patientData.age) : undefined,
          vitals: {
            temperature: patientData.vitals.temperature ? parseFloat(patientData.vitals.temperature) : undefined,
            heartRate: patientData.vitals.heartRate ? parseInt(patientData.vitals.heartRate) : undefined,
            respiratoryRate: patientData.vitals.respiratoryRate ? parseInt(patientData.vitals.respiratoryRate) : undefined,
            oxygenSaturation: patientData.vitals.oxygenSaturation ? parseFloat(patientData.vitals.oxygenSaturation) : undefined,
            bloodPressure: patientData.vitals.bloodPressure || undefined
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Analysis failed');
      }

      const result = await response.json();
      setDiagnosticResult(result);
      
      toast({
        title: "Analysis Complete",
        description: "AI diagnostic analysis has been completed successfully",
      });
    } catch (error: any) {
      console.error("Diagnostic analysis error:", error);
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to perform diagnostic analysis",
        variant: "destructive",
      });
    } finally {
      setDiagnosticLoading(false);
    }
  };

  const resetDiagnosticForm = () => {
    setPatientData({
      patientName: '',
      age: '',
      gender: '',
      chiefComplaint: '',
      symptoms: '',
      medicalHistory: '',
      currentMedications: '',
      allergies: '',
      vitals: {
        temperature: '',
        bloodPressure: '',
        heartRate: '',
        respiratoryRate: '',
        oxygenSaturation: ''
      },
      labResults: '',
      imagingResults: ''
    });
    setDiagnosticResult(null);
  };

  // Additional state for new sections
  const [doctorBookings, setDoctorBookings] = useState<any[]>([]);
  const [doctorPrescriptions, setDoctorPrescriptions] = useState<any[]>([]);
  const [doctorPatients, setDoctorPatients] = useState<any[]>([]);
  const [patientNotes, setPatientNotes] = useState<{[key: number]: any[]}>({});
  const [newPatientNote, setNewPatientNote] = useState({
    patientId: 0,
    patientEmail: '',
    patientName: '',
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [showAddNoteDialog, setShowAddNoteDialog] = useState(false);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [prescriptionsLoading, setPrescriptionsLoading] = useState(false);
  const [notesLoading, setNotesLoading] = useState(false);

  // Fetch doctor bookings from appointments and public bookings
  const fetchDoctorBookings = async () => {
    if (!doctor) return;
    
    setBookingsLoading(true);
    try {
      const token = localStorage.getItem("doctorToken");
      
      // Fetch appointments by doctor email
      const appointmentsResponse = await fetch(`/api/appointments?doctorEmail=${encodeURIComponent(doctor.email)}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      // Fetch public bookings by doctor id
      const publicBookingsResponse = await fetch(`/api/public-bookings?doctorId=${doctor.id}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      const appointments = appointmentsResponse.ok ? await appointmentsResponse.json() : [];
      const publicBookings = publicBookingsResponse.ok ? await publicBookingsResponse.json() : [];
      
      // Combine and format bookings
      const allBookings = [
        ...appointments.map((apt: any) => ({
          ...apt,
          type: 'appointment',
          patientName: apt.user_name,
          patientEmail: apt.user_email,
          date: apt.appointment_date,
          time: apt.appointment_time,
          consultationType: apt.appointment_type || 'consultation'
        })),
        ...publicBookings.filter((booking: any) => booking.doctor_id === doctor.id).map((booking: any) => ({
          ...booking,
          type: 'public_booking',
          patientName: booking.name,
          patientEmail: booking.email,
          date: booking.date,
          time: booking.time,
          consultationType: booking.consultation_type || 'consultation'
        }))
      ];
      
      setDoctorBookings(allBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setBookingsLoading(false);
    }
  };

  // Fetch doctor prescriptions using authenticated doctor endpoint
  const fetchDoctorPrescriptions = async () => {
    setPrescriptionsLoading(true);
    try {
      const token = localStorage.getItem("doctorToken");
      const response = await fetch('/api/doctor/prescriptions', {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (response.ok) {
        const prescriptions = await response.json();
        setDoctorPrescriptions(prescriptions);
      } else {
        console.error('Failed to fetch prescriptions:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    } finally {
      setPrescriptionsLoading(false);
    }
  };

  // Save patient note
  const savePatientNote = async () => {
    if (!newPatientNote.patientId || !newPatientNote.notes.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select a patient and enter notes",
        variant: "destructive",
      });
      return;
    }

    setNotesLoading(true);
    try {
      const token = localStorage.getItem("doctorToken");
      const response = await fetch('/api/patient-notes', {
        method: 'POST',
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          patientId: newPatientNote.patientId,
          doctorEmail: doctor?.email,
          notes: newPatientNote.notes,
          date: newPatientNote.date
        })
      });

      if (response.ok) {
        const savedNote = await response.json();
        
        // Update local state
        setPatientNotes(prev => ({
          ...prev,
          [newPatientNote.patientId]: [
            ...(prev[newPatientNote.patientId] || []),
            savedNote
          ]
        }));

        // Reset form
        setNewPatientNote({
          patientId: 0,
          patientEmail: '',
          patientName: '',
          notes: '',
          date: new Date().toISOString().split('T')[0]
        });
        
        setShowAddNoteDialog(false);
        
        toast({
          title: "Success",
          description: "Patient note saved successfully",
        });
      } else {
        throw new Error('Failed to save note');
      }
    } catch (error) {
      console.error('Error saving note:', error);
      toast({
        title: "Error",
        description: "Failed to save patient note",
        variant: "destructive",
      });
    } finally {
      setNotesLoading(false);
    }
  };

  // Fetch all patient notes for the doctor
  const fetchAllPatientNotes = async () => {
    if (!doctor) return;
    
    try {
      const token = localStorage.getItem("doctorToken");
      const response = await fetch(`/api/patient-notes?doctorEmail=${encodeURIComponent(doctor.email)}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (response.ok) {
        const allNotes = await response.json();
        // Group notes by patient email since we're using consultations data
        const groupedNotes: {[key: string]: any[]} = {};
        allNotes.forEach((note: any) => {
          const key = note.patientEmail || note.patientId || 'unknown';
          if (!groupedNotes[key]) {
            groupedNotes[key] = [];
          }
          groupedNotes[key].push(note);
        });
        setPatientNotes(groupedNotes);
      }
    } catch (error) {
      console.error('Error fetching all patient notes:', error);
    }
  };

  // Fetch patient notes for a specific patient
  const fetchPatientNotes = async (patientId: number) => {
    try {
      const token = localStorage.getItem("doctorToken");
      const response = await fetch(`/api/patient-notes/${patientId}?doctorEmail=${encodeURIComponent(doctor?.email || '')}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (response.ok) {
        const notes = await response.json();
        setPatientNotes(prev => ({
          ...prev,
          [patientId]: notes
        }));
      }
    } catch (error) {
      console.error('Error fetching patient notes:', error);
    }
  };

  const handleStartConsultation = async (consultationId: number, type: string) => {
    try {
      const token = localStorage.getItem("doctorToken");
      const response = await fetch(`/api/doctor/consultations/${consultationId}/start`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ consultationType: type })
      });

      if (response.ok) {
        toast({
          title: "Consultation Started",
          description: `${type} consultation has been initiated`,
        });
        loadDashboardData(); // Refresh data
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start consultation",
        variant: "destructive",
      });
    }
  };

  // Handle withdrawal
  const handleWithdrawal = async () => {
    if (!withdrawForm.amount || !withdrawForm.bankName || !withdrawForm.accountNumber || !withdrawForm.accountName) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(withdrawForm.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    if (amount > (doctor?.walletBalance || 0)) {
      toast({
        title: "Error",
        description: "Insufficient balance for this withdrawal",
        variant: "destructive",
      });
      return;
    }

    setWithdrawLoading(true);
    try {
      const token = localStorage.getItem("doctorToken");
      const response = await fetch("/api/doctor/withdraw", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          amount,
          bankName: withdrawForm.bankName,
          accountNumber: withdrawForm.accountNumber,
          accountName: withdrawForm.accountName
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        // Update doctor balance immediately
        if (doctor) {
          setDoctor({
            ...doctor,
            walletBalance: result.newBalance
          });
        }

        // Reset form
        setWithdrawForm({
          amount: '',
          bankName: '',
          accountNumber: '',
          accountName: ''
        });

        setShowWithdrawDialog(false);
        
        // Reload withdrawals
        await loadWithdrawals();

        toast({
          title: "Withdrawal Requested",
          description: `₦${amount.toLocaleString()} withdrawal request submitted successfully. Processing may take 1-3 business days.`,
        });
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to process withdrawal");
      }
    } catch (error) {
      console.error("Error processing withdrawal:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process withdrawal",
        variant: "destructive",
      });
    } finally {
      setWithdrawLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Stethoscope className="w-12 h-12 animate-pulse text-naija-green mx-auto mb-4" />
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-lg font-semibold mb-2">Access Denied</p>
            <p className="text-gray-600 mb-4">Unable to load doctor profile</p>
            <Button onClick={() => setLocation("/doctor-login")}>
              Return to Login
            </Button>
          </CardContent>
        </Card>
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
              <Stethoscope className="w-8 h-8 text-naija-green mr-3" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Doctor Portal</h1>
                <p className="text-sm text-gray-500">Welcome back, Dr. {doctor.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {doctor.verified ? (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              ) : (
                <Badge variant="outline" className="border-orange-200 text-orange-800">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Pending Verification
                </Badge>
              )}
              <Button onClick={handleLogout} variant="outline" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-9">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="patients">Patients</TabsTrigger>
            <TabsTrigger value="consultations">Consultations</TabsTrigger>
            <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="wallet">Wallet</TabsTrigger>
            <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Today's Consultations</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.todayConsultations || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats?.pendingConsultations || 0} pending
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalPatients || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Active patient base
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Today's Earnings</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₦{stats?.todayEarnings?.toLocaleString() || 0}</div>
                  <p className="text-xs text-muted-foregreen">
                    ₦{stats?.monthlyEarnings?.toLocaleString() || 0} this month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₦{doctor.walletBalance?.toLocaleString() || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Available for withdrawal
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Doctor Profile Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={doctor.thumbnail} />
                      <AvatarFallback>{doctor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold">Dr. {doctor.name}</h3>
                      <p className="text-sm text-gray-600">{doctor.specialty}</p>
                      <p className="text-sm text-gray-500">{doctor.hospital}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-sm font-medium">Experience</p>
                      <p className="text-lg">{doctor.experienceYears} years</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Rating</p>
                      <p className="text-lg">{doctor.rating}/5.0 ⭐</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Qualifications</p>
                    <div className="flex flex-wrap gap-1">
                      {doctor.qualifications?.map((qual, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {qual}
                        </Badge>
                      )) || <span className="text-sm text-gray-500">Not specified</span>}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common tasks and features</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <Video className="w-4 h-4 mr-2" />
                    Start Video Consultation
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Phone className="w-4 h-4 mr-2" />
                    Start Audio Consultation
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Chat with Patients
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => setLocation("/prescriptions-form")}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Create Prescription
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Calendar className="w-4 h-4 mr-2" />
                    View Schedule
                  </Button>
                  <Dialog open={showDiagnosticDialog} onOpenChange={setShowDiagnosticDialog}>
                    <DialogTrigger asChild>
                      <Button className="w-full justify-start" variant="outline">
                        <Brain className="w-4 h-4 mr-2" />
                        AI Diagnostic Assistant
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>AI Diagnostic Assistant</DialogTitle>
                        <DialogDescription>
                          AI-powered clinical co-pilot for evidence-based diagnostics
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="grid gap-6">
                        {!diagnosticResult ? (
                          <>
                            {/* Patient Information */}
                            <div className="space-y-4">
                              <h3 className="text-lg font-medium">Patient Information</h3>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <Label htmlFor="patientName">Patient Name *</Label>
                                  <Input
                                    id="patientName"
                                    value={patientData.patientName}
                                    onChange={(e) => setPatientData({...patientData, patientName: e.target.value})}
                                    placeholder="Enter patient name"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="age">Age</Label>
                                  <Input
                                    id="age"
                                    type="number"
                                    value={patientData.age}
                                    onChange={(e) => setPatientData({...patientData, age: e.target.value})}
                                    placeholder="Age in years"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="gender">Gender</Label>
                                  <Select value={patientData.gender} onValueChange={(value) => setPatientData({...patientData, gender: value})}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="male">Male</SelectItem>
                                      <SelectItem value="female">Female</SelectItem>
                                      <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </div>

                            {/* Chief Complaint and Symptoms */}
                            <div className="space-y-4">
                              <h3 className="text-lg font-medium">Clinical Presentation</h3>
                              <div>
                                <Label htmlFor="chiefComplaint">Chief Complaint *</Label>
                                <Textarea
                                  id="chiefComplaint"
                                  value={patientData.chiefComplaint}
                                  onChange={(e) => setPatientData({...patientData, chiefComplaint: e.target.value})}
                                  placeholder="Main reason for the visit..."
                                  rows={2}
                                />
                              </div>
                              <div>
                                <Label htmlFor="symptoms">Symptoms and History *</Label>
                                <Textarea
                                  id="symptoms"
                                  value={patientData.symptoms}
                                  onChange={(e) => setPatientData({...patientData, symptoms: e.target.value})}
                                  placeholder="Detailed symptom description, onset, duration, severity, associated symptoms..."
                                  rows={4}
                                />
                              </div>
                            </div>

                            {/* Vitals */}
                            <div className="space-y-4">
                              <h3 className="text-lg font-medium">Vital Signs</h3>
                              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                <div>
                                  <Label htmlFor="temperature">Temperature (°C)</Label>
                                  <Input
                                    id="temperature"
                                    type="number"
                                    step="0.1"
                                    value={patientData.vitals.temperature}
                                    onChange={(e) => setPatientData({
                                      ...patientData,
                                      vitals: {...patientData.vitals, temperature: e.target.value}
                                    })}
                                    placeholder="36.5"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="bloodPressure">Blood Pressure</Label>
                                  <Input
                                    id="bloodPressure"
                                    value={patientData.vitals.bloodPressure}
                                    onChange={(e) => setPatientData({
                                      ...patientData,
                                      vitals: {...patientData.vitals, bloodPressure: e.target.value}
                                    })}
                                    placeholder="120/80"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="heartRate">Heart Rate (bpm)</Label>
                                  <Input
                                    id="heartRate"
                                    type="number"
                                    value={patientData.vitals.heartRate}
                                    onChange={(e) => setPatientData({
                                      ...patientData,
                                      vitals: {...patientData.vitals, heartRate: e.target.value}
                                    })}
                                    placeholder="72"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="respiratoryRate">Resp. Rate (/min)</Label>
                                  <Input
                                    id="respiratoryRate"
                                    type="number"
                                    value={patientData.vitals.respiratoryRate}
                                    onChange={(e) => setPatientData({
                                      ...patientData,
                                      vitals: {...patientData.vitals, respiratoryRate: e.target.value}
                                    })}
                                    placeholder="16"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="oxygenSaturation">SpO2 (%)</Label>
                                  <Input
                                    id="oxygenSaturation"
                                    type="number"
                                    value={patientData.vitals.oxygenSaturation}
                                    onChange={(e) => setPatientData({
                                      ...patientData,
                                      vitals: {...patientData.vitals, oxygenSaturation: e.target.value}
                                    })}
                                    placeholder="98"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Medical History */}
                            <div className="space-y-4">
                              <h3 className="text-lg font-medium">Additional Information</h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="medicalHistory">Medical History</Label>
                                  <Textarea
                                    id="medicalHistory"
                                    value={patientData.medicalHistory}
                                    onChange={(e) => setPatientData({...patientData, medicalHistory: e.target.value})}
                                    placeholder="Previous medical conditions, surgeries, family history..."
                                    rows={3}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="currentMedications">Current Medications</Label>
                                  <Textarea
                                    id="currentMedications"
                                    value={patientData.currentMedications}
                                    onChange={(e) => setPatientData({...patientData, currentMedications: e.target.value})}
                                    placeholder="List current medications and dosages..."
                                    rows={3}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="allergies">Allergies</Label>
                                  <Textarea
                                    id="allergies"
                                    value={patientData.allergies}
                                    onChange={(e) => setPatientData({...patientData, allergies: e.target.value})}
                                    placeholder="Known allergies and reactions..."
                                    rows={2}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="labResults">Lab Results</Label>
                                  <Textarea
                                    id="labResults"
                                    value={patientData.labResults}
                                    onChange={(e) => setPatientData({...patientData, labResults: e.target.value})}
                                    placeholder="Recent lab test results..."
                                    rows={2}
                                  />
                                </div>
                              </div>
                              <div>
                                <Label htmlFor="imagingResults">Imaging Results</Label>
                                <Textarea
                                  id="imagingResults"
                                  value={patientData.imagingResults}
                                  onChange={(e) => setPatientData({...patientData, imagingResults: e.target.value})}
                                  placeholder="X-ray, ultrasound, CT scan findings..."
                                  rows={2}
                                />
                              </div>
                            </div>
                          </>
                        ) : (
                          // Display Results
                          <div className="space-y-6">
                            <div className="flex items-center justify-between">
                              <h3 className="text-lg font-medium">Diagnostic Analysis Results</h3>
                              <Button onClick={resetDiagnosticForm} variant="outline">
                                New Analysis
                              </Button>
                            </div>

                            {/* Red Flags */}
                            {diagnosticResult.redFlags && diagnosticResult.redFlags.length > 0 && (
                              <div className="p-4 border-l-4 border-red-500 bg-red-50 rounded">
                                <h4 className="font-medium text-red-800 mb-2">⚠️ RED FLAGS</h4>
                                <div className="space-y-2">
                                  {diagnosticResult.redFlags.map((flag: any, index: number) => (
                                    <div key={index} className="text-red-700">
                                      <div className="font-medium">{flag.alert}</div>
                                      <div className="text-sm">Action: {flag.action}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Differential Diagnosis */}
                            <div>
                              <h4 className="font-medium mb-3">Differential Diagnosis</h4>
                              <div className="space-y-3">
                                {diagnosticResult.differentialDiagnosis?.map((diagnosis: any, index: number) => (
                                  <div key={index} className="p-3 border rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="font-medium">{diagnosis.condition}</span>
                                      <div className="flex items-center gap-2">
                                        <Badge variant={diagnosis.likelihood === 'high' ? 'default' : diagnosis.likelihood === 'moderate' ? 'secondary' : 'outline'}>
                                          {diagnosis.likelihood} likelihood
                                        </Badge>
                                        <span className="text-sm text-gray-500">{diagnosis.confidence}%</span>
                                      </div>
                                    </div>
                                    <p className="text-sm text-gray-600">{diagnosis.reasoning}</p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Recommended Tests */}
                            {diagnosticResult.recommendedTests && diagnosticResult.recommendedTests.length > 0 && (
                              <div>
                                <h4 className="font-medium mb-3">Recommended Tests</h4>
                                <ul className="list-disc list-inside space-y-1">
                                  {diagnosticResult.recommendedTests.map((test: string, index: number) => (
                                    <li key={index} className="text-sm">{test}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Treatment Suggestions */}
                            {diagnosticResult.treatmentSuggestions && diagnosticResult.treatmentSuggestions.length > 0 && (
                              <div>
                                <h4 className="font-medium mb-3">Treatment Suggestions</h4>
                                <ul className="list-disc list-inside space-y-1">
                                  {diagnosticResult.treatmentSuggestions.map((treatment: string, index: number) => (
                                    <li key={index} className="text-sm">{treatment}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* SOAP Note */}
                            {diagnosticResult.soapNote && (
                              <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-medium mb-3">SOAP Note</h4>
                                <div className="space-y-3">
                                  <div>
                                    <span className="font-medium text-blue-600">Subjective:</span>
                                    <p className="text-sm mt-1">{diagnosticResult.soapNote.subjective}</p>
                                  </div>
                                  <div>
                                    <span className="font-medium text-green-600">Objective:</span>
                                    <p className="text-sm mt-1">{diagnosticResult.soapNote.objective}</p>
                                  </div>
                                  <div>
                                    <span className="font-medium text-purple-600">Assessment:</span>
                                    <p className="text-sm mt-1">{diagnosticResult.soapNote.assessment}</p>
                                  </div>
                                  <div>
                                    <span className="font-medium text-orange-600">Plan:</span>
                                    <p className="text-sm mt-1">{diagnosticResult.soapNote.plan}</p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Follow-up Plan */}
                            {diagnosticResult.followUpPlan && (
                              <div>
                                <h4 className="font-medium mb-2">Follow-up Plan</h4>
                                <p className="text-sm text-gray-600">{diagnosticResult.followUpPlan}</p>
                              </div>
                            )}

                            {/* Sources and Uncertainties */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {diagnosticResult.sources && diagnosticResult.sources.length > 0 && (
                                <div>
                                  <h4 className="font-medium mb-2">Sources</h4>
                                  <ul className="list-disc list-inside text-sm text-gray-600">
                                    {diagnosticResult.sources.map((source: string, index: number) => (
                                      <li key={index}>{source}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {diagnosticResult.uncertainties && diagnosticResult.uncertainties.length > 0 && (
                                <div>
                                  <h4 className="font-medium mb-2">Areas of Uncertainty</h4>
                                  <ul className="list-disc list-inside text-sm text-gray-600">
                                    {diagnosticResult.uncertainties.map((uncertainty: string, index: number) => (
                                      <li key={index}>{uncertainty}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>

                            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                              <p className="text-sm text-yellow-800">
                                <strong>Important:</strong> This AI analysis is for clinical decision support only. 
                                Final diagnosis and treatment decisions must always be made by the attending physician.
                                Always consider the patient's full clinical context and your professional judgment.
                              </p>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex justify-end gap-2 pt-4">
                          <Button 
                            variant="outline" 
                            onClick={() => setShowDiagnosticDialog(false)}
                          >
                            {diagnosticResult ? 'Close' : 'Cancel'}
                          </Button>
                          {!diagnosticResult && (
                            <Button 
                              onClick={handleDiagnosticAnalysis} 
                              disabled={diagnosticLoading}
                              className="bg-naija-green hover:bg-naija-green/90"
                            >
                              {diagnosticLoading ? (
                                <>
                                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></div>
                                  Analyzing...
                                </>
                              ) : (
                                <>
                                  <Brain className="w-4 h-4 mr-2" />
                                  Analyze Case
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            </div>

            {/* Recent Consultations */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Consultations</CardTitle>
                <CardDescription>Your latest patient consultations</CardDescription>
              </CardHeader>
              <CardContent>
                {consultations.length > 0 ? (
                  <div className="space-y-4">
                    {consultations.slice(0, 5).map((consultation) => (
                      <div key={consultation.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <p className="font-medium">{consultation.patientName}</p>
                          <p className="text-sm text-gray-600">{consultation.consultationType}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(consultation.scheduledAt).toLocaleDateString()} at {new Date(consultation.scheduledAt).toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="text-right space-y-1">
                          <Badge variant={consultation.status === 'completed' ? 'default' : consultation.status === 'in_progress' ? 'secondary' : 'outline'}>
                            {consultation.status}
                          </Badge>
                          <p className="text-sm font-medium">₦{consultation.fees.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No consultations yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Other tabs can be implemented here */}
          <TabsContent value="patients">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Patient Management</CardTitle>
                  <CardDescription>Manage your patient records and consultations</CardDescription>
                </div>
                <Dialog open={showAddNoteDialog} onOpenChange={setShowAddNoteDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-naija-green hover:bg-naija-green/90">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add Patient Note
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Add Patient Note</DialogTitle>
                      <DialogDescription>
                        Add medical notes for a patient
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="patient-select" className="text-right">
                          Patient
                        </Label>
                        <div className="col-span-3">
                          <Select 
                            value={newPatientNote.patientEmail || ""} 
                            onValueChange={(value) => {
                              const selectedConsultation = consultations.find(c => c.patientEmail === value);
                              if (selectedConsultation) {
                                setNewPatientNote({
                                  ...newPatientNote, 
                                  patientId: selectedConsultation.id,
                                  patientEmail: selectedConsultation.patientEmail,
                                  patientName: selectedConsultation.patientName
                                });
                              }
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a patient" />
                            </SelectTrigger>
                            <SelectContent>
                              {consultations
                                .filter((consultation, index, self) => 
                                  // Remove duplicates based on patientEmail
                                  index === self.findIndex(c => c.patientEmail === consultation.patientEmail)
                                )
                                .map((consultation) => (
                                  <SelectItem key={consultation.patientEmail} value={consultation.patientEmail}>
                                    {consultation.patientName} - {consultation.patientEmail}
                                  </SelectItem>
                                ))}
                              {consultations.length === 0 && (
                                <SelectItem value="no-patients" disabled>
                                  No recent consultations
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="note-date" className="text-right">
                          Date
                        </Label>
                        <Input
                          id="note-date"
                          type="date"
                          value={newPatientNote.date}
                          onChange={(e) => setNewPatientNote({...newPatientNote, date: e.target.value})}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-start gap-4">
                        <Label htmlFor="notes" className="text-right mt-2">
                          Notes
                        </Label>
                        <textarea
                          id="notes"
                          value={newPatientNote.notes}
                          onChange={(e) => setNewPatientNote({...newPatientNote, notes: e.target.value})}
                          className="col-span-3 min-h-[100px] p-2 border rounded-md resize-none"
                          placeholder="Enter medical notes, observations, or treatment details..."
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowAddNoteDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={savePatientNote} disabled={notesLoading}>
                        {notesLoading ? 'Saving...' : 'Save Note'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {/* Get unique patients from consultations with notes */}
                {(() => {
                  const uniquePatients = consultations
                    .filter((consultation, index, self) => 
                      index === self.findIndex(c => c.patientEmail === consultation.patientEmail)
                    );
                  
                  return uniquePatients.length > 0 ? (
                    <div className="space-y-6">
                      {uniquePatients.map((patient) => {
                        const patientConsultations = consultations.filter(c => c.patientEmail === patient.patientEmail);
                        const hasNotes = Object.values(patientNotes).some(notes => 
                          notes.some(note => note.patientEmail === patient.patientEmail)
                        );
                        const patientNotesArray = Object.values(patientNotes).flat().filter(note => 
                          note.patientEmail === patient.patientEmail
                        );
                        
                        return (
                          <div key={patient.patientEmail} className="border rounded-lg p-6 space-y-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-semibold text-lg text-gray-900">{patient.patientName}</h3>
                                <p className="text-sm text-gray-600">{patient.patientEmail}</p>
                                <div className="flex gap-2 mt-2">
                                  <Badge variant="outline" className="text-xs">
                                    {patientConsultations.length} consultation{patientConsultations.length > 1 ? 's' : ''}
                                  </Badge>
                                  {patientNotesArray.length > 0 && (
                                    <Badge variant="secondary" className="text-xs">
                                      {patientNotesArray.length} note{patientNotesArray.length > 1 ? 's' : ''}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-gray-500">
                                  Last consultation: {new Date(patientConsultations[0]?.scheduledAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            
                            {/* Patient consultation history */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <h4 className="font-medium mb-3 text-gray-900">Recent Consultations</h4>
                              <div className="space-y-3">
                                {patientConsultations.slice(0, 3).map((consultation) => (
                                  <div key={consultation.id} className="flex justify-between items-center p-3 bg-white rounded border">
                                    <div>
                                      <span className="font-medium text-sm capitalize">{consultation.consultationType}</span>
                                      <p className="text-xs text-gray-500 mt-1">
                                        Status: <Badge variant={consultation.status === 'completed' ? 'default' : 'outline'} className="text-xs">
                                          {consultation.status}
                                        </Badge>
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <span className="text-sm text-gray-900">
                                        {new Date(consultation.scheduledAt).toLocaleDateString()}
                                      </span>
                                      <p className="text-xs text-gray-600">
                                        ₦{consultation.fees?.toLocaleString() || '2,000'}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Patient notes section */}
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-gray-900">Medical Notes</h4>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setNewPatientNote({
                                      ...newPatientNote,
                                      patientEmail: patient.patientEmail,
                                      patientName: patient.patientName,
                                      patientId: patient.id
                                    });
                                    setShowAddNoteDialog(true);
                                  }}
                                >
                                  <Plus className="w-3 h-3 mr-1" />
                                  Add Note
                                </Button>
                              </div>
                              
                              {patientNotesArray.length > 0 ? (
                                <div className="space-y-3 max-h-60 overflow-y-auto">
                                  {patientNotesArray
                                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                    .map((note, index) => (
                                    <div key={note.id || index} className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                                      <div className="flex justify-between items-start mb-2">
                                        <span className="font-medium text-blue-900">Medical Note</span>
                                        <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                          {new Date(note.date).toLocaleDateString()}
                                        </span>
                                      </div>
                                      <p className="text-gray-700 text-sm leading-relaxed">{note.notes}</p>
                                      {note.doctorEmail && (
                                        <p className="text-xs text-gray-500 mt-2">
                                          Added by: {note.doctorEmail}
                                        </p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="bg-gray-50 border-2 border-dashed border-gray-300 p-4 rounded-lg text-center">
                                  <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                  <p className="text-sm text-gray-500">No medical notes yet</p>
                                  <p className="text-xs text-gray-400 mt-1">Click "Add Note" to create the first medical note</p>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Patient Records</h3>
                      <p className="text-gray-500 mb-4">Patient records will appear here after consultations</p>
                      <p className="text-sm text-gray-400">Start by having consultations or add patient notes</p>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="consultations">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Video/Audio Consultations</CardTitle>
                  <CardDescription>Manage your online consultations and bookings</CardDescription>
                </div>
                <Button onClick={fetchDoctorBookings} variant="outline" disabled={bookingsLoading}>
                  <Activity className="w-4 h-4 mr-2" />
                  {bookingsLoading ? 'Loading...' : 'Refresh'}
                </Button>
              </CardHeader>
              <CardContent>
                {bookingsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-8 h-8 animate-spin rounded-full border-2 border-naija-green border-t-transparent"></div>
                  </div>
                ) : consultations.length > 0 ? (
                  <div className="space-y-4">
                    {consultations.map((consultation, index) => (
                      <div key={consultation.id || index} className="p-6 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between mb-4">
                          <div className="space-y-3 flex-1">
                            {/* Header with badges and patient name */}
                            <div className="flex items-center gap-3">
                              <Badge variant={consultation.source === 'appointment' ? 'default' : 'secondary'}>
                                {consultation.source === 'appointment' ? 'Appointment' : 'Public Booking'}
                              </Badge>
                              <Badge 
                                variant={
                                  consultation.status === 'completed' ? 'default' : 
                                  consultation.status === 'confirmed' ? 'secondary' : 
                                  consultation.status === 'pending' ? 'outline' : 'destructive'
                                }
                                className={
                                  consultation.status === 'completed' ? 'bg-green-100 text-green-800 border-green-300' :
                                  consultation.status === 'confirmed' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                                  consultation.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                                  'bg-red-100 text-red-800 border-red-300'
                                }
                              >
                                {consultation.status.charAt(0).toUpperCase() + consultation.status.slice(1)}
                              </Badge>
                              <h3 className="font-semibold text-lg">{consultation.patientName}</h3>
                            </div>

                            {/* Patient Details Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500 font-medium">Email:</span>
                                <p className="font-medium">{consultation.patientEmail || 'Not provided'}</p>
                              </div>
                              <div>
                                <span className="text-gray-500 font-medium">Consultation Type:</span>
                                <p className="font-medium capitalize">{consultation.consultationType}</p>
                              </div>
                              <div>
                                <span className="text-gray-500 font-medium">Duration:</span>
                                <p className="font-medium">{consultation.duration || 30} minutes</p>
                              </div>
                              <div>
                                <span className="text-gray-500 font-medium">Scheduled:</span>
                                <p className="font-medium">
                                  {new Date(consultation.scheduledAt).toLocaleDateString('en-US', { 
                                    weekday: 'short', 
                                    year: 'numeric', 
                                    month: 'short', 
                                    day: 'numeric'
                                  })}
                                </p>
                                <p className="text-gray-600">
                                  {new Date(consultation.scheduledAt).toLocaleTimeString('en-US', { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </p>
                              </div>
                              <div>
                                <span className="text-gray-500 font-medium">Fees:</span>
                                <p className="font-medium text-green-600">₦{consultation.fees?.toLocaleString() || '2,000'}</p>
                              </div>
                              <div>
                                <span className="text-gray-500 font-medium">Payment:</span>
                                <Badge 
                                  variant={consultation.paymentStatus === 'completed' ? 'default' : 'outline'}
                                  className={
                                    consultation.paymentStatus === 'completed' 
                                      ? 'bg-green-100 text-green-800 border-green-300' 
                                      : 'bg-yellow-100 text-yellow-800 border-yellow-300'
                                  }
                                >
                                  {consultation.paymentStatus?.charAt(0).toUpperCase() + consultation.paymentStatus?.slice(1) || 'Pending'}
                                </Badge>
                              </div>
                            </div>

                            {/* Reason and Notes */}
                            {(consultation.reason || consultation.notes) && (
                              <div className="space-y-2 pt-2 border-t">
                                {consultation.reason && (
                                  <div>
                                    <span className="text-gray-500 font-medium">Reason for visit:</span>
                                    <p className="text-sm text-gray-700 mt-1">{consultation.reason}</p>
                                  </div>
                                )}
                                {consultation.notes && (
                                  <div>
                                    <span className="text-gray-500 font-medium">Notes:</span>
                                    <p className="text-sm text-gray-700 mt-1">{consultation.notes}</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-col gap-2 ml-4">
                            <Button size="sm" className="bg-green-600 hover:bg-green-700 min-w-[120px]">
                              <Video className="w-4 h-4 mr-2" />
                              Video Call
                            </Button>
                            <Button size="sm" variant="outline" className="min-w-[120px]">
                              <Phone className="w-4 h-4 mr-2" />
                              Audio Call
                            </Button>
                            <Button size="sm" variant="outline" className="min-w-[120px]">
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Chat
                            </Button>
                            <Button size="sm" variant="secondary" className="min-w-[120px]">
                              <FileText className="w-4 h-4 mr-2" />
                              Notes
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No consultations scheduled</p>
                    <p className="text-sm text-gray-400 mt-2">Bookings will appear here automatically</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="prescriptions">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Digital Prescriptions</CardTitle>
                  <CardDescription>Create and manage patient prescriptions</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button onClick={fetchDoctorPrescriptions} variant="outline" disabled={prescriptionsLoading}>
                    <Activity className="w-4 h-4 mr-2" />
                    {prescriptionsLoading ? 'Loading...' : 'Refresh'}
                  </Button>
                  <Button 
                    onClick={() => setLocation("/prescriptions-form")}
                    className="bg-naija-green hover:bg-naija-green/90"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Create Prescription
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {prescriptionsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-8 h-8 animate-spin rounded-full border-2 border-naija-green border-t-transparent"></div>
                  </div>
                ) : doctorPrescriptions.length > 0 ? (
                  <div className="space-y-4">
                    {doctorPrescriptions.map((prescription: any, index) => (
                      <div key={index} className="p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">
                                Prescription #{prescription.id}
                              </Badge>
                              <span className="font-medium">{prescription.patient_name || prescription.patientName}</span>
                            </div>
                            <div className="text-sm text-gray-600">
                              <p><strong>Patient:</strong> {prescription.patient_name || prescription.patientName}</p>
                              {prescription.patient_id && <p><strong>Patient ID:</strong> {prescription.patient_id}</p>}
                              <p><strong>Date:</strong> {prescription.prescription_date || new Date(prescription.createdAt).toLocaleDateString()}</p>
                              <p><strong>Time:</strong> {prescription.prescription_time || 'Not specified'}</p>
                              <p><strong>Prescribed by:</strong> {prescription.doctor_name || '' + prescription.doctorName}</p>
                            </div>
                            <div className="mt-3">
                              <p className="text-sm font-medium text-gray-700 mb-2">Medications:</p>
                              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                {(prescription.medication || prescription.medications)?.split('\n').map((med: string, medIndex: number) => (
                                  <p key={medIndex} className="text-sm text-gray-800 mb-1">{med.trim()}</p>
                                ))}
                              </div>
                            </div>
                            {(prescription.additional_instructions || prescription.notes) && (
                              <div className="mt-3">
                                <p className="text-sm font-medium text-gray-700 mb-1">Additional Instructions:</p>
                                <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                                  <p className="text-sm text-gray-700 whitespace-pre-line">{prescription.additional_instructions || prescription.notes}</p>
                                </div>
                              </div>
                            )}
                            <div className="mt-2 text-xs text-gray-500">
                              Created: {new Date(prescription.createdAt).toLocaleString()}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 ml-4">
                            <Button size="sm" variant="outline">
                              <FileText className="w-4 h-4 mr-1" />
                              Print
                            </Button>
                            <Button size="sm" variant="outline">
                              <MessageSquare className="w-4 h-4 mr-1" />
                              Send
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No prescriptions created yet</p>
                    <p className="text-sm text-gray-400 mt-2">Click "Create Prescription" to get started</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages">
            <Card>
              <CardHeader>
                <CardTitle>Secure Messaging</CardTitle>
                <CardDescription>Communicate securely with patients</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Secure messaging system coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Schedule & Calendar</CardTitle>
                  <CardDescription>Manage your appointments and availability</CardDescription>
                </div>
                <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-naija-green hover:bg-naija-green/90">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Calendar
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Add Calendar Event</DialogTitle>
                      <DialogDescription>
                        Schedule a new appointment or block time
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="title" className="text-right">
                          Title
                        </Label>
                        <Input
                          id="title"
                          value={newEvent.title || ''}
                          onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                          className="col-span-3"
                          placeholder="Consultation with..."
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="date" className="text-right">
                          Date
                        </Label>
                        <Input
                          id="date"
                          type="date"
                          value={newEvent.date || ''}
                          onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="time" className="text-right">
                          Time
                        </Label>
                        <Input
                          id="time"
                          type="time"
                          value={newEvent.time || ''}
                          onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="duration" className="text-right">
                          Duration
                        </Label>
                        <Select value={newEvent.duration?.toString()} onValueChange={(value) => setNewEvent({...newEvent, duration: parseInt(value)})}>
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select duration" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="15">15 minutes</SelectItem>
                            <SelectItem value="30">30 minutes</SelectItem>
                            <SelectItem value="45">45 minutes</SelectItem>
                            <SelectItem value="60">60 minutes</SelectItem>
                            <SelectItem value="90">90 minutes</SelectItem>
                            <SelectItem value="120">120 minutes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="type" className="text-right">
                          Type
                        </Label>
                        <Select value={newEvent.type} onValueChange={(value) => setNewEvent({...newEvent, type: value as 'consultation' | 'break' | 'unavailable'})}>
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="consultation">Consultation</SelectItem>
                            <SelectItem value="break">Break</SelectItem>
                            <SelectItem value="unavailable">Unavailable</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="patient" className="text-right">
                          Patient
                        </Label>
                        <Input
                          id="patient"
                          value={newEvent.patientName || ''}
                          onChange={(e) => setNewEvent({...newEvent, patientName: e.target.value})}
                          className="col-span-3"
                          placeholder="Patient name (optional)"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="notes" className="text-right">
                          Notes
                        </Label>
                        <Textarea
                          id="notes"
                          value={newEvent.notes || ''}
                          onChange={(e) => setNewEvent({...newEvent, notes: e.target.value})}
                          className="col-span-3"
                          placeholder="Additional notes..."
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowEventDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddEvent} className="bg-naija-green hover:bg-naija-green/90">
                        Add Event
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Calendar Navigation */}
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateMonth('prev')}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <h3 className="text-lg font-semibold">
                      {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateMonth('next')}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {/* Day headers */}
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                        {day}
                      </div>
                    ))}
                    
                    {/* Empty cells for days before month starts */}
                    {Array.from({ length: getFirstDayOfMonth(currentDate) }).map((_, index) => (
                      <div key={`empty-${index}`} className="p-2"></div>
                    ))}
                    
                    {/* Calendar days */}
                    {Array.from({ length: getDaysInMonth(currentDate) }).map((_, index) => {
                      const day = index + 1;
                      const dateStr = formatDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
                      const events = getEventsForDate(dateStr);
                      const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
                      
                      return (
                        <div
                          key={day}
                          onClick={() => handleDateClick(day)}
                          className={`
                            p-2 text-center text-sm cursor-pointer border border-gray-200 hover:bg-gray-50 min-h-[60px] relative
                            ${isToday ? 'bg-naija-green text-white' : ''}
                            ${events.length > 0 ? 'border-naija-green' : ''}
                          `}
                        >
                          <div className="font-medium">{day}</div>
                          {events.length > 0 && (
                            <div className="absolute bottom-1 left-1 right-1">
                              {events.slice(0, 2).map((event, i) => (
                                <div
                                  key={event.id}
                                  className={`text-xs p-1 mb-1 rounded truncate ${
                                    event.type === 'consultation' ? 'bg-blue-100 text-blue-800' :
                                    event.type === 'break' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                  }`}
                                >
                                  {event.time} {event.title}
                                </div>
                              ))}
                              {events.length > 2 && (
                                <div className="text-xs text-gray-500">+{events.length - 2} more</div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Today's Schedule */}
                  <div className="mt-6">
                    <h4 className="text-md font-semibold mb-3 flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      Today's Schedule
                    </h4>
                    <div className="space-y-2">
                      {(() => {
                        const today = formatDate(new Date());
                        const todayEvents = getEventsForDate(today);
                        
                        if (todayEvents.length === 0) {
                          return (
                            <p className="text-gray-500 text-sm">No appointments scheduled for today</p>
                          );
                        }
                        
                        return todayEvents
                          .sort((a, b) => a.time.localeCompare(b.time))
                          .map(event => (
                            <div
                              key={event.id}
                              className={`
                                p-3 rounded-lg border-l-4 ${
                                  event.type === 'consultation' ? 'border-blue-500 bg-blue-50' :
                                  event.type === 'break' ? 'border-yellow-500 bg-yellow-50' :
                                  'border-red-500 bg-red-50'
                                }
                              `}
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium">{event.title}</p>
                                  <p className="text-sm text-gray-600">
                                    {event.time} - {event.duration} minutes
                                  </p>
                                  {event.patientName && (
                                    <p className="text-sm text-gray-600">Patient: {event.patientName}</p>
                                  )}
                                  {event.notes && (
                                    <p className="text-sm text-gray-500 mt-1">{event.notes}</p>
                                  )}
                                </div>
                                <Badge variant={event.type === 'consultation' ? 'default' : 'secondary'}>
                                  {event.type}
                                </Badge>
                              </div>
                            </div>
                          ));
                      })()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wallet">
            <Card>
              <CardHeader>
                <CardTitle>Payments & Wallet</CardTitle>
                <CardDescription>Track earnings and manage payments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="text-sm font-medium text-green-800">Current Balance</p>
                      <p className="text-2xl font-bold text-green-900">₦{doctor.walletBalance?.toLocaleString() || 0}</p>
                      <div className="mt-3">
                        <Button 
                          onClick={() => setShowWithdrawDialog(true)}
                          disabled={!doctor.walletBalance || doctor.walletBalance <= 0}
                          className="w-full bg-green-600 hover:bg-green-700"
                        >
                          <DollarSign className="w-4 h-4 mr-2" />
                          Withdraw Funds
                        </Button>
                      </div>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-blue-800">Total Earnings</p>
                      <p className="text-2xl font-bold text-blue-900">₦{doctor.totalEarnings?.toLocaleString() || 0}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-medium text-gray-900 mb-3">Recent Withdrawals</h3>
                      {withdrawals.length > 0 ? (
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {withdrawals.slice(0, 5).map((withdrawal) => (
                            <div key={withdrawal.id} className="flex justify-between items-center p-2 bg-white rounded border text-sm">
                              <div>
                                <span className="font-medium">₦{withdrawal.amount?.toLocaleString()}</span>
                                <p className="text-xs text-gray-500">{withdrawal.bankName}</p>
                              </div>
                              <div className="text-right">
                                <Badge 
                                  variant={
                                    withdrawal.status === 'completed' ? 'default' : 
                                    withdrawal.status === 'processing' ? 'secondary' : 
                                    withdrawal.status === 'failed' ? 'destructive' : 'outline'
                                  }
                                  className="text-xs"
                                >
                                  {withdrawal.status}
                                </Badge>
                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(withdrawal.requestedAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <Wallet className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">No withdrawals yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="withdrawals">
            <Card>
              <CardHeader>
                <CardTitle>Withdrawal History</CardTitle>
                <CardDescription>Track your withdrawal requests and statuses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">All Withdrawals</h3>
                    <Button 
                      onClick={() => setShowWithdrawDialog(true)}
                      disabled={!doctor.walletBalance || doctor.walletBalance <= 0}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <DollarSign className="w-4 h-4 mr-2" />
                      New Withdrawal
                    </Button>
                  </div>
                  
                  {withdrawalsLoading ? (
                    <div className="flex justify-center py-8">
                      <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
                    </div>
                  ) : withdrawals.length > 0 ? (
                    <div className="space-y-3">
                      {withdrawals.map((withdrawal) => (
                        <div key={withdrawal.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-semibold">₦{withdrawal.amount?.toLocaleString()}</span>
                                <Badge 
                                  variant={
                                    withdrawal.status === 'completed' ? 'default' : 
                                    withdrawal.status === 'processing' ? 'secondary' : 
                                    withdrawal.status === 'failed' ? 'destructive' : 'outline'
                                  }
                                >
                                  {withdrawal.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600">
                                {withdrawal.bankName} - {withdrawal.accountNumber}
                              </p>
                              <p className="text-sm text-gray-600">
                                Account: {withdrawal.accountName}
                              </p>
                              <p className="text-xs text-gray-500">
                                Requested: {new Date(withdrawal.requestedAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                              {withdrawal.processedAt && (
                                <p className="text-xs text-gray-500">
                                  Processed: {new Date(withdrawal.processedAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </p>
                              )}
                              {withdrawal.notes && (
                                <p className="text-sm text-gray-600 mt-2">
                                  Notes: {withdrawal.notes}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No withdrawals yet</h3>
                      <p className="text-gray-500 mb-4">You haven't made any withdrawal requests</p>
                      <Button 
                        onClick={() => setShowWithdrawDialog(true)}
                        disabled={!doctor.walletBalance || doctor.walletBalance <= 0}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <DollarSign className="w-4 h-4 mr-2" />
                        Make Your First Withdrawal
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Analytics & Reports</CardTitle>
                <CardDescription>View your performance metrics and insights</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Analytics dashboard coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Withdrawal Dialog */}
        <Dialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                Withdraw Funds
              </DialogTitle>
              <DialogDescription>
                Request withdrawal to your Nigerian bank account. Processing typically takes 1-3 business days.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm font-medium text-green-800">Available Balance</p>
                <p className="text-2xl font-bold text-green-900">₦{doctor?.walletBalance?.toLocaleString() || 0}</p>
              </div>
              
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="amount">Withdrawal Amount (₦)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount to withdraw"
                    value={withdrawForm.amount}
                    onChange={(e) => setWithdrawForm({...withdrawForm, amount: e.target.value})}
                    max={doctor?.walletBalance || 0}
                  />
                </div>
                
                <div>
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Select 
                    value={withdrawForm.bankName} 
                    onValueChange={(value) => setWithdrawForm({...withdrawForm, bankName: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your bank" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Access Bank">Access Bank</SelectItem>
                      <SelectItem value="Zenith Bank">Zenith Bank</SelectItem>
                      <SelectItem value="GTBank">GTBank</SelectItem>
                      <SelectItem value="First Bank">First Bank</SelectItem>
                      <SelectItem value="UBA">UBA</SelectItem>
                      <SelectItem value="Fidelity Bank">Fidelity Bank</SelectItem>
                      <SelectItem value="Sterling Bank">Sterling Bank</SelectItem>
                      <SelectItem value="FCMB">FCMB</SelectItem>
                      <SelectItem value="Union Bank">Union Bank</SelectItem>
                      <SelectItem value="Ecobank">Ecobank</SelectItem>
                      <SelectItem value="Heritage Bank">Heritage Bank</SelectItem>
                      <SelectItem value="Keystone Bank">Keystone Bank</SelectItem>
                      <SelectItem value="Polaris Bank">Polaris Bank</SelectItem>
                      <SelectItem value="Stanbic IBTC">Stanbic IBTC</SelectItem>
                      <SelectItem value="Unity Bank">Unity Bank</SelectItem>
                      <SelectItem value="Wema Bank">Wema Bank</SelectItem>
                      <SelectItem value="Kuda Bank">Kuda Bank</SelectItem>
                      <SelectItem value="Opay">Opay</SelectItem>
                      <SelectItem value="PalmPay">PalmPay</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    type="text"
                    placeholder="Enter your account number"
                    value={withdrawForm.accountNumber}
                    onChange={(e) => setWithdrawForm({...withdrawForm, accountNumber: e.target.value})}
                    maxLength={10}
                  />
                </div>
                
                <div>
                  <Label htmlFor="accountName">Account Name</Label>
                  <Input
                    id="accountName"
                    type="text"
                    placeholder="Enter account holder name"
                    value={withdrawForm.accountName}
                    onChange={(e) => setWithdrawForm({...withdrawForm, accountName: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowWithdrawDialog(false)}
                  disabled={withdrawLoading}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleWithdrawal}
                  disabled={withdrawLoading || !withdrawForm.amount || !withdrawForm.bankName || !withdrawForm.accountNumber || !withdrawForm.accountName}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {withdrawLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <DollarSign className="w-4 h-4 mr-2" />
                      Request Withdrawal
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}