import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPhotoCapture: (photoData: string) => void;
}

export default function FileUploadModal({ isOpen, onClose, onPhotoCapture }: FileUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }

      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }

      setSelectedFile(file);
      setError(null);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !previewUrl) return;

    setIsUploading(true);
    try {
      // Convert to base64 and call the callback
      onPhotoCapture(previewUrl);
      handleClose();
    } catch (error: any) {
      setError('Failed to process image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Upload Food Image</h3>
            <Button
              onClick={handleClose}
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </Button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Upload Area */}
          {!previewUrl ? (
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                  <i className="fas fa-image text-2xl text-gray-400"></i>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Upload food image</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Select an image of your meal for AI analysis
                  </p>
                  <Button
                    onClick={triggerFileSelect}
                    className="bg-naija-green hover:bg-naija-green/90"
                  >
                    <i className="fas fa-upload mr-2"></i>
                    Choose Image
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Supports JPG, PNG, GIF (max 10MB)
                </p>
              </div>
            </div>
          ) : (
            /* Preview Area */
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Food preview"
                  className="w-full h-64 object-cover rounded-xl"
                />
                <Button
                  onClick={() => {
                    setPreviewUrl(null);
                    setSelectedFile(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 bg-white bg-opacity-80 hover:bg-opacity-100"
                >
                  <i className="fas fa-times"></i>
                </Button>
              </div>
              
              <div className="flex space-x-3">
                <Button
                  onClick={triggerFileSelect}
                  variant="outline"
                  className="flex-1"
                >
                  Choose Different Image
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="flex-1 bg-naija-green hover:bg-naija-green/90"
                >
                  {isUploading ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-brain mr-2"></i>
                      Analyze Food
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
}