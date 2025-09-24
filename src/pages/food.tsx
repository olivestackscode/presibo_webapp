import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Heart, MessageCircle, Share2, MapPin, Clock, Star, ChefHat, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface FoodPost {
  id: number;
  foodAnalysisId: number;
  userId: number;
  userName: string;
  userProfilePicture: string | null;
  caption: string | null;
  location: string | null;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  timestamp: string;
  
  // Food analysis data
  foodName: string;
  description: string;
  foodClass: string;
  healthScore: number;
  bloodPressureRisk: string;
  diabetesRisk: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  fiber: number;
  imageUrl: string | null;
  vitamins: string[];
  minerals: string[];
  otherNutrients: string[];
  dailyPortionRecommendation: string;
  recommendations: string[];
  nigerianFoodAlternatives: string[];
  healthierAlternatives: string[];
  warnings: string[];
}

function formatUserName(name: string) {
  if (!name) return "User";
  return name.toLowerCase().split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

function getHealthScoreColor(score: number) {
  if (score >= 8) return "text-green-600";
  if (score >= 6) return "text-yellow-600";
  return "text-red-600";
}

function getRiskColor(risk: string) {
  switch (risk) {
    case 'low': return "text-green-600";
    case 'medium': return "text-yellow-600";
    case 'high': return "text-red-600";
    default: return "text-gray-600";
  }
}

export default function FoodFeed() {
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  const [, navigate] = useLocation();

  const { data: posts = [], isLoading, error } = useQuery<FoodPost[]>({
    queryKey: ["/api/food-feed"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });



  const handleLike = async (postId: number) => {
    try {
      const response = await fetch(`/api/food-posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response.ok) {
        setLikedPosts(prev => {
          const newSet = new Set(prev);
          if (newSet.has(postId)) {
            newSet.delete(postId);
          } else {
            newSet.add(postId);
          }
          return newSet;
        });
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleShare = async (post: FoodPost) => {
    const shareText = `Check out this healthy food analysis: ${post.foodName} - Health Score: ${post.healthScore}/10\n\nShared via Presibo - Your smart healthcare companion`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${post.foodName} - Health Analysis`,
          text: shareText,
          url: window.location.href
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(shareText);
      alert('Food analysis link copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading food posts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <p className="text-lg font-semibold">Error loading food posts</p>
            <p className="text-sm">{error.message}</p>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="mr-2 p-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <ChefHat className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Presibo Food Feed</h1>
                <p className="text-sm text-gray-600">Discover healthy Nigerian meals</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feed */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {posts.length === 0 ? (
          <div className="text-center py-12 bg-white">
            <ChefHat className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No food posts yet</h3>
            <p className="text-gray-600">Be the first to share a food analysis!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <Card key={post.id} className="overflow-hidden bg-white border border-gray-200">
                <CardContent className="p-0">
                  {/* User Header */}
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage 
                          src={post.userProfilePicture ? 
                            `https://presibo-wl.vercel.app/photos/${post.userProfilePicture}` : 
                            undefined
                          } 
                        />
                        <AvatarFallback className="bg-green-100 text-green-600">
                          {formatUserName(post.userName).charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-gray-900">
                            {formatUserName(post.userName)}
                          </h3>
                          <Badge variant="outline" className={getHealthScoreColor(post.healthScore)}>
                            {post.healthScore}/10
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>{formatDistanceToNow(new Date(post.timestamp), { addSuffix: true })}</span>
                          {post.location && (
                            <>
                              <MapPin className="w-3 h-3 ml-2" />
                              <span>{post.location}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Food Image */}
                  {post.imageUrl && (
                    <div className="aspect-square bg-gray-100">
                      <img 
                        src={post.imageUrl} 
                        alt={post.foodName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Post Content */}
                  <div className="p-4">
                    {/* Food Name & Class */}
                    <div className="mb-3">
                      <h2 className="text-lg font-semibold text-gray-900 mb-1">
                        {post.foodName}
                      </h2>
                      <Badge variant="secondary" className="mb-2">
                        {post.foodClass}
                      </Badge>
                      {post.description && (
                        <p className="text-gray-600 text-sm">
                          {post.description}
                        </p>
                      )}
                    </div>

                    {/* Caption */}
                    {post.caption && (
                      <p className="text-gray-800 mb-3">
                        {post.caption}
                      </p>
                    )}

                    {/* Nutrition Quick Stats */}
                    <div className="grid grid-cols-4 gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <div className="text-sm font-semibold text-gray-900">{post.calories}</div>
                        <div className="text-xs text-gray-500">Calories</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-semibold text-gray-900">{post.carbs}g</div>
                        <div className="text-xs text-gray-500">Carbs</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-semibold text-gray-900">{post.protein}g</div>
                        <div className="text-xs text-gray-500">Protein</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-semibold text-gray-900">{post.fat}g</div>
                        <div className="text-xs text-gray-500">Fat</div>
                      </div>
                    </div>

                    {/* Health Risks */}
                    <div className="flex space-x-4 mb-4">
                      <div className="flex items-center space-x-1">
                        <span className="text-sm text-gray-600">BP Risk:</span>
                        <Badge variant="outline" className={getRiskColor(post.bloodPressureRisk)}>
                          {post.bloodPressureRisk}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-sm text-gray-600">Diabetes Risk:</span>
                        <Badge variant="outline" className={getRiskColor(post.diabetesRisk)}>
                          {post.diabetesRisk}
                        </Badge>
                      </div>
                    </div>

                    {/* Nigerian Alternatives */}
                    {post.nigerianFoodAlternatives && post.nigerianFoodAlternatives.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Nigerian Alternatives:</h4>
                        <div className="flex flex-wrap gap-1">
                          {post.nigerianFoodAlternatives.slice(0, 3).map((alt, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {alt}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recommendations */}
                    {post.recommendations && post.recommendations.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Health Tips:</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {post.recommendations.slice(0, 2).map((rec, index) => (
                            <li key={index} className="flex items-start space-x-1">
                              <Star className="w-3 h-3 mt-0.5 text-yellow-500 flex-shrink-0" />
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Warnings */}
                    {post.warnings && post.warnings.length > 0 && (
                      <div className="mb-4 p-3 bg-red-50 rounded-lg">
                        <h4 className="text-sm font-medium text-red-900 mb-1">⚠️ Health Warnings:</h4>
                        <div className="text-sm text-red-700">
                          {post.warnings.slice(0, 1).map((warning, index) => (
                            <p key={index}>{warning}</p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Interaction Bar */}
                  <div className="px-4 pb-4">
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <div className="flex items-center space-x-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLike(post.id)}
                          className={`flex items-center space-x-1 ${
                            likedPosts.has(post.id) ? 'text-red-600' : 'text-gray-600'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${likedPosts.has(post.id) ? 'fill-current' : ''}`} />
                          <span>{post.likesCount + (likedPosts.has(post.id) ? 1 : 0)}</span>
                        </Button>
                        
                        <Button variant="ghost" size="sm" className="flex items-center space-x-1 text-gray-600">
                          <MessageCircle className="w-4 h-4" />
                          <span>{post.commentsCount}</span>
                        </Button>
                        
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleShare(post)}
                          className="flex items-center space-x-1 text-gray-600"
                        >
                          <Share2 className="w-4 h-4" />
                          <span>Share</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}