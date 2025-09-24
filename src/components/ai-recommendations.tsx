import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Brain, 
  TrendingUp, 
  Heart, 
  Activity, 
  Apple, 
  AlertTriangle, 
  CheckCircle, 
  X,
  MessageSquare,
  Sparkles
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface AiRecommendation {
  id: number;
  recommendationType: string;
  title: string;
  description: string;
  suggestedQuestions: string[];
  priority: string;
  category: string;
  basedOnSymptoms: string[];
  basedOnHistory: string[];
  confidence: number;
  isRead: boolean;
  createdAt: string;
}

interface AiRecommendationsProps {
  onSelectQuestion: (question: string) => void;
}

export default function AiRecommendations({ onSelectQuestion }: AiRecommendationsProps) {
  const [selectedRecommendation, setSelectedRecommendation] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const { data: recommendations, isLoading } = useQuery({
    queryKey: ['/api/recommendations'],
    refetchInterval: 60000, // Refresh every minute for new recommendations
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/recommendations/${id}/read`, 'PATCH'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/recommendations'] });
    }
  });

  const markAsClickedMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/recommendations/${id}/clicked`, 'PATCH'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/recommendations'] });
    }
  });

  const deleteRecommendationMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/recommendations/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/recommendations'] });
      setSelectedRecommendation(null);
    }
  });

  const handleQuestionClick = (question: string, recommendationId: number) => {
    markAsClickedMutation.mutate(recommendationId);
    onSelectQuestion(question);
  };

  const handleMarkAsRead = (id: number) => {
    markAsReadMutation.mutate(id);
  };

  const handleDismiss = (id: number) => {
    deleteRecommendationMutation.mutate(id);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'diabetes': return <TrendingUp className="w-4 h-4" />;
      case 'hypertension': return <Heart className="w-4 h-4" />;
      case 'nutrition': return <Apple className="w-4 h-4" />;
      case 'fitness': return <Activity className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'health_topic': return 'Health Topic';
      case 'follow_up': return 'Follow-up';
      case 'preventive_care': return 'Preventive Care';
      case 'lifestyle': return 'Lifestyle';
      default: return 'General';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  const recommendationList = Array.isArray(recommendations) ? recommendations : [];
  
  if (!recommendationList || recommendationList.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-0">
        <CardContent className="p-6 text-center">
          <Sparkles className="w-12 h-12 mx-auto mb-4 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            AI Recommendations Coming Soon
          </h3>
          <p className="text-gray-600 text-sm">
            Continue using our health features and I'll provide personalized recommendations based on your health data.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-500" />
          AI Recommendations
        </h3>
        <Badge variant="secondary" className="text-xs">
          {recommendationList.length} active
        </Badge>
      </div>

      <ScrollArea className="h-96">
        <div className="space-y-3">
          {recommendationList.map((rec: AiRecommendation) => (
            <Card 
              key={rec.id} 
              className={`transition-all duration-200 cursor-pointer hover:shadow-md ${
                selectedRecommendation === rec.id ? 'ring-2 ring-blue-500' : ''
              } ${
                !rec.isRead ? 'bg-blue-50/50 border-l-4 border-l-blue-500' : ''
              }`}
              onClick={() => {
                setSelectedRecommendation(selectedRecommendation === rec.id ? null : rec.id);
                if (!rec.isRead) {
                  handleMarkAsRead(rec.id);
                }
              }}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(rec.category)}
                    <CardTitle className="text-sm font-medium text-gray-800">
                      {rec.title}
                    </CardTitle>
                    {!rec.isRead && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`text-xs ${getPriorityColor(rec.priority)}`}>
                      {rec.priority}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-red-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDismiss(rec.id);
                      }}
                    >
                      <X className="w-3 h-3 text-gray-500" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {getTypeLabel(rec.recommendationType)}
                  </Badge>
                  <Badge variant="outline" className="text-xs capitalize">
                    {rec.category}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {Math.round(rec.confidence * 100)}% confidence
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <CardDescription className="text-sm text-gray-600 mb-3">
                  {rec.description}
                </CardDescription>

                {selectedRecommendation === rec.id && (
                  <div className="space-y-3 animate-in fade-in duration-200">
                    <Separator />
                    
                    {rec.basedOnSymptoms && rec.basedOnSymptoms.length > 0 && (
                      <div>
                        <h4 className="text-xs font-medium text-gray-700 mb-1">Based on symptoms:</h4>
                        <div className="flex flex-wrap gap-1">
                          {rec.basedOnSymptoms.map((symptom, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {symptom}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {rec.basedOnHistory && rec.basedOnHistory.length > 0 && (
                      <div>
                        <h4 className="text-xs font-medium text-gray-700 mb-1">Based on history:</h4>
                        <div className="flex flex-wrap gap-1">
                          {rec.basedOnHistory.map((item, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {item}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {rec.suggestedQuestions && rec.suggestedQuestions.length > 0 && (
                      <div>
                        <h4 className="text-xs font-medium text-gray-700 mb-2 flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          Suggested Questions:
                        </h4>
                        <div className="space-y-2">
                          {rec.suggestedQuestions.map((question, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              className="w-full text-left justify-start h-auto p-2 text-xs hover:bg-blue-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleQuestionClick(question, rec.id);
                              }}
                            >
                              {question}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="text-xs text-gray-500">
                      Generated {new Date(rec.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}