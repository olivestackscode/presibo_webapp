import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface AnalysisData {
  id?: number;
  isLoading?: boolean;
  error?: boolean;
  foodName: string;
  description: string;
  foodClass: string;
  healthScore: number;
  bloodPressureRisk: 'low' | 'medium' | 'high';
  diabetesRisk: 'low' | 'medium' | 'high';
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  fiber: number;
  nutrients: {
    vitamins: string[];
    minerals: string[];
    other: string[];
  };
  dailyPortionRecommendation: string;
  bloodPressureAnalysis: string;
  diabetesAnalysis: string;
  recommendations: string[];
  nigerianFoodAlternatives?: string[];
  healthierAlternatives?: string[];
  warnings?: string[];
  timestamp?: Date;
}

interface AnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysisData: AnalysisData | null;
  photoUrl?: string;
}

export default function AnalysisModal({ 
  isOpen, 
  onClose, 
  analysisData, 
  photoUrl 
}: AnalysisModalProps) {
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareCaption, setShareCaption] = useState("");
  const [shareLocation, setShareLocation] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const { toast } = useToast();

  if (!isOpen || !analysisData) return null;

  const handleShareFood = async () => {
    if (!analysisData.id) {
      toast({
        title: "Cannot share",
        description: "This food analysis cannot be shared",
        variant: "destructive",
      });
      return;
    }

    setIsSharing(true);
    try {
      const response = await fetch(`/api/food-analyses/${analysisData.id}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          caption: shareCaption,
          location: shareLocation,
        }),
      });

      if (response.ok) {
        toast({
          title: "Food shared successfully!",
          description: "Your food analysis has been shared to the food feed",
        });
        setShowShareDialog(false);
        setShareCaption("");
        setShareLocation("");
        onClose();
      } else {
        const error = await response.json();
        toast({
          title: "Failed to share",
          description: error.error || "Something went wrong",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Failed to share",
        description: "Network error. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-naija-green bg-green-50';
      case 'medium': return 'text-warm-orange bg-orange-50';  
      case 'high': return 'text-red-500 bg-red-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  const getRiskLabel = (risk: string) => {
    return risk.charAt(0).toUpperCase() + risk.slice(1) + ' Risk';
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 8) return 'from-naija-green to-green-600';
    if (score >= 6) return 'from-warm-orange to-orange-600';
    return 'from-red-500 to-red-600';
  };

  const getHealthScoreLabel = (score: number) => {
    if (score >= 8) return 'Excellent Choice!';
    if (score >= 6) return 'Good Choice!';
    return 'Consider Alternatives';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center rounded-t-xl">
          <h2 className="text-2xl font-bold text-gray-800">Food Analysis Report</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <i className="fas fa-times text-gray-500"></i>
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Food Photo */}
          {photoUrl && (
            <div className="text-center relative">
              <img 
                src={photoUrl} 
                alt="Analyzed food" 
                className="w-64 h-64 object-cover rounded-xl mx-auto border-4 border-gray-100 shadow-lg"
              />
              {analysisData.isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-xl">
                  <div className="text-center text-white">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4"></div>
                    <p className="font-medium">Analyzing your food...</p>
                    <p className="text-sm opacity-75">Please wait while AI processes the image</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Food Name & Class */}
          <div className="text-center">
            {analysisData.isLoading ? (
              <div className="space-y-3">
                <div className="h-8 bg-gray-200 rounded-lg w-64 mx-auto animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded-full w-32 mx-auto animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-96 mx-auto animate-pulse"></div>
              </div>
            ) : (
              <>
                <h3 className="text-3xl font-bold text-gray-800 mb-2">{analysisData.foodName}</h3>
                <div className={`inline-block text-white px-6 py-2 rounded-full text-lg font-medium mb-3 ${
                  analysisData.error ? 'bg-red-500' : 'bg-naija-green'
                }`}>
                  {analysisData.foodClass}
                </div>
                <p className="text-gray-600 max-w-2xl mx-auto">{analysisData.description}</p>
              </>
            )}
          </div>

          {/* Health Score */}
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                {analysisData.isLoading ? (
                  <div className="space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-48 mx-auto animate-pulse"></div>
                    <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto animate-pulse"></div>
                    <div className="h-5 bg-gray-200 rounded w-32 mx-auto animate-pulse"></div>
                  </div>
                ) : (
                  <>
                    <div className="text-gray-600 text-lg mb-3">Overall Health Score</div>
                    <div className={`inline-block text-white px-8 py-4 rounded-full bg-gradient-to-r ${getHealthScoreColor(analysisData.healthScore)} text-4xl font-bold shadow-lg`}>
                      {analysisData.healthScore}/10
                    </div>
                    <div className="text-lg text-gray-600 mt-3 font-medium">
                      {analysisData.healthScore >= 8 ? 'Excellent Choice!' : 
                       analysisData.healthScore >= 6 ? 'Good Choice!' : 'Consider Alternatives'}
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Nutritional Information */}
          <Card>
            <CardContent className="p-6">
              <h4 className="text-xl font-semibold mb-6 text-gray-800 flex items-center">
                <i className="fas fa-chart-pie mr-3 text-blue-600"></i>
                Nutritional Information
              </h4>
              {analysisData.isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="text-center p-4 bg-gray-50 rounded-xl animate-pulse">
                      <div className="h-8 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <div className="text-center p-4 bg-orange-50 rounded-xl border border-orange-200">
                  <div className="text-3xl font-bold text-orange-600">{analysisData.calories}</div>
                  <div className="text-sm text-orange-700 font-medium">Calories</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="text-3xl font-bold text-blue-600">{analysisData.carbs}g</div>
                  <div className="text-sm text-blue-700 font-medium">Carbs</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="text-3xl font-bold text-green-600">{analysisData.protein}g</div>
                  <div className="text-sm text-green-700 font-medium">Protein</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-200">
                  <div className="text-3xl font-bold text-purple-600">{analysisData.fat}g</div>
                  <div className="text-sm text-purple-700 font-medium">Fat</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                  <div className="text-3xl font-bold text-yellow-600">{analysisData.fiber}g</div>
                  <div className="text-sm text-yellow-700 font-medium">Fiber</div>
                </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Key Nutrients */}
          <Card>
            <CardContent className="p-6">
              <h4 className="text-xl font-semibold mb-6 text-gray-800 flex items-center">
                <i className="fas fa-leaf mr-3 text-green-600"></i>
                Key Nutrients
              </h4>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h5 className="font-semibold text-green-600 mb-3 flex items-center">
                    <i className="fas fa-vitamin mr-2"></i>
                    Vitamins
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {analysisData.nutrients.vitamins.map((vitamin, index) => (
                      <span key={index} className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                        {vitamin}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h5 className="font-semibold text-blue-600 mb-3 flex items-center">
                    <i className="fas fa-gem mr-2"></i>
                    Minerals
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {analysisData.nutrients.minerals.map((mineral, index) => (
                      <span key={index} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                        {mineral}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h5 className="font-semibold text-purple-600 mb-3 flex items-center">
                    <i className="fas fa-plus mr-2"></i>
                    Other
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {analysisData.nutrients.other.map((nutrient, index) => (
                      <span key={index} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                        {nutrient}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Daily Portion Recommendation */}
          <Card>
            <CardContent className="p-6">
              <h4 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
                <i className="fas fa-utensils mr-3 text-orange-600"></i>
                Daily Portion Recommendation
              </h4>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                <div className="flex items-center">
                  <i className="fas fa-plate-wheat text-blue-600 text-2xl mr-4"></i>
                  <span className="text-blue-800 font-semibold text-lg">{analysisData.dailyPortionRecommendation}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Health Safety Analysis */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <i className="fas fa-heartbeat text-red-500 text-xl mr-3"></i>
                  <h4 className="text-xl font-semibold text-gray-800">Blood Pressure Safety</h4>
                </div>
                <div className={`p-4 rounded-xl ${getRiskColor(analysisData.bloodPressureRisk)} mb-4`}>
                  <div className="font-semibold text-lg text-center">{getRiskLabel(analysisData.bloodPressureRisk)}</div>
                </div>
                <p className="text-gray-700 leading-relaxed">{analysisData.bloodPressureAnalysis}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <i className="fas fa-tint text-blue-500 text-xl mr-3"></i>
                  <h4 className="text-xl font-semibold text-gray-800">Diabetes Safety</h4>
                </div>
                <div className={`p-4 rounded-xl ${getRiskColor(analysisData.diabetesRisk)} mb-4`}>
                  <div className="font-semibold text-lg text-center">{getRiskLabel(analysisData.diabetesRisk)}</div>
                </div>
                <p className="text-gray-700 leading-relaxed">{analysisData.diabetesAnalysis}</p>
              </CardContent>
            </Card>
          </div>

          {/* Health Recommendations */}
          {analysisData.recommendations && analysisData.recommendations.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h4 className="text-xl font-semibold mb-6 text-naija-green flex items-center">
                  <i className="fas fa-lightbulb mr-3"></i>
                  Health Recommendations
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                  {analysisData.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start bg-green-50 p-4 rounded-lg border border-green-200">
                      <i className="fas fa-check text-naija-green mr-3 mt-1"></i>
                      <span className="text-gray-700 text-sm leading-relaxed">{rec}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Nigerian Food Alternatives */}
          {analysisData.nigerianFoodAlternatives && analysisData.nigerianFoodAlternatives.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h4 className="text-xl font-semibold mb-6 text-warm-orange flex items-center">
                  <i className="fas fa-flag mr-3"></i>
                  Nigerian Food Alternatives
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {analysisData.nigerianFoodAlternatives.map((food, index) => (
                    <div key={index} className="bg-orange-50 border-2 border-orange-200 p-4 rounded-xl text-center hover:bg-orange-100 transition-colors">
                      <i className="fas fa-utensils text-orange-600 mb-2"></i>
                      <div className="text-orange-700 font-semibold">{food}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Healthier Alternatives */}
          {analysisData.healthierAlternatives && analysisData.healthierAlternatives.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h4 className="text-xl font-semibold mb-6 text-green-600 flex items-center">
                  <i className="fas fa-leaf mr-3"></i>
                  Healthier Alternatives
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {analysisData.healthierAlternatives.map((food, index) => (
                    <div key={index} className="bg-green-50 border-2 border-green-200 p-4 rounded-xl text-center hover:bg-green-100 transition-colors">
                      <i className="fas fa-seedling text-green-600 mb-2"></i>
                      <div className="text-green-700 font-semibold">{food}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Warnings */}
          {analysisData.warnings && analysisData.warnings.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h4 className="text-xl font-semibold mb-6 text-red-500 flex items-center">
                  <i className="fas fa-exclamation-triangle mr-3"></i>
                  Important Warnings
                </h4>
                <div className="space-y-3">
                  {analysisData.warnings.map((warning, index) => (
                    <div key={index} className="flex items-start bg-red-50 p-4 rounded-lg border border-red-200">
                      <i className="fas fa-exclamation-circle text-red-500 mr-3 mt-1"></i>
                      <span className="text-red-700 leading-relaxed">{warning}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end space-x-3 rounded-b-xl">
          <Button variant="outline" className="px-6" onClick={() => setShowShareDialog(true)}>
            <i className="fas fa-share mr-2"></i>
            Share Report
          </Button>
          <Button onClick={onClose} className="bg-naija-green text-white px-8">
            <i className="fas fa-check mr-2"></i>
            Close Analysis
          </Button>
        </div>
      </div>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Share Your Food Analysis</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Caption (optional)</label>
              <Textarea 
                placeholder="Add a caption to your shared food analysis..."
                value={shareCaption}
                onChange={(e) => setShareCaption(e.target.value)}
                className="min-h-[80px]"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Location (optional)</label>
              <Input 
                placeholder="Where did you eat this?"
                value={shareLocation}
                onChange={(e) => setShareLocation(e.target.value)}
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setShowShareDialog(false)}
                disabled={isSharing}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleShareFood}
                disabled={isSharing}
                className="bg-naija-green text-white"
              >
                {isSharing ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Sharing...
                  </>
                ) : (
                  <>
                    <i className="fas fa-share mr-2"></i>
                    Share to Feed
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
