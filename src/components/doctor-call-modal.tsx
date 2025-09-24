import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Phone, PhoneCall, Clock, X } from "lucide-react";

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

interface DoctorCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctor: Doctor | null;
}

interface CallRequest {
  doctorId: number;
  doctorName: string;
  doctorSpecialty: string;
  callerPhone?: string;
}

export default function DoctorCallModal({ isOpen, onClose, doctor }: DoctorCallModalProps) {
  const [callerPhone, setCallerPhone] = useState("");
  const [callStatus, setCallStatus] = useState<'idle' | 'dialing' | 'connected' | 'ended'>('idle');
  const [callDuration, setCallDuration] = useState(0);
  const [callStartTime, setCallStartTime] = useState<Date | null>(null);
  
  const queryClient = useQueryClient();

  const initiateCallMutation = useMutation({
    mutationFn: async (callData: CallRequest) => {
      const response = await fetch("/api/doctor-calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(callData),
      });
      
      if (!response.ok) {
        throw new Error("Failed to initiate call");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setCallStatus('dialing');
      toast({
        title: "Call Initiated",
        description: `Connecting you to ${doctor?.name}...`,
      });
      
      // Simulate call connection after 3 seconds
      setTimeout(() => {
        setCallStatus('connected');
        setCallStartTime(new Date());
        startCallTimer();
        toast({
          title: "Connected",
          description: `You are now connected to ${doctor?.name}`,
        });
      }, 3000);
      
      queryClient.invalidateQueries({ queryKey: ["/api/doctor-calls/user"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Call Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateCallStatusMutation = useMutation({
    mutationFn: async ({ callId, status, duration }: { callId: number; status: string; duration?: number }) => {
      const response = await fetch(`/api/doctor-calls/${callId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, duration }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update call status");
      }
      
      return response.json();
    },
  });

  const startCallTimer = () => {
    const interval = setInterval(() => {
      if (callStatus === 'connected' && callStartTime) {
        const now = new Date();
        const duration = Math.floor((now.getTime() - callStartTime.getTime()) / 1000);
        setCallDuration(duration);
      } else {
        clearInterval(interval);
      }
    }, 1000);
  };

  const handleInitiateCall = () => {
    if (!doctor) return;
    
    const callData: CallRequest = {
      doctorId: doctor.id,
      doctorName: doctor.name,
      doctorSpecialty: doctor.specialization || doctor.specialty || 'General Practitioner',
      callerPhone: callerPhone || undefined,
    };
    
    initiateCallMutation.mutate(callData);
  };

  const handleEndCall = () => {
    setCallStatus('ended');
    
    toast({
      title: "Call Ended",
      description: `Call duration: ${formatDuration(callDuration)}`,
    });
    
    setTimeout(() => {
      resetCallState();
      onClose();
    }, 2000);
  };

  const resetCallState = () => {
    setCallStatus('idle');
    setCallDuration(0);
    setCallStartTime(null);
    setCallerPhone("");
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!doctor) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        if (callStatus === 'connected') {
          handleEndCall();
        } else {
          resetCallState();
          onClose();
        }
      }
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-naija-green" />
            {callStatus === 'idle' ? 'Call Doctor' : 'In Call'}
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
            <div className={doctor.thumbnail ? "" : "hidden"} />
            <div className={`w-16 h-16 bg-gradient-to-br from-trust-blue to-royal-purple rounded-full flex items-center justify-center ${doctor.thumbnail ? 'hidden' : ''}`}>
              <i className="fas fa-user-md text-white text-2xl"></i>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{doctor.name}</h3>
              <p className="text-sm text-gray-600">{doctor.specialization || doctor.specialty}</p>
              <p className="text-xs text-gray-500">{doctor.location}</p>
            </div>
          </div>

          {/* Call Status Display */}
          {callStatus !== 'idle' && (
            <div className="text-center space-y-4">
              {callStatus === 'dialing' && (
                <div className="flex flex-col items-center space-y-3">
                  <div className="animate-pulse">
                    <PhoneCall className="w-12 h-12 text-yellow-500" />
                  </div>
                  <p className="text-lg font-medium">Connecting...</p>
                  <p className="text-sm text-gray-600">Please wait while we connect you</p>
                </div>
              )}
              
              {callStatus === 'connected' && (
                <div className="flex flex-col items-center space-y-3">
                  <div className="animate-pulse">
                    <PhoneCall className="w-12 h-12 text-naija-green" />
                  </div>
                  <p className="text-lg font-medium text-naija-green">Connected</p>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{formatDuration(callDuration)}</span>
                  </div>
                </div>
              )}
              
              {callStatus === 'ended' && (
                <div className="flex flex-col items-center space-y-3">
                  <X className="w-12 h-12 text-gray-500" />
                  <p className="text-lg font-medium">Call Ended</p>
                  <p className="text-sm text-gray-600">Duration: {formatDuration(callDuration)}</p>
                </div>
              )}
            </div>
          )}

          {/* Phone Number Input (only shown when idle) */}
          {callStatus === 'idle' && (
            <div className="space-y-2">
              <Label htmlFor="callerPhone">Your Phone Number (Optional)</Label>
              <Input
                id="callerPhone"
                type="tel"
                placeholder="Enter your phone number"
                value={callerPhone}
                onChange={(e) => setCallerPhone(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                This helps the doctor identify your call
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            {callStatus === 'idle' && (
              <>
                <Button
                  onClick={handleInitiateCall}
                  disabled={initiateCallMutation.isPending}
                  className="flex-1 bg-naija-green hover:bg-naija-green/90"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  {initiateCallMutation.isPending ? "Initiating..." : "Call Now"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    resetCallState();
                    onClose();
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </>
            )}
            
            {callStatus === 'connected' && (
              <Button
                onClick={handleEndCall}
                variant="destructive"
                className="flex-1"
              >
                <Phone className="w-4 h-4 mr-2" />
                End Call
              </Button>
            )}
            
            {(callStatus === 'dialing' || callStatus === 'ended') && (
              <Button
                variant="outline"
                onClick={() => {
                  resetCallState();
                  onClose();
                }}
                className="flex-1"
              >
                {callStatus === 'ended' ? 'Close' : 'Cancel'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}