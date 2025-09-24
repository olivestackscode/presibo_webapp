import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";

interface WorkoutLog {
  id: number;
  userId: number;
  exercise: string;
  duration: number; // minutes
  intensity: 'low' | 'medium' | 'high';
  caloriesBurned: number;
  date: string;
  timestamp: Date;
}

interface FitnessGoal {
  id: number;
  userId: number;
  goalType: string;
  target: number;
  current: number;
  unit: string;
  deadline: string;
  isDaily?: boolean;
  isCompleted?: boolean;
  priority?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface FitnessTrainer {
  id: number;
  firstname: string;
  lastname: string;
  phone: string;
  email: string;
  specialization: string;
  cases: string;
  location: string;
  country: string;
  km: number;
  years: number;
  thumbnail: string;
  distance: string;
}

export default function Fitness() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isTrainerModalOpen, setIsTrainerModalOpen] = useState(false);
  
  const [workoutForm, setWorkoutForm] = useState({
    exercise: '',
    duration: '',
    intensity: '',
    caloriesBurned: ''
  });

  const [goalForm, setGoalForm] = useState({
    type: '',
    target: '',
    current: '',
    unit: '',
    deadline: ''
  });

  const today = new Date().toISOString().split('T')[0];
  const queryClient = useQueryClient();

  // Fetch today's workouts for this specific user
  const { data: todayWorkoutsData } = useQuery<WorkoutLog[]>({
    queryKey: [`/api/workouts/${user?.id}/${today}`],
    enabled: !!user?.id,
  });
  
  // Show empty array initially so new users start fresh, but preserve storage functionality
  const todayWorkouts: WorkoutLog[] = todayWorkoutsData || [];

  // Fetch fitness goals
  const { data: fitnessGoals } = useQuery<FitnessGoal[]>({
    queryKey: [`/api/fitness-goals/${user?.id}`],
    enabled: !!user?.id,
  });

  // Fetch fitness trainers
  const { data: trainersData } = useQuery<{ users: FitnessTrainer[] }>({
    queryKey: ['/api/fitness-trainers'],
    queryFn: async () => {
      const response = await fetch('https://presibo-wl.vercel.app/trainers.json');
      return response.json();
    },
  });

  // Workout mutation
  const workoutMutation = useMutation({
    mutationFn: async (workout: any) => {
      const response = await apiRequest('POST', '/api/workouts', workout);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/workouts/${user?.id}/${today}`] });
      setIsWorkoutModalOpen(false);
      resetWorkoutForm();
    },
  });

  // Goal mutation
  const goalMutation = useMutation({
    mutationFn: async (goal: any) => {
      const response = await apiRequest('POST', '/api/fitness-goals', goal);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/fitness-goals/${user?.id}`] });
      setIsGoalModalOpen(false);
      resetGoalForm();
    },
  });

  const resetWorkoutForm = () => {
    setWorkoutForm({
      exercise: '',
      duration: '',
      intensity: '',
      caloriesBurned: ''
    });
  };

  const resetGoalForm = () => {
    setGoalForm({
      type: '',
      target: '',
      current: '',
      unit: '',
      deadline: ''
    });
  };

  const handleWorkoutSubmit = () => {
    if (!workoutForm.exercise || !workoutForm.duration || !workoutForm.intensity) return;

    if (!user?.id) return;
    
    workoutMutation.mutate({
      userId: user.id,
      exercise: workoutForm.exercise,
      duration: parseInt(workoutForm.duration),
      intensity: workoutForm.intensity,
      caloriesBurned: parseInt(workoutForm.caloriesBurned) || 0,
      date: today
    });
  };

  const handleGoalSubmit = () => {
    if (!goalForm.type || !goalForm.target || !goalForm.deadline) return;

    if (!user?.id) return;
    
    goalMutation.mutate({
      userId: user.id,
      goalType: goalForm.type,
      target: parseFloat(goalForm.target),
      current: parseFloat(goalForm.current) || 0,
      unit: goalForm.unit,
      deadline: goalForm.deadline,
      isDaily: goalForm.type === 'steps' // Steps goals are always daily
    });
  };

  const exercises = [
    'Walking', 'Running', 'Cycling', 'Swimming', 'Weight Training',
    'Yoga', 'Pilates', 'Dancing', 'Football', 'Basketball',
    'Push-ups', 'Squats', 'Planks', 'Jumping Jacks', 'Burpees'
  ];

  const getTotalCaloriestoday = () => {
    return todayWorkouts.reduce((total, workout) => total + (workout.caloriesBurned || 0), 0);
  };

  const getTotalDurationToday = () => {
    return todayWorkouts.reduce((total, workout) => total + workout.duration, 0);
  };

  const getGoalProgress = (goal: FitnessGoal) => {
    const progress = (goal.current / goal.target) * 100;
    return Math.min(progress, 100);
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-naija-green">Fitness Tracker</h1>
        <p className="text-gray-600">Track your workouts and achieve your fitness goals</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-naija-green">{getTotalDurationToday()}</div>
            <div className="text-sm text-gray-600">Minutes Today</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-warm-orange">{getTotalCaloriestoday()}</div>
            <div className="text-sm text-gray-600">Calories Burned</div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <Button 
          onClick={() => setIsWorkoutModalOpen(true)}
          className="bg-naija-green hover:bg-naija-green/90 h-12"
        >
          <i className="fas fa-plus mr-2"></i>
          Log Workout
        </Button>
        <Button 
          onClick={() => setIsGoalModalOpen(true)}
          variant="outline"
          className="h-12"
        >
          <i className="fas fa-target mr-2"></i>
          Set Goal
        </Button>
      </div>
      
      {/* Find Trainer Button */}
      <Button 
        onClick={() => setIsTrainerModalOpen(true)}
        className="w-full bg-royal-purple hover:bg-royal-purple/90 text-white h-12 mb-4"
      >
        <i className="fas fa-search mr-2"></i>
        Find Fitness Trainer
      </Button>

      {/* Connect Devices Button */}
      <Button 
        onClick={() => window.location.href = '/market'}
        className="w-full bg-trust-blue hover:bg-trust-blue/90 text-white h-12 mb-6"
      >
        <i className="fas fa-link mr-2"></i>
        Connect Devices
      </Button>

      {/* Fitness Goals */}
      {fitnessGoals && fitnessGoals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <i className="fas fa-bullseye text-trust-blue mr-2"></i>
              Fitness Goals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {fitnessGoals.map((goal) => (
              <div key={goal.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium capitalize">{goal.goalType?.replace('_', ' ') || 'Fitness Goal'}</span>
                  <span className="text-sm text-gray-600">
                    {goal.current} / {goal.target} {goal.unit}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-naija-green h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getGoalProgress(goal)}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500">
                  Target: {goal.isDaily ? 
                    new Date().toLocaleDateString() + ' by 11:59 PM' : 
                    goal.deadline ? new Date(goal.deadline).toLocaleDateString() : 'No deadline set'
                  }
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Today's Workouts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <i className="fas fa-dumbbell text-royal-purple mr-2"></i>
            Today's Workouts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todayWorkouts && todayWorkouts.length > 0 ? (
            <div className="space-y-3">
              {todayWorkouts.map((workout) => (
                <div key={workout.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      workout.intensity === 'high' ? 'bg-red-100 text-red-600' :
                      workout.intensity === 'medium' ? 'bg-orange-100 text-orange-600' :
                      'bg-green-100 text-green-600'
                    }`}>
                      <i className="fas fa-dumbbell text-sm"></i>
                    </div>
                    <div>
                      <div className="font-medium">{workout.exercise}</div>
                      <div className="text-sm text-gray-600">
                        {workout.duration} min • {workout.intensity} intensity
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{workout.caloriesBurned}</div>
                    <div className="text-xs text-gray-500">calories</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <i className="fas fa-dumbbell text-4xl mb-4 opacity-50"></i>
              <p>No workouts logged today</p>
              <p className="text-sm">Start by adding your first workout above</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Workout Modal */}
      <Dialog open={isWorkoutModalOpen} onOpenChange={setIsWorkoutModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Workout</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="exercise">Exercise</Label>
              <Select onValueChange={(value) => setWorkoutForm(prev => ({ ...prev, exercise: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select exercise" />
                </SelectTrigger>
                <SelectContent>
                  {exercises.map((exercise) => (
                    <SelectItem key={exercise} value={exercise}>{exercise}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  placeholder="30"
                  value={workoutForm.duration}
                  onChange={(e) => setWorkoutForm(prev => ({ ...prev, duration: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="intensity">Intensity</Label>
                <Select onValueChange={(value) => setWorkoutForm(prev => ({ ...prev, intensity: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select intensity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="calories">Calories Burned (optional)</Label>
              <Input
                id="calories"
                type="number"
                placeholder="200"
                value={workoutForm.caloriesBurned}
                onChange={(e) => setWorkoutForm(prev => ({ ...prev, caloriesBurned: e.target.value }))}
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                onClick={() => setIsWorkoutModalOpen(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleWorkoutSubmit}
                disabled={workoutMutation.isPending}
                className="flex-1 bg-naija-green hover:bg-naija-green/90"
              >
                {workoutMutation.isPending ? 'Logging...' : 'Log Workout'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Goal Modal */}
      <Dialog open={isGoalModalOpen} onOpenChange={setIsGoalModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Fitness Goal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="goal-type">Goal Type</Label>
              <Select onValueChange={(value) => setGoalForm(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select goal type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weight_loss">Weight Loss</SelectItem>
                  <SelectItem value="muscle_gain">Muscle Gain</SelectItem>
                  <SelectItem value="endurance">Endurance</SelectItem>
                  <SelectItem value="general_fitness">General Fitness</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="target">Target</Label>
                <Input
                  id="target"
                  type="number"
                  placeholder="70"
                  value={goalForm.target}
                  onChange={(e) => setGoalForm(prev => ({ ...prev, target: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="current">Current</Label>
                <Input
                  id="current"
                  type="number"
                  placeholder="75"
                  value={goalForm.current}
                  onChange={(e) => setGoalForm(prev => ({ ...prev, current: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Input
                  id="unit"
                  placeholder="kg, lbs, minutes"
                  value={goalForm.unit}
                  onChange={(e) => setGoalForm(prev => ({ ...prev, unit: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deadline">Deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={goalForm.deadline}
                  onChange={(e) => setGoalForm(prev => ({ ...prev, deadline: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                onClick={() => setIsGoalModalOpen(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleGoalSubmit}
                disabled={goalMutation.isPending}
                className="flex-1 bg-naija-green hover:bg-naija-green/90"
              >
                {goalMutation.isPending ? 'Setting...' : 'Set Goal'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Trainers Modal */}
      <Dialog open={isTrainerModalOpen} onOpenChange={setIsTrainerModalOpen}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Find Fitness Trainer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {trainersData?.users?.map((trainer) => (
              <Card key={trainer.id} className="border hover:border-naija-green transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      <img 
                        src={`https://presibo-wl.vercel.app/photos/${trainer.thumbnail}.jpg`}
                        alt={`${trainer.firstname} ${trainer.lastname}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/api/placeholder/64/64';
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-800">
                          {trainer.firstname} {trainer.lastname}
                        </h3>
                        <span className="text-xs bg-naija-green text-white px-2 py-1 rounded-full">
                          {trainer.years}+yrs
                        </span>
                      </div>
                      
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center">
                          <i className="fas fa-dumbbell text-royal-purple mr-2 w-4"></i>
                          <span>{trainer.specialization}</span>
                        </div>
                        <div className="flex items-center">
                          <i className="fas fa-map-marker-alt text-warm-orange mr-2 w-4"></i>
                          <span>{trainer.location}</span>
                        </div>
                        <div className="flex items-center">
                          <i className="fas fa-route text-trust-blue mr-2 w-4"></i>
                          <span>{trainer.distance} away</span>
                        </div>
                        <div className="flex items-center">
                          <i className="fas fa-users text-golden-yellow mr-2 w-4"></i>
                          <span>{trainer.cases} clients trained</span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 mt-3">
                        <Button 
                          size="sm"
                          className="w-full bg-royal-purple hover:bg-royal-purple/90 text-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            setLocation(`/trainer/profile?id=${trainer.id}`);
                            setIsTrainerModalOpen(false);
                          }}
                        >
                          <i className="fas fa-user mr-1"></i>
                          View Profile
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {(!trainersData?.users || trainersData.users.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                <i className="fas fa-search text-4xl mb-4 opacity-50"></i>
                <p>No fitness trainers found</p>
                <p className="text-sm">Please try again later</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}