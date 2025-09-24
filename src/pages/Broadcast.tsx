import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Mail, Users, UserCheck, ExternalLink, Send, Loader2 } from "lucide-react";

interface RecipientCounts {
  users: number;
  doctors: number;
}

interface BroadcastResponse {
  success: boolean;
  message: string;
  sent: number;
  failed: number;
  totalRecipients: number;
}

export default function Broadcast() {
  const [recipientType, setRecipientType] = useState<string>("");
  const [subject, setSubject] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [externalEmails, setExternalEmails] = useState<string>("");
  
  const { toast } = useToast();

  // Fetch recipient counts
  const { data: recipientCounts, isLoading: countsLoading } = useQuery<RecipientCounts>({
    queryKey: ["/api/broadcast-email/recipients"],
    retry: false
  });

  // Send broadcast email mutation
  const sendBroadcastMutation = useMutation({
    mutationFn: async (data: {
      recipientType: string;
      subject: string;
      message: string;
      externalEmails?: string[];
    }) => {
      const response = await apiRequest("POST", "/api/broadcast-email", data);
      return await response.json() as BroadcastResponse;
    },
    onSuccess: (result) => {
      toast({
        title: "Broadcast Email Sent!",
        description: `Successfully sent to ${result.sent} recipients${result.failed > 0 ? `, ${result.failed} failed` : ''}`,
        variant: result.success ? "default" : "destructive"
      });
      
      // Reset form on success
      if (result.success) {
        setRecipientType("");
        setSubject("");
        setMessage("");
        setExternalEmails("");
      }
    },
    onError: (error: any) => {
      toast({
        title: "Broadcast Failed",
        description: error.message || "Failed to send broadcast email",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!recipientType || !subject || !message) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    let emailList: string[] | undefined;
    if (recipientType === 'external') {
      if (!externalEmails.trim()) {
        toast({
          title: "Missing External Emails",
          description: "Please provide email addresses for external recipients",
          variant: "destructive"
        });
        return;
      }
      
      // Parse comma-separated emails and filter valid ones
      emailList = externalEmails
        .split(',')
        .map(email => email.trim())
        .filter(email => email.includes('@'));
        
      if (emailList.length === 0) {
        toast({
          title: "Invalid Emails",
          description: "Please provide valid email addresses",
          variant: "destructive"
        });
        return;
      }
    }

    sendBroadcastMutation.mutate({
      recipientType,
      subject,
      message,
      externalEmails: emailList
    });
  };

  const getRecipientCount = () => {
    if (!recipientCounts) return 0;
    switch (recipientType) {
      case 'users':
        return recipientCounts.users;
      case 'doctors':
        return recipientCounts.doctors;
      case 'external':
        return externalEmails
          .split(',')
          .map(email => email.trim())
          .filter(email => email.includes('@')).length;
      default:
        return 0;
    }
  };

  const getRecipientIcon = () => {
    switch (recipientType) {
      case 'users':
        return <Users className="h-4 w-4" />;
      case 'doctors':
        return <UserCheck className="h-4 w-4" />;
      case 'external':
        return <ExternalLink className="h-4 w-4" />;
      default:
        return <Mail className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">📧 Broadcast Email</h1>
          <p className="text-gray-600">Send emails to Presibo users, doctors, or external recipients</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-6 w-6" />
              Compose Broadcast Message
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-6 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Recipient Type Selection */}
              <div className="space-y-2">
                <Label htmlFor="recipientType" className="text-sm font-medium text-gray-700">
                  Select Recipients *
                </Label>
                <Select 
                  value={recipientType} 
                  onValueChange={setRecipientType}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose recipient group..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="users">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        All Presibo Users
                        {!countsLoading && recipientCounts && (
                          <span className="text-sm text-gray-500">({recipientCounts.users})</span>
                        )}
                      </div>
                    </SelectItem>
                    <SelectItem value="doctors">
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4" />
                        All Doctors
                        {!countsLoading && recipientCounts && (
                          <span className="text-sm text-gray-500">({recipientCounts.doctors})</span>
                        )}
                      </div>
                    </SelectItem>
                    <SelectItem value="external">
                      <div className="flex items-center gap-2">
                        <ExternalLink className="h-4 w-4" />
                        External Emails
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                
                {recipientType && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                    {getRecipientIcon()}
                    <span>
                      Recipients: {countsLoading ? '...' : getRecipientCount()}
                    </span>
                  </div>
                )}
              </div>

              {/* External Emails Input */}
              {recipientType === 'external' && (
                <div className="space-y-2">
                  <Label htmlFor="externalEmails" className="text-sm font-medium text-gray-700">
                    Email Addresses *
                  </Label>
                  <Textarea
                    id="externalEmails"
                    placeholder="Enter email addresses separated by commas (e.g., user1@example.com, user2@example.com)"
                    value={externalEmails}
                    onChange={(e) => setExternalEmails(e.target.value)}
                    className="min-h-[80px] resize-y"
                  />
                  <p className="text-xs text-gray-500">
                    Separate multiple email addresses with commas
                  </p>
                </div>
              )}

              {/* Subject Input */}
              <div className="space-y-2">
                <Label htmlFor="subject" className="text-sm font-medium text-gray-700">
                  Subject *
                </Label>
                <Input
                  id="subject"
                  placeholder="Enter email subject..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Message Textarea */}
              <div className="space-y-2">
                <Label htmlFor="message" className="text-sm font-medium text-gray-700">
                  Type your Message *
                </Label>
                <Textarea
                  id="message"
                  placeholder="Type your message here... This will be formatted with the default Presibo email template with purple branding."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-[200px] resize-y"
                />
                <p className="text-xs text-gray-500">
                  Your message will be formatted with Presibo's professional email template and purple branding
                </p>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={sendBroadcastMutation.isPending || !recipientType || !subject || !message}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-3 text-lg"
                >
                  {sendBroadcastMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Sending...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Send className="h-5 w-5" />
                      Send Broadcast Email
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Email Template Information:</p>
                <ul className="space-y-1 text-blue-700">
                  <li>• All emails use Presibo's professional template with purple gradient branding</li>
                  <li>• Emails are sent from "Presibo Support" &lt;support@presibo.com&gt;</li>
                  <li>• Automatic BCC to support@presibo.com and presibohealth@gmail.com</li>
                  <li>• Messages are automatically formatted with proper styling and footer</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}