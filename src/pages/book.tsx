import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Mail, MapPin, Phone, User, Users } from "lucide-react";
import { insertPublicBookingSchema } from "@shared/schema";
import type { Doctor } from "@shared/schema";

const bookingFormSchema = insertPublicBookingSchema.extend({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  sex: z.string().min(1, "Please select your gender"),
  location: z.string().min(1, "Location is required"),
  doctorId: z.number().min(1, "Please select a doctor"),
  message: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingFormSchema>;

export default function BookPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      sex: "",
      location: "",
      doctorId: 0,
      message: "",
    },
  });

  // Fetch doctors for dropdown
  const { data: doctors, isLoading: loadingDoctors } = useQuery<Doctor[]>({
    queryKey: ['/api/public/doctors'],
  });

  const bookingMutation = useMutation({
    mutationFn: async (data: BookingFormData) => {
      const response = await fetch('/api/public/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Booking failed');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Booking Submitted Successfully!",
        description: "Thank you for your booking. Our team will contact you soon to confirm your appointment.",
        variant: "default",
      });
      form.reset();
      setIsSubmitting(false);
    },
    onError: (error: any) => {
      console.error('Booking error:', error);
      toast({
        title: "Booking Failed",
        description: error.message || "There was an error submitting your booking. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  const onSubmit = async (data: BookingFormData) => {
    setIsSubmitting(true);
    bookingMutation.mutate(data);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 80 }, (_, i) => currentYear - i);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Book an Appointment</h1>
              <p className="text-green-100">Connect with our healthcare professionals</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-xl border-0">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-gray-800 dark:text-white">
                Schedule Your Consultation
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                Fill out the form below and we'll get back to you within 24 hours
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-gray-800 dark:text-white flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Personal Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        placeholder="Enter your full name"
                        {...form.register("name")}
                        className="h-11"
                      />
                      {form.formState.errors.name && (
                        <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        {...form.register("email")}
                        className="h-11"
                      />
                      {form.formState.errors.email && (
                        <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+234 801 234 5678"
                      {...form.register("phone")}
                      className="h-11"
                    />
                    {form.formState.errors.phone && (
                      <p className="text-sm text-red-600">{form.formState.errors.phone.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        {...form.register("dateOfBirth")}
                        className="h-11"
                      />
                      {form.formState.errors.dateOfBirth && (
                        <p className="text-sm text-red-600">{form.formState.errors.dateOfBirth.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sex">Gender *</Label>
                      <Select onValueChange={(value) => form.setValue("sex", value)}>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select your gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      {form.formState.errors.sex && (
                        <p className="text-sm text-red-600">{form.formState.errors.sex.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location/Address *</Label>
                    <Input
                      id="location"
                      placeholder="Enter your city, state or address"
                      {...form.register("location")}
                      className="h-11"
                    />
                    {form.formState.errors.location && (
                      <p className="text-sm text-red-600">{form.formState.errors.location.message}</p>
                    )}
                  </div>
                </div>

                {/* Doctor Selection */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-gray-800 dark:text-white flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Select Doctor
                  </h3>

                  <div className="space-y-2">
                    <Label htmlFor="doctor">Choose a Doctor *</Label>
                    <Select
                      onValueChange={(value) => form.setValue("doctorId", parseInt(value))}
                      disabled={loadingDoctors}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder={loadingDoctors ? "Loading doctors..." : "Select a doctor"} />
                      </SelectTrigger>
                      <SelectContent>
                        {doctors?.map((doctor) => (
                          <SelectItem key={doctor.id} value={doctor.id.toString()}>
                            <div className="flex flex-col">
                              <span className="font-medium">{doctor.name}</span>
                              <span className="text-sm text-gray-500">
                                {doctor.specialty} • {doctor.location}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.doctorId && (
                      <p className="text-sm text-red-600">{form.formState.errors.doctorId.message}</p>
                    )}
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-gray-800 dark:text-white flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Additional Information
                  </h3>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message to Doctor (Optional)</Label>
                    <Textarea
                      id="message"
                      placeholder="Describe your symptoms, concerns, or any specific questions you'd like to discuss..."
                      rows={4}
                      {...form.register("message")}
                      className="resize-none"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting || loadingDoctors}
                    className="w-full h-12 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold text-lg"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Submitting Booking...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Book Appointment
                      </div>
                    )}
                  </Button>
                </div>
              </form>

              {/* Information */}
              <div className="mt-8 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">What happens next?</h4>
                <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                  <li>• We'll review your booking within 24 hours</li>
                  <li>• Our team will contact you to confirm your appointment</li>
                  <li>• You'll receive appointment details via email</li>
                  <li>• A user account will be created with password "BOOKING"</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}