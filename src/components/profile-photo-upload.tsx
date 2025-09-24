import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

interface ProfilePhotoUploadProps {
  currentPhoto?: string;
  onPhotoUpdate?: (newPhoto: string) => void;
  children?: React.ReactNode;
}

export default function ProfilePhotoUpload({ 
  currentPhoto, 
  onPhotoUpdate,
  children 
}: ProfilePhotoUploadProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (photoData: string) => {
      const response = await apiRequest('PUT', '/api/user/profile-photo', {
        photoData
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Profile photo updated successfully!",
      });
      setIsOpen(false);
      setSelectedFile(null);
      setPreview(null);
      onPhotoUpdate?.(data.photoUrl);
      
      // Invalidate user query to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile photo",
        variant: "destructive",
      });
    }
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = reader.result as string;
      uploadMutation.mutate(base64Data);
    };
    reader.readAsDataURL(selectedFile);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const getCurrentPhotoUrl = () => {
    if (currentPhoto) {
      // Handle different photo formats
      if (currentPhoto.startsWith('http')) {
        return currentPhoto;
      } else if (currentPhoto.includes('.jpg') || currentPhoto.includes('.png')) {
        return `https://presibo-wl.vercel.app/photos/${currentPhoto}`;
      } else {
        return `https://presibo-wl.vercel.app/photos/${currentPhoto}.jpg`;
      }
    }
    return `https://presibo-wl.vercel.app/photos/male.jpg`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <i className="fas fa-camera mr-2"></i>
            Update Photo
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Profile Photo</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Current Photo */}
          <div className="text-center">
            <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden border-4 border-gray-200">
              <img 
                src={preview || getCurrentPhotoUrl()} 
                alt="Profile" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://presibo-wl.vercel.app/photos/male.jpg`;
                }}
              />
            </div>
            <p className="text-sm text-gray-600">
              {preview ? "New photo preview" : "Current photo"}
            </p>
          </div>

          {/* File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button 
              onClick={triggerFileInput}
              variant="outline" 
              className="w-full"
              disabled={uploadMutation.isPending}
            >
              <i className="fas fa-image mr-2"></i>
              Select New Photo
            </Button>

            {selectedFile && (
              <div className="space-y-2">
                <p className="text-sm text-gray-600 text-center">
                  Selected: {selectedFile.name}
                </p>
                <div className="flex space-x-2">
                  <Button 
                    onClick={handleUpload}
                    disabled={uploadMutation.isPending}
                    className="flex-1 bg-naija-green hover:bg-naija-green/90"
                  >
                    {uploadMutation.isPending ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-upload mr-2"></i>
                        Upload Photo
                      </>
                    )}
                  </Button>
                  <Button 
                    onClick={() => {
                      setSelectedFile(null);
                      setPreview(null);
                    }}
                    variant="outline"
                    disabled={uploadMutation.isPending}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="text-xs text-gray-500 text-center space-y-1">
            <p>• Choose a clear, recent photo</p>
            <p>• Maximum file size: 5MB</p>
            <p>• Supported formats: JPG, PNG, GIF</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}