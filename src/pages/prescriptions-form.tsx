import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPrescriptionSchema, type InsertPrescription } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ArrowLeft, Save, FileText } from "lucide-react";

export default function PrescriptionsForm() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertPrescription>({
    resolver: zodResolver(insertPrescriptionSchema),
    defaultValues: {
      doctorName: "",
      doctorEmail: "",
      patientName: "",
      patientId: "",
      prescriptionDate: "",
      prescriptionTime: "",
      medication: "",
      additionalInstructions: "",
    },
  });

  const createPrescriptionMutation = useMutation({
    mutationFn: async (data: InsertPrescription) => {
      return await apiRequest("POST", "/api/prescriptions", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Prescription created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/prescriptions"] });
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create prescription",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertPrescription) => {
    createPrescriptionMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-blue-50 p-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setLocation("/")}
            className="text-green-600 hover:bg-green-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <FileText className="w-6 h-6 text-green-600" />
            <h1 className="text-2xl font-bold text-gray-800">Presibo Prescription Form</h1>
          </div>
          <p className="text-gray-600">Create and manage medical prescriptions</p>
        </div>
      </div>

      {/* Prescription Form */}
      <Card className="max-w-2xl mx-auto shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-t-lg">
          <CardTitle className="text-center text-xl">Prescription Details</CardTitle>
        </CardHeader>
        
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Doctor Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Doctor Information</h3>
                
                <FormField
                  control={form.control}
                  name="doctorName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Doctor's Name</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                          placeholder="Enter Doctor Name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="doctorEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Doctor's Email</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="email"
                          className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                          placeholder="Enter Doctor Email"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Patient Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Patient Information</h3>
                
                <FormField
                  control={form.control}
                  name="patientName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Patient Name</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                          placeholder="Enter Patient Name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="patientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Patient ID</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                          placeholder="Enter Patient ID"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Prescription Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Prescription Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="prescriptionDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">Date</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="date"
                            className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="prescriptionTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">Time</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="time"
                            className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="medication"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Medication</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          className="border-gray-300 focus:border-green-500 focus:ring-green-500 min-h-[100px]"
                          placeholder="Enter medication"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="additionalInstructions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Additional Instructions</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          className="border-gray-300 focus:border-green-500 focus:ring-green-500 min-h-[120px]"
                          placeholder="Enter Additional Instructions"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button 
                  type="submit" 
                  disabled={createPrescriptionMutation.isPending}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white py-3 text-lg font-semibold"
                >
                  {createPrescriptionMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating Prescription...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Save className="w-5 h-5" />
                      Create Prescription
                    </div>
                  
                  )}
                </Button>
              </div>
              {/* Back to Dashboard Button */}
              <div className="pt-4">
                <a className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white py-3 text-lg font-semibold flex items-center gap-2 justify-center rounded-lg"
                  href="/doctor-dashboard">
                  Back to Dashboard
                  
                </a>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}