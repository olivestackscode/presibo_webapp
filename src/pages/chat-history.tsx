import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Clock, AlertTriangle, User, Bot, ArrowLeft, Calendar } from "lucide-react";
import { Link } from "wouter";

export default function ChatHistory() {
  const { user } = useAuth();
  const [selectedSession, setSelectedSession] = useState<string | null>(null);

  // Fetch all user's AI chat history
  const { data: chatHistory, isLoading } = useQuery({
    queryKey: ['/api/ai-chats/user'],
    enabled: !!user
  });

  // Fetch specific session chats when a session is selected
  const { data: sessionChats } = useQuery({
    queryKey: ['/api/ai-chats/session', selectedSession],
    enabled: !!selectedSession
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-healing-mint via-soft-lavender to-gentle-peach p-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">Please log in to view your chat history</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Group chats by session
  const sessions = Array.isArray(chatHistory) && chatHistory.length > 0 
    ? Array.from(new Set(chatHistory.map((chat: any) => chat.sessionId))) 
    : [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-healing-mint via-soft-lavender to-gentle-peach p-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">Loading chat history...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (selectedSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-healing-mint via-soft-lavender to-gentle-peach p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedSession(null)}
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
              <h1 className="text-2xl font-bold text-gray-800">Chat Session</h1>
            </div>
            <Link href="/ai-doc">
              <Button className="bg-naija-green hover:bg-naija-green/90 text-white">
                <MessageCircle className="w-4 h-4 mr-1" />
                New Chat
              </Button>
            </Link>
          </div>

          {/* Session Chat Messages */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageCircle className="w-5 h-5" />
                <span>Session: {selectedSession.slice(0, 8)}...</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] pr-4">
                {Array.isArray(sessionChats) && sessionChats.length > 0 ? (
                  <div className="space-y-4">
                    {sessionChats.map((chat: any) => (
                      <div key={chat.id} className={`flex ${chat.messageType === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-lg p-4 ${
                          chat.messageType === 'user' 
                            ? 'bg-naija-green text-white ml-12' 
                            : 'bg-white border border-gray-200 mr-12'
                        }`}>
                          <div className="flex items-center space-x-2 mb-2">
                            {chat.messageType === 'user' ? (
                              <User className="w-4 h-4" />
                            ) : (
                              <Bot className="w-4 h-4" />
                            )}
                            <span className="text-sm font-medium">
                              {chat.messageType === 'user' ? 'You' : 'AI Doctor'}
                            </span>
                            <span className="text-xs opacity-70">
                              {formatDate(chat.timestamp)}
                            </span>
                          </div>
                          <div className="text-sm whitespace-pre-wrap">
                            {chat.message}
                          </div>
                          {chat.messageType === 'assistant' && chat.severity && (
                            <div className="mt-2 flex items-center space-x-2">
                              <Badge className={getSeverityColor(chat.severity)}>
                                {chat.severity} severity
                              </Badge>
                              {chat.shouldSeekImmediate && (
                                <Badge className="bg-red-100 text-red-800">
                                  <AlertTriangle className="w-3 h-3 mr-1" />
                                  Seek immediate care
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    No messages found in this session
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-healing-mint via-soft-lavender to-gentle-peach p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-gray-800">AI Chat History</h1>
            <Badge variant="outline">{sessions.length} sessions</Badge>
          </div>
          <Link href="/ai-doc">
            <Button className="bg-naija-green hover:bg-naija-green/90 text-white">
              <MessageCircle className="w-4 h-4 mr-1" />
              New Chat
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-naija-green mx-auto mb-4"></div>
              <p className="text-gray-500">Loading chat history...</p>
            </CardContent>
          </Card>
        ) : sessions.length > 0 ? (
          <div className="space-y-4">
            {sessions.map((sessionId: string) => {
              const sessionChats = Array.isArray(chatHistory) 
                ? chatHistory.filter((chat: any) => chat.sessionId === sessionId) 
                : [];
              const lastChat = sessionChats && sessionChats.length > 0 ? sessionChats[sessionChats.length - 1] : null;
              const firstChat = sessionChats && sessionChats.length > 0 ? sessionChats[0] : null;
              const hasHighSeverity = sessionChats && sessionChats.length > 0 && sessionChats.some((chat: any) => chat.severity === 'high');
              const hasImmediateCare = sessionChats && sessionChats.length > 0 && sessionChats.some((chat: any) => chat.shouldSeekImmediate);

              return (
                <Card key={sessionId} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedSession(sessionId)}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <MessageCircle className="w-5 h-5 text-naija-green" />
                        <div>
                          <h3 className="font-medium text-gray-800">
                            Session {sessionId.slice(0, 8)}...
                          </h3>
                          <p className="text-sm text-gray-500 flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{firstChat?.timestamp ? formatDate(firstChat.timestamp) : 'No date'}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">
                          {sessionChats ? sessionChats.length : 0} messages
                        </Badge>
                        {hasImmediateCare && (
                          <Badge className="bg-red-100 text-red-800">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Urgent
                          </Badge>
                        )}
                        {hasHighSeverity && (
                          <Badge className="bg-red-100 text-red-800">
                            High severity
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <Separator className="my-3" />
                    
                    {/* Last message preview */}
                    <div className="text-sm text-gray-600">
                      <p className="font-medium mb-1">Last message:</p>
                      <p className="truncate">
                        {lastChat?.message && lastChat.message.length > 100 
                          ? `${lastChat.message.substring(0, 100)}...` 
                          : lastChat?.message || 'No message content'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">No Chat History</h3>
              <p className="text-gray-500 mb-4">You haven't started any AI doctor conversations yet.</p>
              <Link href="/ai-doc">
                <Button className="bg-naija-green hover:bg-naija-green/90 text-white">
                  Start Your First Chat
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}