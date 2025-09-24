import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cameraService, CameraService } from "@/lib/camera";

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPhotoCapture: (photoData: string) => void;
}

export default function CameraModal({ isOpen, onClose, onPhotoCapture }: CameraModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraStarted, setIsCameraStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && videoRef.current) {
      startCamera();
    } else if (!isOpen) {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    try {
      setError(null);
      
      // Check if navigator.mediaDevices is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported in this browser');
      }

      // Request permission first
      const hasPermission = await CameraService.requestCameraPermission();
      if (!hasPermission) {
        throw new Error('Camera permission denied. Please allow camera access and try again.');
      }

      if (videoRef.current) {
        await cameraService.startCamera(videoRef.current, {
          facingMode: 'environment'
        });
        setIsCameraStarted(true);
      }
    } catch (error: any) {
      console.error('Camera error:', error);
      let errorMessage = 'Camera access failed';
      
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Camera permission denied. Please allow camera access and refresh the page.';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No camera found on this device.';
      } else if (error.name === 'NotSupportedError') {
        errorMessage = 'Camera not supported in this browser.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    }
  };

  const stopCamera = () => {
    cameraService.stopCamera();
    setIsCameraStarted(false);
  };

  const handleCapture = () => {
    try {
      const photoData = cameraService.capturePhoto();
      if (photoData) {
        onPhotoCapture(photoData);
        onClose();
      }
    } catch (error) {
      setError(`Photo capture failed: ${error.message}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50">
      <div className="h-full flex flex-col">
        {/* Camera Header */}
        <div className="flex items-center justify-between p-4 text-white">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white/20"
          >
            <i className="fas fa-times text-xl"></i>
          </Button>
          <h3 className="font-semibold">Capture Your Meal</h3>
          <div className="w-8"></div>
        </div>
        
        {/* Camera Preview */}
        <div className="flex-1 relative bg-gray-900 flex items-center justify-center">
          {error ? (
            <div className="text-center text-white">
              <i className="fas fa-exclamation-triangle text-6xl mb-4 text-red-400"></i>
              <p className="text-lg mb-2">Camera Error</p>
              <p className="text-sm opacity-75 mb-4">{error}</p>
              <Button
                onClick={startCamera}
                className="bg-naija-green hover:bg-naija-green/90"
              >
                Try Again
              </Button>
            </div>
          ) : !isCameraStarted ? (
            <div className="text-center text-white">
              <i className="fas fa-camera text-6xl mb-4 opacity-50"></i>
              <p>Starting camera...</p>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
              />
              
              {/* Camera Controls */}
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center space-x-8">
                <button className="w-12 h-12 border-2 border-white rounded-full flex items-center justify-center">
                  <i className="fas fa-images text-white"></i>
                </button>
                
                <Button
                  onClick={handleCapture}
                  className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100"
                >
                  <div className="w-16 h-16 border-4 border-gray-800 rounded-full"></div>
                </Button>
                
                <button className="w-12 h-12 border-2 border-white rounded-full flex items-center justify-center">
                  <i className="fas fa-sync-alt text-white"></i>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
