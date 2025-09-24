import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { 
  Users, 
  UserCheck, 
  CreditCard, 
  Calendar, 
  Database,
  LogOut,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  Download,
  Eye,
  Phone,
  Mail,
  MapPin,
  Wallet,
  Activity,
  User as UserIcon,
  FileText
} from 'lucide-react';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  tel?: string;
  wallet: number;
  createdAt: string;
}

interface DetailedUser extends User {
  username?: string;
  middleName?: string;
  sex?: string;
  age?: string;
  city?: string;
  location?: string;
  bloodGroup?: string;
  whatsappNumber?: string;
  address?: string;
  totalReferrals?: number;
  referralCode?: string;
  healthReadingsCount?: number;
  foodAnalysesCount?: number;
  fitnessGoalsCount?: number;
}

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  email?: string;
  phone?: string;
  location: string;
  hospital?: string;
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
  description?: string;
  createdAt: string;
  userName?: string;
  userEmail?: string;
  userReferralId?: string;
  formattedDate?: string;
  formattedTime?: string;
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
  reason: string;
  status: string;
  priority: string;
  appointmentType: string;
  location?: string;
  fees?: number;
  status?: string;
  createdAt: string;
}

interface Subscription {
  id: number;
  userId: number;
  subscriptionType: string;
  amount: number;
  paymentReference?: string;
  status: string;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  isActive: boolean;
  planName: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  userReferralId?: string;
  formattedDate?: string;
  formattedTime?: string;
}

interface TrainerBooking {
  id: number;
  userId: number;
  trainerId: number;
  serviceType: string;
  amount: number;
  status: string;
  paymentReference?: string;
  sessionDate?: string;
  sessionTime?: string;
  status: string;
  notes?: string;
  createdAt: string;
  userName?: string;
  userEmail?: string;
  trainerName?: string;
  trainerEmail?: string;
}

interface PublicBooking {
  id: number;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  sex: string;
  location: string;
  doctorId: number;
  message?: string;
  status: string;
  createdAt: string;
  doctorName?: string;
  doctorSpecialty?: string;
  doctorEmail?: string;
  doctorPhone?: string;
}

interface Prescription {
  id: number;
  userId?: number;
  doctorName: string;
  doctorEmail: string;
  patientName: string;
  patientId: string;
  prescriptionDate: string;
  prescriptionTime: string;
  medication: string;
  additionalInstructions?: string;
  createdAt: string;
}

interface UserSession {
  id: number;
  referralId: string;
  page: string;
  loginTime: string;
  formattedTime: string;
  ipAddress?: string;
  userAgent?: string;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [trainerBookings, setTrainerBookings] = useState<TrainerBooking[]>([]);
  const [publicBookings, setPublicBookings] = useState<PublicBooking[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [externalUsersCount, setExternalUsersCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState<DetailedUser | null>(null);
  const [isUserDetailsOpen, setIsUserDetailsOpen] = useState(false);
  const [userDetailsLoading, setUserDetailsLoading] = useState(false);
  
  // Import users state
  const [importLoading, setImportLoading] = useState(false);
  const [importResults, setImportResults] = useState<{
    success: boolean;
    message: string;
    importedCount: number;
    duplicateCount: number;
    errorCount: number;
    totalProcessed: number;
    errors?: string[];
  } | null>(null);
  
  // Import relevant users state
  const [importRelevantLoading, setImportRelevantLoading] = useState(false);
  const [importRelevantResults, setImportRelevantResults] = useState<{
    success: boolean;
    message: string;
    importedCount: number;
    duplicateCount: number;
    errorCount: number;
    totalProcessed: number;
    totalUsers: number;
    filteredOut: number;
    processingTime: string;
    errors?: string[];
    dataSource?: string;
  } | null>(null);
  
  // Sessions pagination state
  const [currentSessionsPage, setCurrentSessionsPage] = useState(1);
  const sessionsPerPage = 200;

  // Check admin authentication
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      setLocation('/admin');
      return;
    }
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const [usersRes, doctorsRes, paymentsRes, appointmentsRes, subscriptionsRes, trainerBookingsRes, publicBookingsRes, prescriptionsRes, sessionsRes, externalRes] = await Promise.all([
        fetch('/api/admin/users', { headers }),
        fetch('/api/admin/doctors', { headers }),
        fetch('/api/admin/payments', { headers }),
        fetch('/api/admin/appointments', { headers }),
        fetch('/api/admin/subscriptions', { headers }),
        fetch('/api/admin/trainer-bookings', { headers }),
        fetch('/api/admin/public-bookings', { headers }),
        fetch('/api/admin/prescriptions', { headers }),
        fetch('/api/admin/sessions', { headers }),
        fetch('https://presibo-wl.vercel.app/database.json')
      ]);

      const [usersData, doctorsData, paymentsData, appointmentsData, subscriptionsData, trainerBookingsData, publicBookingsData, prescriptionsData, sessionsData, externalData] = await Promise.all([
        usersRes.json(),
        doctorsRes.json(),
        paymentsRes.json(),
        appointmentsRes.json(),
        subscriptionsRes.json(),
        trainerBookingsRes.json(),
        publicBookingsRes.json(),
        prescriptionsRes.json(),
        sessionsRes.json(),
        externalRes.ok ? externalRes.json() : { users: [] }
      ]);

      setUsers(usersData);
      setDoctors(doctorsData);
      setPayments(paymentsData);
      setAppointments(appointmentsData);
      setSubscriptions(subscriptionsData);
      setTrainerBookings(trainerBookingsData);
      setPublicBookings(publicBookingsData);
      setPrescriptions(prescriptionsData);
      setSessions(sessionsData);
      setExternalUsersCount(externalData.users?.length || 0);
    } catch (error) {
      toast({
        title: "Error loading data",
        description: "Failed to load admin data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setLocation('/admin');
  };

  const handleUserClick = async (userId: number) => {
    setUserDetailsLoading(true);
    setIsUserDetailsOpen(true);
    
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/users/${userId}/details`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const userDetails = await response.json();
        setSelectedUser(userDetails);
      } else {
        toast({
          title: "Error",
          description: "Failed to load user details",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load user details",
        variant: "destructive"
      });
    } finally {
      setUserDetailsLoading(false);
    }
  };

  const confirmPayment = async (paymentId: number) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/payments/${paymentId}/confirm`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast({
          title: "Payment confirmed",
          description: "Payment status updated successfully"
        });
        loadAllData(); // Reload data
      } else {
        throw new Error('Failed to confirm payment');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to confirm payment",
        variant: "destructive"
      });
    }
  };

  const confirmAppointment = async (appointmentId: number) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/appointments/${appointmentId}/confirm`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast({
          title: "Appointment confirmed",
          description: "Appointment status updated successfully"
        });
        loadAllData(); // Reload data
      } else {
        throw new Error('Failed to confirm appointment');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to confirm appointment",
        variant: "destructive"
      });
    }
  };

  const confirmTrainerBooking = async (bookingId: number) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/trainer-bookings/${bookingId}/confirm`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast({
          title: "Trainer booking confirmed",
          description: "Trainer booking status updated successfully"
        });
        loadAllData(); // Reload data
      } else {
        throw new Error('Failed to confirm trainer booking');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to confirm trainer booking",
        variant: "destructive"
      });
    }
  };

  const confirmPublicBooking = async (bookingId: number) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/public-bookings/${bookingId}/confirm`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast({
          title: "Doctor booking confirmed",
          description: "Doctor booking status updated successfully"
        });
        loadAllData(); // Reload data
      } else {
        throw new Error('Failed to confirm doctor booking');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to confirm doctor booking",
        variant: "destructive"
      });
    }
  };

  const importExternalData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/import-data', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Data import completed",
          description: `Imported: ${result.imported.users} users, ${result.imported.doctors} doctors, ${result.imported.trainers} trainers`
        });
        loadAllData(); // Reload all data
      } else {
        throw new Error('Failed to import data');
      }
    } catch (error) {
      toast({
        title: "Import Error",
        description: "Failed to import external data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const importUsers = async () => {
    setImportLoading(true);
    setImportResults(null);
    
    try {
      const token = localStorage.getItem('adminToken');
      
      // Show initial progress
      toast({
        title: "Import started",
        description: "Connecting to external API to import users...",
        variant: "default"
      });
      
      const response = await fetch('/api/admin/import-users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        result = {
          success: false,
          message: 'Server returned invalid response format',
          importedCount: 0,
          duplicateCount: 0,
          errorCount: 0,
          totalProcessed: 0,
          errors: ['Invalid JSON response from server']
        };
      }
      
      if (response.ok && result.success) {
        setImportResults(result);
        const successMessage = result.errorCount > 0 
          ? `Imported ${result.importedCount} users, ${result.duplicateCount} duplicates skipped, ${result.errorCount} errors occurred`
          : `Successfully imported ${result.importedCount} users. ${result.duplicateCount} duplicates skipped.`;
        
        toast({
          title: "Import completed",
          description: successMessage,
          variant: result.errorCount > 0 ? "default" : "default"
        });
        loadAllData(); // Reload all data to show new users
      } else {
        setImportResults(result);
        
        // Provide specific error messages based on error type
        let errorTitle = "Import failed";
        let errorDescription = result.message || 'Failed to import users';
        
        if (result.message?.includes('unable to connect') || result.message?.includes('unreachable')) {
          errorTitle = "Connection Error";
          errorDescription = "Unable to connect to the external API. The API might be down or blocked by network restrictions.";
        } else if (result.message?.includes('timeout')) {
          errorTitle = "Request Timeout";
          errorDescription = "The external API is taking too long to respond. Please try again later.";
        } else if (result.message?.includes('non-JSON') || result.message?.includes('HTML')) {
          errorTitle = "API Format Error";
          errorDescription = "The external API returned an error page instead of data. This usually means the API is temporarily down.";
        } else if (result.message?.includes('status:')) {
          errorTitle = "API Error";
          errorDescription = `The external API returned an error: ${result.message}`;
        } else if (result.message?.includes('No users table')) {
          errorTitle = "Data Structure Error";
          errorDescription = "The external API response doesn't contain user data in the expected format.";
        }
        
        toast({
          title: errorTitle,
          description: errorDescription,
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Import users error:', error);
      
      let errorMessage = 'An unexpected error occurred';
      let errorTitle = 'Import Error';
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorTitle = 'Network Error';
        errorMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
      } else if (error.name === 'AbortError') {
        errorTitle = 'Request Cancelled';
        errorMessage = 'The import request was cancelled or timed out.';
      } else {
        errorMessage = `Network error: ${error.message}`;
      }
      
      const errorResult = {
        success: false,
        message: errorMessage,
        importedCount: 0,
        duplicateCount: 0,
        errorCount: 1,
        totalProcessed: 0,
        errors: [error.message]
      };
      
      setImportResults(errorResult);
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setImportLoading(false);
    }
  };

  const importRelevantUsers = async () => {
    setImportRelevantLoading(true);
    setImportRelevantResults(null);
    
    try {
      const token = localStorage.getItem('adminToken');
      
      // Show initial progress
      toast({
        title: "Relevant Import started",
        description: "Fetching and filtering users with valid emails from https://api.presibo.com/app.json...",
        variant: "default"
      });
      
      const response = await fetch('/api/admin/import-relevant-users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        result = {
          success: false,
          message: 'Server returned invalid response format',
          importedCount: 0,
          duplicateCount: 0,
          errorCount: 0,
          totalProcessed: 0,
          totalUsers: 0,
          filteredOut: 0,
          processingTime: '0 seconds',
          errors: ['Invalid JSON response from server']
        };
      }
      
      if (response.ok && result.success) {
        setImportRelevantResults(result);
        
        const successMessage = result.errorCount > 0 
          ? `Imported ${result.importedCount} relevant users (${result.duplicateCount} duplicates, ${result.errorCount} errors) in ${result.processingTime}`
          : `Successfully imported ${result.importedCount} relevant users with valid emails in ${result.processingTime}. ${result.duplicateCount} duplicates skipped.`;
        
        toast({
          title: "Relevant Import completed",
          description: successMessage,
          variant: result.errorCount > 0 ? "default" : "default"
        });
        loadAllData(); // Reload all data to show new users
      } else {
        setImportRelevantResults(result);
        
        // Provide specific error messages
        let errorTitle = "Relevant Import failed";
        let errorDescription = result.message || 'Failed to import relevant users';
        
        if (result.message?.includes('unable to connect') || result.message?.includes('unreachable')) {
          errorTitle = "API Connection Error";
          errorDescription = "Unable to connect to https://api.presibo.com/app.json. The API might be down or blocked.";
        } else if (result.message?.includes('timeout')) {
          errorTitle = "Request Timeout";
          errorDescription = "The API request timed out. Please try again later.";
        } else if (result.message?.includes('status:')) {
          errorTitle = "API Error";
          errorDescription = `The API returned an error: ${result.message}`;
        }
        
        toast({
          title: errorTitle,
          description: errorDescription,
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Import relevant users error:', error);
      
      let errorMessage = 'An unexpected error occurred';
      let errorTitle = 'Relevant Import Error';
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorTitle = 'Network Error';
        errorMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
      } else {
        errorMessage = `Network error: ${error.message}`;
      }
      
      const errorResult = {
        success: false,
        message: errorMessage,
        importedCount: 0,
        duplicateCount: 0,
        errorCount: 1,
        totalProcessed: 0,
        totalUsers: 0,
        filteredOut: 0,
        processingTime: '0 seconds',
        errors: [error.message]
      };
      
      setImportRelevantResults(errorResult);
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setImportRelevantLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      'completed': 'bg-green-100 text-green-800',
      'confirmed': 'bg-green-100 text-green-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'cancelled': 'bg-red-100 text-red-800',
      'failed': 'bg-red-100 text-red-800',
      'active': 'bg-blue-100 text-blue-800',
      'inactive': 'bg-gray-100 text-gray-800'
    };
    
    return (
      <Badge className={statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    );
  };

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

  const filteredPayments = payments.filter(payment =>
    payment.paymentReference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.userEmail?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSubscriptions = subscriptions.filter(subscription =>
    subscription.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subscription.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subscription.subscriptionType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subscription.planName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subscription.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
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
              <Shield className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Presibo Admin Dashboard</h1>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={importUsers} disabled={importLoading || loading} variant="default" data-testid="button-import-users">
                <Database className="w-4 h-4 mr-2" />
                {importLoading ? 'Importing...' : 'Import Users'}
              </Button>
              <Button onClick={importRelevantUsers} disabled={importRelevantLoading || loading} variant="default" data-testid="button-import-relevant-users">
                <UserCheck className="w-4 h-4 mr-2" />
                {importRelevantLoading ? 'Importing...' : 'Import Relevant Users'}
              </Button>
              <Button onClick={importExternalData} disabled={loading} variant="default">
                <Download className="w-4 h-4 mr-2" />
                Import Data
              </Button>
              <Button onClick={handleLogout} variant="outline">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{users.length + externalUsersCount}</p>
                  <p className="text-xs text-gray-500">+{externalUsersCount} from external database</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <UserCheck className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Doctors</p>
                  <p className="text-2xl font-bold text-gray-900">{doctors.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CreditCard className="w-8 h-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Payments</p>
                  <p className="text-2xl font-bold text-gray-900">{payments.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Appointments</p>
                  <p className="text-2xl font-bold text-gray-900">{appointments.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Database className="w-8 h-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Trainer Bookings</p>
                  <p className="text-2xl font-bold text-gray-900">{trainerBookings.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-pink-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Doctor Bookings</p>
                  <p className="text-2xl font-bold text-gray-900">{publicBookings.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="w-8 h-8 text-indigo-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Prescriptions</p>
                  <p className="text-2xl font-bold text-gray-900">{prescriptions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <UserCheck className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Subscriptions</p>
                  <p className="text-2xl font-bold text-gray-900">{subscriptions.filter(s => s.isActive).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Import Results */}
        {importResults && (
          <Card className="mb-6" data-testid="import-results">
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${
                importResults.success ? 'text-green-600' : 'text-red-600'
              }`}>
                {importResults.success ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <XCircle className="w-5 h-5" />
                )}
                Import Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Imported</p>
                  <p className="text-2xl font-bold text-green-600" data-testid="text-imported-count">
                    {importResults.importedCount}
                  </p>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-gray-600">Duplicates</p>
                  <p className="text-2xl font-bold text-yellow-600" data-testid="text-duplicate-count">
                    {importResults.duplicateCount}
                  </p>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <p className="text-sm text-gray-600">Errors</p>
                  <p className="text-2xl font-bold text-red-600" data-testid="text-error-count">
                    {importResults.errorCount}
                  </p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Total Processed</p>
                  <p className="text-2xl font-bold text-blue-600" data-testid="text-total-processed">
                    {importResults.totalProcessed}
                  </p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-3" data-testid="text-import-message">
                {importResults.message}
              </p>
              
              {importResults.errors && importResults.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-medium text-red-800 mb-2">Errors ({importResults.errors.length}):</h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    {importResults.errors.map((error, index) => (
                      <li key={index} className="list-disc list-inside">{error}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="mt-4">
                <Button 
                  onClick={() => setImportResults(null)} 
                  variant="outline" 
                  size="sm"
                  data-testid="button-close-results"
                >
                  Close Results
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search users, doctors, payments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-9">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="doctors">Doctors</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            <TabsTrigger value="trainer-bookings">Trainer Bookings</TabsTrigger>
            <TabsTrigger value="doctor-bookings">Doctor Bookings</TabsTrigger>
            <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Users Management</CardTitle>
                <CardDescription>Manage all registered users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors" onClick={() => handleUserClick(user.id)}>
                      <div className="flex-1">
                        <h3 className="font-medium">{user.firstName} {user.lastName}</h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <p className="text-sm text-gray-500">Phone: {user.tel || 'N/A'}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <p className="font-medium text-green-600">₦{user.wallet?.toLocaleString() || '0'}</p>
                          <p className="text-sm text-gray-500">Wallet Balance</p>
                        </div>
                        <Eye className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="doctors" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Doctors Management</CardTitle>
                <CardDescription>Manage all doctors in the system</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredDoctors.map((doctor) => (
                    <div key={doctor.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium">{doctor.name}</h3>
                        <p className="text-sm text-gray-600">{doctor.specialty}</p>
                        <p className="text-sm text-gray-500">{doctor.location}</p>
                        <p className="text-sm text-gray-500">{doctor.hospital || 'N/A'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">{doctor.email || 'N/A'}</p>
                        <p className="text-sm text-gray-500">{doctor.phone || 'N/A'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Payments Management</CardTitle>
                <CardDescription>Track and confirm payments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredPayments.map((payment) => (
                    <div key={payment.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                ₦{payment.amount?.toLocaleString() || 0}
                              </h3>
                              <p className="text-sm text-gray-600">{payment.description || 'Wallet Top-up'}</p>
                            </div>
                            <div className="text-sm text-gray-500">→</div>
                            <div>
                              <h4 className="text-md font-medium text-gray-800">
                                {payment.userName || `User ${payment.userId}`}
                              </h4>
                              <p className="text-sm text-gray-600">
                                📧 {payment.userEmail || 'No email'}
                              </p>
                              <p className="text-sm text-gray-600">
                                📱 {payment.userPhone || 'No phone'}
                              </p>
                              {payment.userReferralId && (
                                <div className="mt-1">
                                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                                    {payment.userReferralId}
                                  </Badge>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="mt-3 flex items-center space-x-4 text-sm text-gray-500">
                            <span>Payment ID: {payment.id}</span>
                            {payment.paymentReference && (
                              <span>Ref: {payment.paymentReference}</span>
                            )}
                            <span>
                              📅 {payment.formattedDate || new Date(payment.createdAt).toLocaleDateString()}
                            </span>
                            <span>
                              🕐 {payment.formattedTime || new Date(payment.createdAt).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          {getStatusBadge(payment.status)}
                          {payment.status === 'pending' && (
                            <Button size="sm" onClick={() => confirmPayment(payment.id)}>
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Confirm
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {filteredPayments.length === 0 && (
                    <div className="text-center py-8">
                      <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No payments found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appointments" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Appointments Management</CardTitle>
                <CardDescription>Manage and confirm appointments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium text-lg">{appointment.userName || 'Unknown Patient'}</h3>
                        <div className="space-y-1 mt-2">
                          <p className="text-sm text-gray-600">
                            📧 {appointment.userEmail}
                          </p>
                          {appointment.userPhone && (
                            <p className="text-sm text-gray-600">
                              📞 {appointment.userPhone}
                            </p>
                          )}
                          <p className="text-sm text-gray-700 font-medium">
                            Doctor: {appointment.doctorName} ({appointment.doctorSpecialty})
                          </p>
                          <p className="text-sm text-gray-500">
                            📅 {appointment.appointmentDate} at {appointment.appointmentTime}
                          </p>
                          <p className="text-sm text-gray-500">
                            Reason: {appointment.reason}
                          </p>
                          {appointment.location && (
                            <p className="text-sm text-gray-500">
                              📍 {appointment.location}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {getStatusBadge(appointment.status)}
                        {appointment.status === 'pending' && (
                          <Button size="sm" onClick={() => confirmAppointment(appointment.id)}>
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Confirm
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscriptions" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>All Subscriptions</CardTitle>
                <CardDescription>Comprehensive subscription tracking for all plans</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredSubscriptions.map((subscription) => (
                    <div key={subscription.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                ₦{subscription.amount?.toLocaleString() || 0}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {subscription.planName || subscription.subscriptionType}
                              </p>
                              <div className="mt-1">
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                                  {subscription.subscriptionType}
                                </Badge>
                              </div>
                            </div>
                            <div className="text-sm text-gray-500">→</div>
                            <div>
                              <h4 className="text-md font-medium text-gray-800">
                                {subscription.userName || `User ${subscription.userId}`}
                              </h4>
                              <p className="text-sm text-gray-600">
                                📧 {subscription.userEmail || 'No email'}
                              </p>
                              <p className="text-sm text-gray-600">
                                📱 {subscription.userPhone || 'No phone'}
                              </p>
                              {subscription.userReferralId && (
                                <div className="mt-1">
                                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                                    {subscription.userReferralId}
                                  </Badge>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="mt-3 flex items-center space-x-4 text-sm text-gray-500">
                            <span>ID: {subscription.id}</span>
                            {subscription.paymentReference && (
                              <span>Ref: {subscription.paymentReference}</span>
                            )}
                            <span>
                              📅 Start: {subscription.formattedDate || new Date(subscription.startDate).toLocaleDateString()}
                            </span>
                            <span>
                              🕐 {subscription.formattedTime || new Date(subscription.createdAt).toLocaleTimeString()}
                            </span>
                            <span>
                              📅 End: {new Date(subscription.endDate).toLocaleDateString()}
                            </span>
                            {subscription.autoRenew && (
                              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
                                Auto-Renew
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          {getStatusBadge(subscription.status)}
                          {subscription.isActive && (
                            <Badge className="bg-green-100 text-green-800">Active</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {filteredSubscriptions.length === 0 && (
                    <div className="text-center py-8">
                      <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No subscriptions found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trainer Bookings Tab */}
          <TabsContent value="trainer-bookings">
            <Card>
              <CardHeader>
                <CardTitle>Trainer Bookings Management</CardTitle>
                <p className="text-sm text-gray-600">Manage trainer booking confirmations and payment status</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trainerBookings.filter(booking => 
                    booking.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    booking.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    booking.trainerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    booking.serviceType?.toLowerCase().includes(searchTerm.toLowerCase())
                  ).map((booking) => (
                    <div key={booking.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {booking.userName || `User ${booking.userId}`}
                              </h3>
                              <p className="text-sm text-gray-600">{booking.userEmail || 'No email'}</p>
                            </div>
                            <div className="text-sm text-gray-500">→</div>
                            <div>
                              <h4 className="text-md font-medium text-gray-800">
                                {booking.trainerName || `Trainer ${booking.trainerId}`}
                              </h4>
                              <p className="text-sm text-gray-600">{booking.trainerEmail || 'No email'}</p>
                            </div>
                          </div>
                          <div className="mt-2 flex items-center space-x-4">
                            <span className="text-sm font-medium text-blue-600">
                              Service: {booking.serviceType}
                            </span>
                            <span className="text-sm font-medium text-green-600">
                              Amount: ₦{booking.amount?.toLocaleString() || 0}
                            </span>
                            {booking.sessionDate && (
                              <span className="text-sm text-gray-600">
                                Date: {new Date(booking.sessionDate).toLocaleDateString()}
                              </span>
                            )}
                            {booking.sessionTime && (
                              <span className="text-sm text-gray-600">
                                Time: {booking.sessionTime}
                              </span>
                            )}
                          </div>
                          <div className="mt-2 text-xs text-gray-500">
                            Booking ID: {booking.id} | Created: {new Date(booking.createdAt).toLocaleString()}
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          {getStatusBadge(booking.status)}
                          {booking.status === 'confirmed' ? (
                            <Badge className="bg-green-100 text-green-800">Confirmed</Badge>
                          ) : (
                            <Button 
                              onClick={() => confirmTrainerBooking(booking.id)}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Confirm
                            </Button>
                          )}
                        </div>
                      </div>
                      {booking.notes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded">
                          <p className="text-sm text-gray-700">
                            <strong>Notes:</strong> {booking.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                  {trainerBookings.filter(booking => 
                    booking.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    booking.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    booking.trainerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    booking.serviceType?.toLowerCase().includes(searchTerm.toLowerCase())
                  ).length === 0 && (
                    <div className="text-center py-8">
                      <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No trainer bookings found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Doctor Bookings Tab */}
          <TabsContent value="doctor-bookings">
            <Card>
              <CardHeader>
                <CardTitle>Doctor Bookings Management</CardTitle>
                <p className="text-sm text-gray-600">Manage doctor booking confirmations from the /book page</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {publicBookings.filter(booking => 
                    booking.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    booking.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    booking.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    booking.doctorSpecialty?.toLowerCase().includes(searchTerm.toLowerCase())
                  ).map((booking) => (
                    <div key={booking.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {booking.name}
                              </h3>
                              <p className="text-sm text-gray-600">{booking.email}</p>
                              <p className="text-sm text-gray-600">{booking.phone}</p>
                            </div>
                            <div className="text-sm text-gray-500">→</div>
                            <div>
                              <h4 className="text-md font-medium text-gray-800">
                                {booking.doctorName || `Doctor ${booking.doctorId}`}
                              </h4>
                              <p className="text-sm text-gray-600">{booking.doctorSpecialty || 'N/A'}</p>
                              <p className="text-sm text-gray-600">{booking.doctorEmail || 'No email'}</p>
                            </div>
                          </div>
                          <div className="mt-2 flex items-center space-x-4">
                            <span className="text-sm font-medium text-blue-600">
                              Patient Info: {booking.sex}, DOB: {new Date(booking.dateOfBirth).toLocaleDateString()}
                            </span>
                            <span className="text-sm text-gray-600">
                              Location: {booking.location}
                            </span>
                          </div>
                          <div className="mt-2 text-xs text-gray-500">
                            Booking ID: {booking.id} | Created: {new Date(booking.createdAt).toLocaleString()}
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          {booking.status === 'confirmed' ? (
                            <Badge className="bg-green-100 text-green-800">Confirmed</Badge>
                          ) : (
                            <Button 
                              onClick={() => confirmPublicBooking(booking.id)}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Confirm
                            </Button>
                          )}
                        </div>
                      </div>
                      {booking.message && (
                        <div className="mt-3 p-3 bg-gray-50 rounded">
                          <p className="text-sm text-gray-700">
                            <strong>Message:</strong> {booking.message}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                  {publicBookings.filter(booking => 
                    booking.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    booking.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    booking.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    booking.doctorSpecialty?.toLowerCase().includes(searchTerm.toLowerCase())
                  ).length === 0 && (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No doctor bookings found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="prescriptions" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Prescriptions Management</CardTitle>
                <CardDescription>View all medical prescriptions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {prescriptions.length > 0 ? (
                    prescriptions.map((prescription) => (
                      <div key={prescription.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div>
                            <h3 className="font-medium text-gray-900">Patient Information</h3>
                            <p className="text-sm text-gray-600">Name: {prescription.patientName}</p>
                            <p className="text-sm text-gray-600">Patient ID: {prescription.patientId}</p>
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">Doctor Information</h3>
                            <p className="text-sm text-gray-600">Name: {prescription.doctorName}</p>
                            <p className="text-sm text-gray-600">Email: {prescription.doctorEmail}</p>
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">Prescription Details</h3>
                            <p className="text-sm text-gray-600">Date: {prescription.prescriptionDate}</p>
                            <p className="text-sm text-gray-600">Time: {prescription.prescriptionTime}</p>
                          </div>
                        </div>
                        <div className="mt-4">
                          <h3 className="font-medium text-gray-900 mb-2">Medication</h3>
                          <p className="text-sm text-gray-700 bg-white p-3 rounded border">{prescription.medication}</p>
                        </div>
                        {prescription.additionalInstructions && (
                          <div className="mt-4">
                            <h3 className="font-medium text-gray-900 mb-2">Additional Instructions</h3>
                            <p className="text-sm text-gray-700 bg-white p-3 rounded border whitespace-pre-line">{prescription.additionalInstructions}</p>
                          </div>
                        )}
                        <div className="mt-4 flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            Created: {new Date(prescription.createdAt).toLocaleDateString()}
                          </span>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            <FileText className="w-3 h-3 mr-1" />
                            Prescription #{prescription.id}
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No prescriptions found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sessions" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>User Sessions Tracking</CardTitle>
                <CardDescription>Monitor user activity and page visits</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sessions.length > 0 ? (
                    <>
                      {/* Sessions List */}
                      {sessions
                        .slice((currentSessionsPage - 1) * sessionsPerPage, currentSessionsPage * sessionsPerPage)
                        .map((session) => (
                          <div key={session.id} className="p-4 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3">
                                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                    {session.referralId}
                                  </Badge>
                                  <span className="font-medium text-gray-900">{session.page}</span>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">{session.formattedTime}</p>
                                {session.ipAddress && (
                                  <p className="text-xs text-gray-500 mt-1">IP: {session.ipAddress}</p>
                                )}
                              </div>
                              <div className="text-right">
                                <Badge variant="secondary" className="text-xs">
                                  Session #{session.id}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      
                      {/* Pagination Controls */}
                      {sessions.length > sessionsPerPage && (
                        <div className="flex items-center justify-between pt-6 border-t">
                          <div className="text-sm text-gray-600">
                            Showing {((currentSessionsPage - 1) * sessionsPerPage) + 1} to {Math.min(currentSessionsPage * sessionsPerPage, sessions.length)} of {sessions.length} sessions
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {/* Previous Button */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentSessionsPage(prev => Math.max(prev - 1, 1))}
                              disabled={currentSessionsPage === 1}
                            >
                              Previous
                            </Button>
                            
                            {/* Page Numbers */}
                            <div className="flex items-center space-x-1">
                              {(() => {
                                const totalPages = Math.ceil(sessions.length / sessionsPerPage);
                                const visiblePages = [];
                                const maxVisible = 5;
                                
                                let startPage = Math.max(1, currentSessionsPage - Math.floor(maxVisible / 2));
                                let endPage = Math.min(totalPages, startPage + maxVisible - 1);
                                
                                if (endPage - startPage + 1 < maxVisible) {
                                  startPage = Math.max(1, endPage - maxVisible + 1);
                                }
                                
                                // Show first page if not in range
                                if (startPage > 1) {
                                  visiblePages.push(
                                    <Button
                                      key={1}
                                      variant={1 === currentSessionsPage ? "default" : "outline"}
                                      size="sm"
                                      onClick={() => setCurrentSessionsPage(1)}
                                      className="w-10 h-8"
                                    >
                                      1
                                    </Button>
                                  );
                                  if (startPage > 2) {
                                    visiblePages.push(
                                      <span key="ellipsis1" className="px-2 text-gray-400">...</span>
                                    );
                                  }
                                }
                                
                                // Show visible page range
                                for (let i = startPage; i <= endPage; i++) {
                                  visiblePages.push(
                                    <Button
                                      key={i}
                                      variant={i === currentSessionsPage ? "default" : "outline"}
                                      size="sm"
                                      onClick={() => setCurrentSessionsPage(i)}
                                      className="w-10 h-8"
                                    >
                                      {i}
                                    </Button>
                                  );
                                }
                                
                                // Show last page if not in range
                                if (endPage < totalPages) {
                                  if (endPage < totalPages - 1) {
                                    visiblePages.push(
                                      <span key="ellipsis2" className="px-2 text-gray-400">...</span>
                                    );
                                  }
                                  visiblePages.push(
                                    <Button
                                      key={totalPages}
                                      variant={totalPages === currentSessionsPage ? "default" : "outline"}
                                      size="sm"
                                      onClick={() => setCurrentSessionsPage(totalPages)}
                                      className="w-10 h-8"
                                    >
                                      {totalPages}
                                    </Button>
                                  );
                                }
                                
                                return visiblePages;
                              })()}
                            </div>
                            
                            {/* Next Button */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentSessionsPage(prev => Math.min(prev + 1, Math.ceil(sessions.length / sessionsPerPage)))}
                              disabled={currentSessionsPage === Math.ceil(sessions.length / sessionsPerPage)}
                            >
                              Next
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No session data found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* User Details Modal */}
      <Dialog open={isUserDetailsOpen} onOpenChange={setIsUserDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <UserIcon className="w-6 h-6" />
              <span>User Details</span>
            </DialogTitle>
            <DialogDescription>
              Complete user information and activity
            </DialogDescription>
          </DialogHeader>

          {userDetailsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
            </div>
          ) : selectedUser && (
            <div className="space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Basic Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <UserIcon className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">Full Name</p>
                          <p className="font-medium">{selectedUser.firstName} {selectedUser.middleName || ''} {selectedUser.lastName}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Mail className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="font-medium">{selectedUser.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Phone className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">Phone</p>
                          <p className="font-medium">{selectedUser.tel || 'Not provided'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <UserIcon className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">Username</p>
                          <p className="font-medium">{selectedUser.username || 'Not set'}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Activity className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">Age / Sex</p>
                          <p className="font-medium">{selectedUser.age || 'N/A'} / {selectedUser.sex || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <MapPin className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">Location</p>
                          <p className="font-medium">{selectedUser.location || selectedUser.city || 'Not provided'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Financial Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Wallet className="w-5 h-5" />
                    <span>Financial Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-gray-600">Wallet Balance</p>
                      <p className="text-2xl font-bold text-green-600">₦{selectedUser.wallet?.toLocaleString() || '0'}</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-600">Total Referrals</p>
                      <p className="text-2xl font-bold text-blue-600">{selectedUser.totalReferrals || 0}</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <p className="text-sm text-gray-600">Referral Code</p>
                      <p className="text-lg font-bold text-purple-600">{selectedUser.referralCode || 'N/A'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Health Information */}
              {(selectedUser.bloodGroup || selectedUser.address) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <Activity className="w-5 h-5" />
                      <span>Health & Personal Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {selectedUser.bloodGroup && (
                        <div>
                          <p className="text-sm text-gray-600">Blood Group</p>
                          <p className="font-medium">{selectedUser.bloodGroup}</p>
                        </div>
                      )}
                      {selectedUser.whatsappNumber && (
                        <div>
                          <p className="text-sm text-gray-600">WhatsApp</p>
                          <p className="font-medium">{selectedUser.whatsappNumber}</p>
                        </div>
                      )}
                      {selectedUser.address && (
                        <div className="md:col-span-2">
                          <p className="text-sm text-gray-600">Address</p>
                          <p className="font-medium">{selectedUser.address}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Registration Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Registration Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-600">Registration Date</p>
                      <p className="font-medium">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">User ID</p>
                      <p className="font-medium">{selectedUser.id}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}