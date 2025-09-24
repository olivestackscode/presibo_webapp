import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { HEALTH_READING_TYPES } from "@/lib/constants";
import { useAuth } from "@/hooks/use-auth";
import type { HealthReading, Meal } from "@shared/schema";

interface HealthReadingForm {
  systolic: string;
  diastolic: string;
  bloodSugar: string;
}

interface MealForm {
  name: string;
  description: string;
  type: string;
}

export default function Tracking() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [isHealthModalOpen, setIsHealthModalOpen] = useState(false);
  const [isMealModalOpen, setIsMealModalOpen] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState('');
  const [healthForm, setHealthForm] = useState<HealthReadingForm>({
    systolic: '',
    diastolic: '',
    bloodSugar: ''
  });
  const [mealForm, setMealForm] = useState<MealForm>({
    name: '',
    description: '',
    type: 'breakfast'
  });
  const queryClient = useQueryClient();

  const today = new Date().toISOString().split('T')[0];

  // Fetch health readings
  const { data: healthReadings, isLoading: isReadingsLoading } = useQuery<HealthReading[]>({
    queryKey: [`/api/health-readings/${user?.id}`],
    enabled: !!user?.id,
  });

  // Fetch today's meals
  const { data: todayMeals } = useQuery<Meal[]>({
    queryKey: [`/api/meals/${user?.id}/${today}`],
    enabled: !!user?.id,
  });

  // Health reading mutation
  const healthReadingMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/health-readings', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/health-readings/${user?.id}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/dashboard/${user?.id}`] });
      setIsHealthModalOpen(false);
      setHealthForm({ systolic: '', diastolic: '', bloodSugar: '' });
    },
  });

  // Meal mutation
  const mealMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/meals', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/meals/${user?.id}/${today}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/dashboard/${user?.id}`] });
      setIsMealModalOpen(false);
      setMealForm({ name: '', description: '', type: 'breakfast' });
    },
  });

  const handleHealthSubmit = async (type: 'blood_pressure' | 'blood_sugar') => {
    if (!user?.id) return;
    try {
      if (type === 'blood_pressure') {
        if (!healthForm.systolic || !healthForm.diastolic) return;
        
        await healthReadingMutation.mutateAsync({
          userId: user.id,
          type: HEALTH_READING_TYPES.BLOOD_PRESSURE,
          systolic: parseInt(healthForm.systolic),
          diastolic: parseInt(healthForm.diastolic),
          unit: 'mmHg'
        });
      } else {
        if (!healthForm.bloodSugar) return;
        
        await healthReadingMutation.mutateAsync({
          userId: user.id,
          type: HEALTH_READING_TYPES.BLOOD_SUGAR,
          value: parseFloat(healthForm.bloodSugar),
          unit: 'mg/dL'
        });
      }
    } catch (error) {
      console.error('Failed to save health reading:', error);
    }
  };

  const handleMealSubmit = async () => {
    if (!user?.id) return;
    try {
      await mealMutation.mutateAsync({
        userId: user.id,
        type: selectedMealType || mealForm.type,
        completed: true,
        date: today
      });
    } catch (error) {
      console.error('Failed to add meal:', error);
    }
  };

  const handleAddMealClick = (mealType: string) => {
    setSelectedMealType(mealType);
    setMealForm(prev => ({ ...prev, type: mealType }));
    setIsMealModalOpen(true);
  };

  const formatReadingTime = (timestamp: Date | null) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getReadingStatus = (type: string, value: number | null, systolic?: number | null, diastolic?: number | null) => {
    if (type === 'blood_pressure' && systolic && diastolic) {
      if (systolic < 120 && diastolic < 80) return { label: 'Normal', color: 'text-naija-green' };
      if (systolic < 140 || diastolic < 90) return { label: 'Elevated', color: 'text-warm-orange' };
      return { label: 'High', color: 'text-red-500' };
    }
    
    if (type === 'blood_sugar' && value) {
      if (value < 100) return { label: 'Normal', color: 'text-naija-green' };
      if (value < 126) return { label: 'Prediabetes', color: 'text-warm-orange' };
      return { label: 'Diabetes Range', color: 'text-red-500' };
    }
    
    return { label: 'Unknown', color: 'text-gray-500' };
  };

  const mealTypes = [
    { type: 'breakfast', icon: 'fas fa-sun', color: 'golden-yellow', label: 'Breakfast' },
    { type: 'lunch', icon: 'fas fa-sun', color: 'warm-orange', label: 'Lunch' },
    { type: 'dinner', icon: 'fas fa-moon', color: 'royal-purple', label: 'Dinner' }
  ];

  return (
    <div className="p-4 space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center">
              <i className="fas fa-chart-line text-royal-purple mr-2"></i>
              Health Tracking
            </h2>
            <Button 
              onClick={() => setLocation('/fitness')}
              className="bg-naija-green hover:bg-naija-green/90 text-white px-4 py-2"
              size="sm"
            >
              <i className="fas fa-dumbbell mr-2"></i>
              Fitness
            </Button>
          </div>
          
          {/* Quick Input Cards */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Dialog open={isHealthModalOpen} onOpenChange={setIsHealthModalOpen}>
              <DialogTrigger asChild>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-health-pink transition-colors">
                  <i className="fas fa-heart text-health-pink text-2xl mb-2"></i>
                  <h3 className="font-semibold text-sm mb-2">Blood Pressure</h3>
                  <Button size="sm" className="w-full bg-health-pink hover:bg-health-pink/90">
                    Add Reading
                  </Button>
                </div>
              </DialogTrigger>
              
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Health Reading</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="systolic">Systolic</Label>
                      <Input
                        id="systolic"
                        type="number"
                        placeholder="120"
                        value={healthForm.systolic}
                        onChange={(e) => setHealthForm(prev => ({ ...prev, systolic: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="diastolic">Diastolic</Label>
                      <Input
                        id="diastolic"
                        type="number"
                        placeholder="80"
                        value={healthForm.diastolic}
                        onChange={(e) => setHealthForm(prev => ({ ...prev, diastolic: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="bloodSugar">Blood Sugar (mg/dL)</Label>
                    <Input
                      id="bloodSugar"
                      type="number"
                      placeholder="95"
                      value={healthForm.bloodSugar}
                      onChange={(e) => setHealthForm(prev => ({ ...prev, bloodSugar: e.target.value }))}
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleHealthSubmit('blood_pressure')}
                      disabled={!healthForm.systolic || !healthForm.diastolic || healthReadingMutation.isPending}
                      className="flex-1 bg-health-pink hover:bg-health-pink/90"
                    >
                      Save Blood Pressure
                    </Button>
                    <Button
                      onClick={() => handleHealthSubmit('blood_sugar')}
                      disabled={!healthForm.bloodSugar || healthReadingMutation.isPending}
                      className="flex-1 bg-trust-blue hover:bg-trust-blue/90"
                    >
                      Save Blood Sugar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center">
              <i className="fas fa-tint text-trust-blue text-2xl mb-2"></i>
              <h3 className="font-semibold text-sm mb-2">Blood Sugar</h3>
              <Button 
                size="sm" 
                className="w-full bg-trust-blue hover:bg-trust-blue/90"
                onClick={() => setIsHealthModalOpen(true)}
              >
                Add Reading
              </Button>
            </div>
          </div>
          
          {/* Recent Readings */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Recent Readings</h3>
            
            {isReadingsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse bg-gray-50 rounded-xl h-16"></div>
                ))}
              </div>
            ) : healthReadings && healthReadings.length > 0 ? (
              healthReadings.slice(0, 5).map((reading) => {
                const status = getReadingStatus(
                  reading.type, 
                  reading.value, 
                  reading.systolic, 
                  reading.diastolic
                );
                
                return (
                  <div key={reading.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        reading.type === 'blood_pressure' ? 'bg-health-pink' : 'bg-trust-blue'
                      }`}>
                        <i className={`fas ${
                          reading.type === 'blood_pressure' ? 'fa-heart' : 'fa-tint'
                        } text-white text-sm`}></i>
                      </div>
                      <div>
                        <div className="font-semibold">
                          {reading.type === 'blood_pressure' ? 'Blood Pressure' : 'Blood Sugar'}
                        </div>
                        <div className="text-sm text-gray-600">
                          {formatReadingTime(reading.timestamp)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">
                        {reading.type === 'blood_pressure' 
                          ? `${reading.systolic}/${reading.diastolic}`
                          : `${reading.value} mg/dL`
                        }
                      </div>
                      <div className={`text-xs ${status.color}`}>{status.label}</div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                <i className="fas fa-chart-line text-4xl mb-4 opacity-50"></i>
                <p>No health readings yet</p>
                <p className="text-sm">Add your first reading above</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Meal Tracking */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Today's Meals</h3>
          
          <div className="space-y-4">
            {mealTypes.map((meal) => {
              const completedMeal = todayMeals?.find(m => m.type === meal.type && m.completed);
              
              return (
                <div 
                  key={meal.type}
                  className={`flex items-center justify-between p-4 rounded-xl ${
                    completedMeal ? 'border border-gray-100' : 'border-2 border-dashed border-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      completedMeal 
                        ? `bg-${meal.color}` 
                        : 'bg-gray-200'
                    }`}>
                      <i className={`${meal.icon} ${
                        completedMeal ? 'text-white' : 'text-gray-400'
                      }`}></i>
                    </div>
                    <div>
                      <div className="font-semibold">{meal.label}</div>
                      <div className={`text-sm ${
                        completedMeal ? 'text-naija-green' : 'text-gray-400'
                      }`}>
                        {completedMeal ? 'Completed' : 'Pending'}
                      </div>
                    </div>
                  </div>
                  {completedMeal ? (
                    <i className="fas fa-check text-naija-green text-xl"></i>
                  ) : (
                    <Button 
                      size="sm"
                      onClick={() => handleAddMealClick(meal.type)}
                      className="bg-naija-green hover:bg-naija-green/90"
                    >
                      Add Meal
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Meal Modal */}
      <Dialog open={isMealModalOpen} onOpenChange={setIsMealModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark {selectedMealType ? selectedMealType.charAt(0).toUpperCase() + selectedMealType.slice(1) : 'Meal'} as Complete</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to mark this {selectedMealType} as completed?
            </p>
            <div className="flex space-x-3">
              <Button
                onClick={() => setIsMealModalOpen(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleMealSubmit}
                disabled={mealMutation.isPending}
                className="flex-1 bg-naija-green hover:bg-naija-green/90"
              >
                {mealMutation.isPending ? 'Marking...' : 'Mark Complete'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
