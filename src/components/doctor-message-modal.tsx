import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { MessageCircle, Send, AlertCircle, CheckCircle2 } from "lucide-react";

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

interface DoctorMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctor: Doctor | null;
}

interface MessageRequest {
  doctorId: number;
  doctorName: string;
  doctorSpecialty: string;
  subject: string;
  message: string;
  priority: string;
  messageType: string;
}

export default function DoctorMessageModal({ isOpen, onClose, doctor }: DoctorMessageModalProps) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState("normal");
  const [messageType, setMessageType] = useState("consultation");
  const [messageStatus, setMessageStatus] = useState<'idle' | 'sending' | 'sent' | 'delivered'>('idle');
  
  const queryClient = useQueryClient();

  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: MessageRequest) => {
      const response = await fetch("/api/doctor-messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(messageData),
      });
      
      if (!response.ok) {
        throw new Error("Failed to send message");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setMessageStatus('sending');
      toast({
        title: "Message Sent",
        description: `Your message has been sent to ${doctor?.name}`,
      });
      
      // Simulate message delivery after 2 seconds
      setTimeout(() => {
        setMessageStatus('delivered');
        toast({
          title: "Message Delivered",
          description: `${doctor?.name} will respond within 24 hours`,
        });
        
        setTimeout(() => {
          resetForm();
          onClose();
        }, 2000);
      }, 2000);
      
      queryClient.invalidateQueries({ queryKey: ["/api/doctor-messages/user"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Message Failed",
        description: error.message,
        variant: "destructive",
      });
      setMessageStatus('idle');
    },
  });

  const handleSendMessage = () => {
    if (!doctor || !subject.trim() || !message.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please fill in both subject and message fields",
        variant: "destructive",
      });
      return;
    }
    
    const messageData: MessageRequest = {
      doctorId: doctor.id,
      doctorName: doctor.name,
      doctorSpecialty: doctor.specialization || doctor.specialty || 'General Practitioner',
      subject: subject.trim(),
      message: message.trim(),
      priority,
      messageType,
    };
    
    setMessageStatus('sending');
    sendMessageMutation.mutate(messageData);
  };

  const resetForm = () => {
    setSubject("");
    setMessage("");
    setPriority("normal");
    setMessageType("consultation");
    setMessageStatus('idle');
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
    switch (messageStatus) {
      case 'sending':
        return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-naija-green"></div>;
      case 'sent':
        return <CheckCircle2 className="w-4 h-4 text-naija-green" />;
      case 'delivered':
        return <CheckCircle2 className="w-4 h-4 text-naija-green" />;
      default:
        return <Send className="w-4 h-4" />;
    }
  };

  if (!doctor) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        if (messageStatus === 'sending') {
          toast({
            title: "Please Wait",
            description: "Message is being sent...",
          });
          return;
        }
        resetForm();
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-naija-green" />
            Message Doctor
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
            <div className={doctor.thumbnail ? "hidden" : ""} />
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

          {/* Message Status */}
          {messageStatus !== 'idle' && (
            <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
              {getStatusIcon()}
              <span className="text-sm font-medium">
                {messageStatus === 'sending' && "Sending message..."}
                {messageStatus === 'sent' && "Message sent successfully"}
                {messageStatus === 'delivered' && "Message delivered to doctor"}
              </span>
            </div>
          )}

          {/* Message Form */}
          <div className="space-y-4">
            {/* Message Type */}
            <div className="space-y-2">
              <Label htmlFor="messageType">Message Type</Label>
              <Select value={messageType} onValueChange={setMessageType} disabled={messageStatus === 'sending'}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consultation">General Consultation</SelectItem>
                  <SelectItem value="appointment">Appointment Request</SelectItem>
                  <SelectItem value="prescription">Prescription Inquiry</SelectItem>
                  <SelectItem value="general">General Question</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label htmlFor="priority">Priority Level</Label>
              <Select value={priority} onValueChange={setPriority} disabled={messageStatus === 'sending'}>
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

            {/* Subject */}
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="Brief description of your concern"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={messageStatus === 'sending'}
                className="w-full"
              />
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Describe your symptoms, questions, or concerns in detail..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={messageStatus === 'sending'}
                rows={4}
                className="w-full resize-none"
              />
              <p className="text-xs text-gray-500">
                Be specific about your symptoms and medical history for better assistance
              </p>
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
              disabled={messageStatus === 'sending'}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendMessage}
              className="flex-1 bg-naija-green hover:bg-naija-green/90"
              disabled={messageStatus === 'sending' || !subject.trim() || !message.trim()}
            >
              <div className="flex items-center space-x-2">
                {getStatusIcon()}
                <span>
                  {messageStatus === 'sending' ? 'Sending...' : 'Send Message'}
                </span>
              </div>
            </Button>
          </div>

          {/* Helper Text */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">Important Notice:</p>
                <p>This is not for emergencies. For urgent medical situations, please call emergency services or visit the nearest hospital.</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}