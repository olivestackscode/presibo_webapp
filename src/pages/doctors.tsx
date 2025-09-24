import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import DoctorCallModal from "@/components/doctor-call-modal";
import DoctorMessageModal from "@/components/doctor-message-modal";
import AppointmentBookingModal from "@/components/appointment-booking-modal";

interface Doctor {
  id: number;
  name: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  specialization: string;
  specialty: string;
  location: string;
  country: string;
  years: number;
  cases: string;
  distance?: string;
  sex?: string;
  thumbnail?: string;
  hospital?: string;
  specialties?: string[];
  experience?: string;
  rating?: number;
  availableSlots?: string[];
}

const specialtyFilters = [
  { label: 'All', value: '' },
  { label: 'General Practitioner', value: 'General Practitioner' },
  { label: 'Family Medicine', value: 'Family Medicine' },
  { label: 'Nutritionist', value: 'Nutritionist' },
  { label: 'Medical Officer', value: 'Medical Officer' },
];

// Doctor image helper function
const getDoctorImage = (thumbnail: string | null | undefined): string => {
  if (!thumbnail || typeof thumbnail !== 'string') {
    return 'default-doctor.jpg'; // fallback image
  }
  
  // If thumbnail already has extension, use as is, otherwise add .jpg
  return thumbnail.includes('.') ? thumbnail : `${thumbnail}.jpg`;
};

export default function Doctors() {
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  const { data: doctors, isLoading } = useQuery<Doctor[]>({
    queryKey: ['/api/doctors'],
  });

  const filteredDoctors = doctors?.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doctor.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doctor.hospital?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSpecialty = !selectedSpecialty || 
                            doctor.specialization?.includes(selectedSpecialty) ||
                            doctor.specialty.includes(selectedSpecialty);
    
    return matchesSearch && matchesSpecialty;
  }) || [];

  const handleBookAppointment = (doctor: Doctor) => {
    if (!isAuthenticated) {
      setLocation('/auth');
      return;
    }
    setSelectedDoctor(doctor);
    setIsBookingModalOpen(true);
  };

  const handleCallDoctor = (doctor: Doctor) => {
    if (!isAuthenticated) {
      setLocation('/auth');
      return;
    }
    setSelectedDoctor(doctor);
    setIsCallModalOpen(true);
  };

  const handleMessageDoctor = (doctor: Doctor) => {
    if (!isAuthenticated) {
      setLocation('/auth');
      return;
    }
    setSelectedDoctor(doctor);
    setIsMessageModalOpen(true);
  };



  if (isLoading) {
    return (
      <div className="p-4 space-y-6">
        <div className="animate-pulse">
          <div className="bg-white rounded-2xl p-6 h-32 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-xl p-4 h-32"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Login Prompt Banner for Unauthenticated Users */}
      {!isAuthenticated && (
        <Alert className="border-blue-200 bg-blue-50">
          <AlertDescription className="text-center">
            <strong>Want to book appointments or contact doctors?</strong> 
            <Button 
              variant="link" 
              className="ml-2 text-blue-600 font-semibold p-0"
              onClick={() => setLocation('/auth')}
            >
              Sign in or create an account
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <i className="fas fa-user-md text-trust-blue mr-2"></i>
            Find Your Doctor
          </h2>
          
          {/* Search and Filter */}
          <div className="mb-6">
            <div className="relative mb-4">
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              <Input
                type="text"
                placeholder="Search doctors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {specialtyFilters.map((filter) => (
                <Button
                  key={filter.value}
                  onClick={() => setSelectedSpecialty(filter.value)}
                  variant={selectedSpecialty === filter.value ? "default" : "outline"}
                  size="sm"
                  className={`whitespace-nowrap ${
                    selectedSpecialty === filter.value 
                      ? 'bg-naija-green hover:bg-naija-green/90' 
                      : ''
                  }`}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Doctors List */}
          <div className="space-y-4">
            {filteredDoctors.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <i className="fas fa-search text-4xl mb-4 opacity-50"></i>
                <p>No doctors found matching your criteria</p>
              </div>
            ) : (
              filteredDoctors.map((doctor, index) => (
                <Card key={`doctor-${doctor.id}-${index}`} className="border border-gray-100">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 rounded-full overflow-hidden">
                        <img 
                          src={`https://presibo-wl.vercel.app/photos/${getDoctorImage(doctor.thumbnail)}`}
                          alt={doctor.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = `
                                <div class="w-16 h-16 bg-gradient-to-br from-trust-blue to-royal-purple rounded-full flex items-center justify-center">
                                  <i class="fas fa-user-md text-white text-2xl"></i>
                                </div>
                              `;
                            }
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{doctor.name}</h3>
                        <p className="text-sm text-gray-600 mb-1">
                          {doctor.specialization || doctor.specialty}
                        </p>
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="flex items-center space-x-1">
                            <i className="fas fa-map-marker-alt text-gray-400 text-xs"></i>
                            <span className="text-xs text-gray-500">{doctor.location}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <i className="fas fa-clock text-gray-400 text-xs"></i>
                            <span className="text-xs text-gray-500">{doctor.years || 0} years experience</span>
                          </div>
                          {doctor.cases && (
                            <div className="flex items-center space-x-1">
                              <i className="fas fa-briefcase text-gray-400 text-xs"></i>
                              <span className="text-xs text-gray-500">{doctor.cases} cases</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-4 mb-3">
                          <div className="flex items-center space-x-1">
                            <i className="fas fa-star text-golden-yellow text-xs"></i>
                            <span className="text-sm font-medium">{doctor.rating || 4.5}</span>
                            <span className="text-xs text-gray-500">({Math.floor(Math.random() * 50) + 10} reviews)</span>
                          </div>
                          {doctor.distance && (
                            <div className="flex items-center space-x-1">
                              <i className="fas fa-route text-gray-400 text-xs"></i>
                              <span className="text-xs text-naija-green font-medium">{doctor.distance}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => handleBookAppointment(doctor)}
                            className="flex-1 bg-trust-blue hover:bg-trust-blue/90 text-sm font-medium"
                          >
                            Book Appointment
                          </Button>
                          <Button
                            onClick={() => handleMessageDoctor(doctor)}
                            variant="outline"
                            size="sm"
                            className="px-4"
                            title="Send Message"
                          >
                            <i className="fas fa-envelope text-blue-600"></i>
                          </Button>
                          {doctor.phone && (
                            <Button
                              onClick={() => handleCallDoctor(doctor)}
                              variant="outline"
                              size="sm"
                              className="px-4"
                              title="Call Doctor"
                            >
                              <i className="fas fa-phone text-naija-green"></i>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Doctor Call Modal */}
      <DoctorCallModal
        isOpen={isCallModalOpen}
        onClose={() => setIsCallModalOpen(false)}
        doctor={selectedDoctor}
      />
      
      {/* Doctor Message Modal */}
      <DoctorMessageModal
        isOpen={isMessageModalOpen}
        onClose={() => setIsMessageModalOpen(false)}
        doctor={selectedDoctor}
      />
      
      {/* Appointment Booking Modal */}
      <AppointmentBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        doctor={selectedDoctor}
      />
    </div>
  );
}
