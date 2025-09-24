import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Calendar, Clock, CalendarCheck, AlertCircle, CheckCircle2 } from "lucide-react";

interface Doctor {
  id: number;
  name: string;
  firstname?: string;
  lastname?: string;
  specialization?: string;
  specialty?: string;
  location?: string;
  phone?: string;
  thumbnail?: string;
}

interface AppointmentBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctor: Doctor | null;
}

interface AppointmentRequest {
  doctorId: number;
  doctorName: string;
  doctorSpecialty: string;
  appointmentDate: string;
  appointmentTime: string;
  duration: number;
  reason: string;
  notes?: string;
  priority: string;
  appointmentType: string;
}

export default function AppointmentBookingModal({ isOpen, onClose, doctor }: AppointmentBookingModalProps) {
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [duration, setDuration] = useState(30);
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [priority, setPriority] = useState("normal");
  const [appointmentType, setAppointmentType] = useState("consultation");
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'booking' | 'booked' | 'confirmed'>('idle');
  
  const queryClient = useQueryClient();

  const bookAppointmentMutation = useMutation({
    mutationFn: async (appointmentData: AppointmentRequest) => {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(appointmentData),
      });
      
      if (!response.ok) {
        throw new Error("Failed to book appointment");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setBookingStatus('booking');
      toast({
        title: "Appointment Booked",
        description: `Your appointment with ${doctor?.name} has been requested for ${appointmentDate} at ${appointmentTime}`,
      });
      
      // Simulate confirmation after 2 seconds
      setTimeout(() => {
        setBookingStatus('confirmed');
        toast({
          title: "Appointment Confirmed",
          description: `${doctor?.name} will review your appointment request and contact you within 24 hours`,
        });
        
        setTimeout(() => {
          resetForm();
          onClose();
        }, 2000);
      }, 2000);
      
      queryClient.invalidateQueries({ queryKey: ["/api/appointments/user"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Booking Failed",
        description: error.message,
        variant: "destructive",
      });
      setBookingStatus('idle');
    },
  });

  const handleBookAppointment = () => {
    if (!doctor || !appointmentDate || !appointmentTime || !reason.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please fill in all required fields (date, time, and reason)",
        variant: "destructive",
      });
      return;
    }
    
    // Check if appointment is in the future
    const selectedDateTime = new Date(`${appointmentDate}T${appointmentTime}`);
    const now = new Date();
    
    if (selectedDateTime <= now) {
      toast({
        title: "Invalid Date/Time",
        description: "Please select a future date and time for your appointment",
        variant: "destructive",
      });
      return;
    }
    
    const appointmentData: AppointmentRequest = {
      doctorId: doctor.id,
      doctorName: doctor.name,
      doctorSpecialty: doctor.specialization || doctor.specialty || 'General Practitioner',
      appointmentDate,
      appointmentTime,
      duration,
      reason: reason.trim(),
      notes: notes.trim() || undefined,
      priority,
      appointmentType,
    };
    
    setBookingStatus('booking');
    bookAppointmentMutation.mutate(appointmentData);
  };

  const resetForm = () => {
    setAppointmentDate("");
    setAppointmentTime("");
    setDuration(30);
    setReason("");
    setNotes("");
    setPriority("normal");
    setAppointmentType("consultation");
    setBookingStatus('idle');
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 17; hour++) {
      for (let minute of [0, 30]) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(time);
      }
    }
    return slots;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'normal': return 'text-blue-600';
      case 'low': return 'text-gray-600';
      default: return 'text-blue-600';
    }
  };

  const getStatusIcon = () => {
    switch (bookingStatus) {
      case 'booking':
        return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-naija-green"></div>;
      case 'booked':
      case 'confirmed':
        return <CheckCircle2 className="w-4 h-4 text-naija-green" />;
      default:
        return <CalendarCheck className="w-4 h-4" />;
    }
  };

  if (!doctor) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        if (bookingStatus === 'booking') {
          toast({
            title: "Please Wait",
            description: "Appointment is being booked...",
          });
          return;
        }
        resetForm();
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-naija-green" />
            Book Appointment
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Doctor Info */}
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            {doctor.thumbnail ? (
              <img 
                src={`https://presibo-wl.vercel.app/photos/${doctor.thumbnail}`}
                alt={doctor.name}
                className="w-16 h-16 rounded-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div className={`w-16 h-16 bg-gradient-to-br from-trust-blue to-royal-purple rounded-full flex items-center justify-center ${doctor.thumbnail ? 'hidden' : ''}`}>
              <i className="fas fa-user-md text-white text-2xl"></i>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{doctor.name}</h3>
              <p className="text-sm text-gray-600">{doctor.specialization || doctor.specialty}</p>
              {doctor.location && (
                <p className="text-xs text-gray-500">{doctor.location}</p>
              )}
            </div>
          </div>

          {/* Booking Status */}
          {bookingStatus !== 'idle' && (
            <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
              {getStatusIcon()}
              <span className="text-sm font-medium">
                {bookingStatus === 'booking' && "Booking appointment..."}
                {bookingStatus === 'booked' && "Appointment request sent"}
                {bookingStatus === 'confirmed' && "Appointment confirmed"}
              </span>
            </div>
          )}

          {/* Appointment Form */}
          <div className="space-y-4">
            {/* Appointment Type */}
            <div className="space-y-2">
              <Label htmlFor="appointmentType">Appointment Type</Label>
              <Select value={appointmentType} onValueChange={setAppointmentType} disabled={bookingStatus === 'booking'}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consultation">General Consultation</SelectItem>
                  <SelectItem value="follow-up">Follow-up Visit</SelectItem>
                  <SelectItem value="screening">Health Screening</SelectItem>
                  <SelectItem value="emergency">Emergency Consultation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Selection */}
            <div className="space-y-2">
              <Label htmlFor="appointmentDate">Preferred Date</Label>
              <Input
                id="appointmentDate"
                type="date"
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                disabled={bookingStatus === 'booking'}
                min={getMinDate()}
                className="w-full"
              />
            </div>

            {/* Time Selection */}
            <div className="space-y-2">
              <Label htmlFor="appointmentTime">Preferred Time</Label>
              <Select value={appointmentTime} onValueChange={setAppointmentTime} disabled={bookingStatus === 'booking'}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time slot" />
                </SelectTrigger>
                <SelectContent>
                  {getTimeSlots().map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Select value={duration.toString()} onValueChange={(value) => setDuration(parseInt(value))} disabled={bookingStatus === 'booking'}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label htmlFor="priority">Priority Level</Label>
              <Select value={priority} onValueChange={setPriority} disabled={bookingStatus === 'booking'}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low Priority</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Visit *</Label>
              <Input
                id="reason"
                placeholder="Brief description of your health concern"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={bookingStatus === 'booking'}
                className="w-full"
              />
            </div>

            {/* Additional Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any additional information, symptoms, or special requests..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={bookingStatus === 'booking'}
                rows={3}
                className="w-full resize-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              onClick={() => {
                resetForm();
                onClose();
              }}
              variant="outline"
              className="flex-1"
              disabled={bookingStatus === 'booking'}
            >
              Cancel
            </Button>
            <Button
              onClick={handleBookAppointment}
              className="flex-1 bg-naija-green hover:bg-naija-green/90"
              disabled={bookingStatus === 'booking' || !appointmentDate || !appointmentTime || !reason.trim()}
            >
              <div className="flex items-center space-x-2">
                {getStatusIcon()}
                <span>
                  {bookingStatus === 'booking' ? 'Booking...' : 'Book Appointment'}
                </span>
              </div>
            </Button>
          </div>

          {/* Helper Text */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">Appointment Guidelines:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Appointments are subject to doctor's availability</li>
                  <li>• You'll receive confirmation within 24 hours</li>
                  <li>• Please arrive 15 minutes early for your appointment</li>
                  <li>• Cancellations should be made at least 24 hours in advance</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}