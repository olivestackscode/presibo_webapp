import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import FileUploadModal from "@/components/file-upload-modal";
import AnalysisModal from "@/components/analysis-modal";
import SubscriptionPopup from "@/components/subscription-popup";
import HealthTipsPopup from "@/components/health-tips-popup";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";

import { Meal } from "@shared/schema";

interface DashboardData {
  healthScore: number;
  mealsToday: number;
  totalMealsExpected: number;
  recentBloodPressure: string | null;
  recentBloodSugar: string | null;
  healthRisks: string[];
  recentAnalyses: any[];
}

interface FoodRecommendation {
  name: string;
  description: string;
  healthScore: number;
  benefits: string[];
}

export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isSubscriptionPopupOpen, setIsSubscriptionPopupOpen] = useState(false);
  const [subscriptionMessage, setSubscriptionMessage] = useState('');
  const [isHealthTipsPopupOpen, setIsHealthTipsPopupOpen] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const mealTypes = [
    { type: 'breakfast', icon: 'fas fa-sun', color: 'golden-yellow', label: 'Breakfast' },
    { type: 'lunch', icon: 'fas fa-sun', color: 'warm-orange', label: 'Lunch' },
    { type: 'dinner', icon: 'fas fa-moon', color: 'royal-purple', label: 'Dinner' }
  ];

  // Fetch Nigerian food recommendations (rotates every 6 hours)
  const { data: rotationFoods } = useQuery({
    queryKey: ['/api/nigerian-foods/rotation'],
    refetchInterval: 6 * 60 * 60 * 1000, // Refetch every 6 hours
  });

  // Fetch user fitness goals
  const { data: fitnessGoals } = useQuery({
    queryKey: [`/api/fitness-goals/${user?.id}`],
    enabled: !!user?.id,
  });

  // Fetch dashboard data
  const { data: dashboardData, isLoading: isDashboardLoading } = useQuery<DashboardData>({
    queryKey: [`/api/dashboard/${user?.id}`],
    enabled: !!user?.id,
  });

  // Fetch today's meals for detailed meal tracking
  const { data: todayMeals } = useQuery<Meal[]>({
    queryKey: [`/api/meals/${user?.id}/${today}`],
    enabled: !!user?.id,
  });

  // Fetch health tip
  const { data: healthTipData } = useQuery({
    queryKey: [`/api/health-tip?userId=${user?.id}`],
    enabled: !!user?.id,
  });

  // Fetch health tips subscription status
  const { data: healthTipsSubscription } = useQuery({
    queryKey: ['/api/health-tips-subscriptions/user'],
    enabled: !!user?.id,
    retry: false,
  });

  // Fetch food recommendations
  const { data: foodRecommendations } = useQuery<FoodRecommendation[]>({
    queryKey: [`/api/food-recommendations?goals=diabetes,hypertension`],
  });

  const queryClient = useQueryClient();

  // Auto-show health tips popup is disabled - using direct redirect after signup instead

  // Meal mutation for marking meals as complete
  const mealMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/meals', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/meals/${user?.id}/${today}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/dashboard/${user?.id}`] });
    },
  });

  const handleMarkMealComplete = async (mealType: string) => {
    if (!user?.id) return;
    try {
      await mealMutation.mutateAsync({
        userId: user.id,
        type: mealType,
        completed: true,
        date: today
      });
    } catch (error) {
      console.error('Failed to mark meal as complete:', error);
    }
  };

  const formatName = (name: string | undefined | null): string => {
    if (!name) return '';
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const getCurrentGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getBloodPressureStatus = (bpReading: string | null | undefined) => {
    if (!bpReading || bpReading === '--/--') {
      return { label: 'No Data', color: 'text-gray-500' };
    }
    
    const [systolicStr, diastolicStr] = bpReading.split('/');
    const systolic = parseInt(systolicStr);
    const diastolic = parseInt(diastolicStr);
    
    if (isNaN(systolic) || isNaN(diastolic)) {
      return { label: 'Invalid', color: 'text-gray-500' };
    }
    
    if (systolic < 120 && diastolic < 80) {
      return { label: 'Normal', color: 'text-naija-green' };
    }
    if (systolic < 140 || diastolic < 90) {
      return { label: 'Elevated', color: 'text-warm-orange' };
    }
    return { label: 'High', color: 'text-red-500' };
  };

  const getBloodSugarStatus = (bsReading: string | null | undefined) => {
    if (!bsReading || bsReading === '-- mg/dL' || bsReading === 'null mg/dL') {
      return { label: 'No Data', color: 'text-gray-500' };
    }
    
    const value = parseFloat(bsReading.replace(' mg/dL', '').replace('null', ''));
    
    if (isNaN(value)) {
      return { label: 'Invalid', color: 'text-gray-500' };
    }
    
    if (value < 100) {
      return { label: 'Normal', color: 'text-naija-green' };
    }
    if (value < 126) {
      return { label: 'Prediabetes', color: 'text-warm-orange' };
    }
    return { label: 'Diabetes Range', color: 'text-red-500' };
  };

  const handlePhotoCapture = async (photoData: string) => {
    setCapturedPhoto(photoData);
    
    // Immediately show the analysis modal with loading state
    setAnalysisData({
      isLoading: true,
      foodName: 'Analyzing...',
      description: 'AI is analyzing your food image...',
      foodClass: 'Loading',
      healthScore: 0,
      bloodPressureRisk: 'low',
      diabetesRisk: 'low',
      calories: 0,
      carbs: 0,
      protein: 0,
      fat: 0,
      fiber: 0,
      nutrients: { vitamins: [], minerals: [], other: [] },
      dailyPortionRecommendation: 'Processing...',
      bloodPressureAnalysis: 'Analyzing...',
      diabetesAnalysis: 'Analyzing...',
      recommendations: [],
      nigerianFoodAlternatives: [],
      healthierAlternatives: [],
      warnings: []
    });
    setIsAnalysisOpen(true);
    
    if (!user?.id) return;
    try {
      const response = await apiRequest('POST', '/api/analyze-food', {
        image: photoData,
        userId: user.id,
        mealType: 'snack'
      });
      
      if (response.status === 402) {
        // Usage limit reached - show subscription popup
        const errorData = await response.json();
        setSubscriptionMessage(errorData.message || 'You have reached your free usage limit for food analysis.');
        setIsAnalysisOpen(false);
        setIsSubscriptionPopupOpen(true);
        return;
      }
      
      const analysisResult = await response.json();
      setAnalysisData({ ...analysisResult, isLoading: false });
      
      // Invalidate queries to refresh dashboard data
      queryClient.invalidateQueries({ queryKey: [`/api/dashboard/${user.id}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/food-analyses/${user.id}`] });
    } catch (error: any) {
      console.error('Food analysis failed:', error);
      
      // Check if it's a subscription error
      if (error.status === 402) {
        setSubscriptionMessage('You have reached your free usage limit for food analysis. Subscribe to continue analyzing foods.');
        setIsAnalysisOpen(false);
        setIsSubscriptionPopupOpen(true);
        return;
      }
      
      setAnalysisData({
        isLoading: false,
        error: true,
        foodName: 'Analysis Failed',
        description: 'Unable to analyze this image. Please try again with a clearer photo.',
        foodClass: 'Error',
        healthScore: 0,
        bloodPressureRisk: 'low',
        diabetesRisk: 'low',
        calories: 0,
        carbs: 0,
        protein: 0,
        fat: 0,
        fiber: 0,
        nutrients: { vitamins: [], minerals: [], other: [] },
        dailyPortionRecommendation: 'N/A',
        bloodPressureAnalysis: 'Analysis unavailable',
        diabetesAnalysis: 'Analysis unavailable',
        recommendations: ['Please try uploading a clearer image', 'Ensure good lighting and focus'],
        nigerianFoodAlternatives: [],
        healthierAlternatives: [],
        warnings: ['Analysis failed - image may not be clear enough']
      });
    }
  };

  const updateHealthReading = async (type: 'blood_pressure' | 'blood_sugar') => {
    // Navigate to tracking page for health reading updates
    setLocation('/tracking');
  };

  if (isDashboardLoading) {
    return (
      <div className="p-4 space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="bg-white rounded-2xl p-6 h-32"></div>
          <div className="bg-white rounded-2xl p-6 h-48"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-4 h-32"></div>
            <div className="bg-white rounded-2xl p-4 h-32"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Welcome Section */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {getCurrentGreeting()}, {formatName(user?.FirstName) || 'User'}!
              </h2>
              <p className="text-gray-600 text-sm">Let's track your health today</p>
            </div>
            <div className="text-right flex flex-col space-y-2">
              <Button 
                onClick={() => setLocation('/subscribe')}
                className="bg-golden-yellow hover:bg-golden-yellow/90 text-black text-xs px-3 py-1"
                size="sm"
              >
                <i className="fas fa-crown mr-1"></i>
                Subscribe
              </Button>
              <div>
                <div className="text-sm text-gray-500">Today</div>
                <div className="text-lg font-semibold text-naija-green">
                  {getCurrentDate()}
                </div>
              </div>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="health-gradient rounded-xl p-4 text-white">
              <div className="flex items-center space-x-2">
                <i className="fas fa-apple-alt"></i>
                <span className="text-sm">Health Score</span>
              </div>
              <div className="text-2xl font-bold mt-1">
                {dashboardData?.healthScore || '8.2'}
              </div>
              <div className="text-xs opacity-90">Excellent</div>
            </div>
            <div className="info-gradient rounded-xl p-4 text-white">
              <div className="flex items-center space-x-2">
                <i className="fas fa-utensils"></i>
                <span className="text-sm">Meals Today</span>
              </div>
              <div className="text-2xl font-bold mt-1">
                {dashboardData?.mealsToday || 0}/{dashboardData?.totalMealsExpected || 3}
              </div>
              <div className="text-xs opacity-90">
                {(dashboardData?.mealsToday || 0) < (dashboardData?.totalMealsExpected || 3) 
                  ? 'More meals needed' : 'All meals complete'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File Upload Section */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <i className="fas fa-upload text-warm-orange mr-2"></i>
            Analyze Your Food
          </h3>
          
          {/* Upload Preview Area */}
          <div className="camera-preview rounded-xl h-48 mb-4 flex items-center justify-center relative overflow-hidden">
            <div className="text-center text-white">
              <i className="fas fa-upload text-4xl mb-2 opacity-70"></i>
              <p className="text-sm opacity-90">Tap to upload your meal photo</p>
            </div>
            <Button
              onClick={() => setIsUploadOpen(true)}
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50"
            >
              <i className="fas fa-upload text-naija-green text-xl"></i>
            </Button>
          </div>
          
          {/* Recent Analysis */}
          {dashboardData?.recentAnalyses && dashboardData.recentAnalyses.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-gray-700">My Recent Analysis</h4>
              {dashboardData.recentAnalyses.slice(0, 1).map((analysis) => (
                <div key={analysis.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 bg-gradient-to-br from-warm-orange to-golden-yellow rounded-lg flex items-center justify-center">
                    <i className="fas fa-utensils text-white"></i>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{analysis.foodName}</div>
                    <div className="text-xs text-gray-600">
                      {analysis.mealType} • {new Date(analysis.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-naija-green">{analysis.healthScore}</div>
                    <div className="text-xs text-gray-500">Score</div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
                      onClick={() => handleMarkMealComplete(meal.type)}
                      disabled={mealMutation.isPending}
                      className="bg-naija-green hover:bg-naija-green/90"
                    >
                      {mealMutation.isPending ? 'Marking...' : 'Mark Complete'}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Health Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-sm">Blood Pressure</h4>
              <i className="fas fa-heart text-health-pink"></i>
            </div>
            <div className="text-xl font-bold text-gray-800">
              {dashboardData?.recentBloodPressure || '--/--'}
            </div>
            <div className={`text-xs mt-1 ${getBloodPressureStatus(dashboardData?.recentBloodPressure).color}`}>
              {getBloodPressureStatus(dashboardData?.recentBloodPressure).label}
            </div>
            <Button
              onClick={() => updateHealthReading('blood_pressure')}
              className="w-full mt-3 py-2 bg-gray-100 text-gray-700 text-xs font-medium hover:bg-gray-200"
              variant="ghost"
            >
              Update
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-sm">Blood Sugar</h4>
              <i className="fas fa-tint text-trust-blue"></i>
            </div>
            <div className="text-xl font-bold text-gray-800">
              {dashboardData?.recentBloodSugar || '-- mg/dL'}
            </div>
            <div className={`text-xs mt-1 ${getBloodSugarStatus(dashboardData?.recentBloodSugar).color}`}>
              {getBloodSugarStatus(dashboardData?.recentBloodSugar).label}
            </div>
            <Button
              onClick={() => updateHealthReading('blood_sugar')}
              className="w-full mt-3 py-2 bg-gray-100 text-gray-700 text-xs font-medium hover:bg-gray-200"
              variant="ghost"
            >
              Update
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Daily Health Tip */}
      <div className="warning-gradient rounded-2xl p-6 text-white">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <i className="fas fa-lightbulb text-lg"></i>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold mb-2">Today's Health Tip</h4>
            <p className="text-sm opacity-95">
              {(healthTipData as any)?.tip || "Try replacing white rice with brown rice or yam for better blood sugar control. Nigerian foods like plantain and sweet potato are excellent alternatives!"}
            </p>
          </div>
        </div>
      </div>

      {/* Nigerian Food Recommendations */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <i className="fas fa-star text-golden-yellow mr-2"></i>
            Recommended Nigerian Foods
          </h3>
          
          <div className="space-y-3">
            {foodRecommendations?.slice(0, 2).map((food, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 border border-gray-100 rounded-lg">
                <div className="w-12 h-12 bg-gradient-to-br from-naija-green to-trust-blue rounded-lg flex items-center justify-center">
                  <i className="fas fa-leaf text-white"></i>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{food.name}</div>
                  <div className="text-xs text-gray-600">{food.description}</div>
                </div>
                <div className="flex items-center space-x-1">
                  <i className="fas fa-star text-golden-yellow text-xs"></i>
                  <span className="text-xs font-medium">{food.healthScore}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Nigerian Food Recommendations */}
      {rotationFoods && rotationFoods.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-naija-green rounded-full flex items-center justify-center">
                  <i className="fas fa-globe-africa text-white text-sm"></i>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">Nigerian Food Recommendations</h3>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                Updated {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            
            <div className="space-y-3">
              {rotationFoods.slice(0, 3).map((food: any, index: number) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-naija-green rounded-full flex items-center justify-center">
                    <i className="fas fa-drumstick-bite text-white text-sm"></i>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{food.name}</div>
                    <div className="text-xs text-gray-600">{food.description}</div>
                    <div className="text-xs text-naija-green font-medium">{food.category}</div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1">
                      <i className="fas fa-heart text-red-500 text-xs"></i>
                      <span className="text-xs font-medium">{food.healthRating}/10</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Food Feeds Button */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-naija-green rounded-full flex items-center justify-center">
                <i className="fas fa-users text-white text-sm"></i>
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Community Food Feeds</h3>
                <p className="text-xs text-gray-600">Discover what others are eating</p>
              </div>
            </div>
            <Button
              onClick={() => setLocation("/food")}
              className="bg-naija-green hover:bg-naija-green/90 text-white px-4 py-2"
            >
              <i className="fas fa-eye mr-2"></i>
              View Feed
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Daily Fitness Goal */}
      {fitnessGoals && fitnessGoals.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-golden-yellow rounded-full flex items-center justify-center">
                  <i className="fas fa-walking text-black text-sm"></i>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">Daily Fitness Goal</h3>
                  <p className="text-xs text-gray-600">Keep moving for better health</p>
                </div>
              </div>
              <Button 
                onClick={() => setLocation('/fitness')}
                size="sm"
                variant="outline"
                className="text-xs"
              >
                View All
              </Button>
            </div>
            
            {fitnessGoals.slice(0, 1).map((goal: any) => {
              const progress = goal.current || 0;
              const target = goal.target || 10000;
              const percentage = Math.min((progress / target) * 100, 100);
              
              return (
                <div key={goal.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm">{goal.type === 'steps' ? '10,000 Steps Daily' : goal.type}</div>
                      <div className="text-xs text-gray-600">{progress.toLocaleString()} / {target.toLocaleString()} {goal.unit}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-naija-green">{Math.round(percentage)}%</div>
                      <div className="text-xs text-gray-500">Complete</div>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-naija-green to-golden-yellow h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  
                  {goal.isCompleted && (
                    <div className="flex items-center space-x-1 text-naija-green text-xs">
                      <i className="fas fa-check-circle"></i>
                      <span>Goal completed today!</span>
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <FileUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onPhotoCapture={handlePhotoCapture}
      />

      <AnalysisModal
        isOpen={isAnalysisOpen}
        onClose={() => setIsAnalysisOpen(false)}
        analysisData={analysisData}
        photoUrl={capturedPhoto || undefined}
      />

      <SubscriptionPopup
        isOpen={isSubscriptionPopupOpen}
        onClose={() => setIsSubscriptionPopupOpen(false)}
        message={subscriptionMessage}
        feature="food_analysis"
      />

      <HealthTipsPopup
        isOpen={isHealthTipsPopupOpen}
        onClose={() => setIsHealthTipsPopupOpen(false)}
      />
    </div>
  );
}
