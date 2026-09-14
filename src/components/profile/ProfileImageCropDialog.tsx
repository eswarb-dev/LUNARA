import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { getCroppedImageBlob } from '@/lib/cropImage';

interface ProfileImageCropDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageFile: File | null;
  onUpload: (croppedBlob: Blob) => Promise<void>;
}

const ProfileImageCropDialog: React.FC<ProfileImageCropDialogProps> = ({
  open,
  onOpenChange,
  imageFile,
  onUpload,
}) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [uploading, setUploading] = useState(false);

  React.useEffect(() => {
    if (imageFile) {
      const reader = new FileReader();
      reader.onload = () => setImageSrc(reader.result as string);
      reader.readAsDataURL(imageFile);
    } else {
      setImageSrc(null);
    }
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setCroppedAreaPixels(null);
  }, [imageFile]);

  const onCropComplete = useCallback((_: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setUploading(true);
    try {
      const blob = await getCroppedImageBlob(imageSrc, croppedAreaPixels, rotation);
      if (blob) {
        await onUpload(blob);
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Failed to crop and upload image:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] bg-moon-paper border-2 border-lunara-silver/20 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-garamond font-bold text-ink-blue">
            Adjust your profile photo
          </DialogTitle>
          <DialogDescription className="font-garamond text-muted-brown italic">
            Frame the image before saving it to your journal.
          </DialogDescription>
        </DialogHeader>

        {imageSrc && (
          <div className="relative w-full aspect-square rounded-xl overflow-hidden border-2 border-lunara-silver/20 bg-cream">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={1}
              cropShape="round"
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>
        )}

        <div className="space-y-4 px-1">
          <div>
            <label className="block font-garamond text-sm text-ink-blue mb-2 font-medium">
              Zoom
            </label>
            <Slider
              value={[zoom]}
              onValueChange={(value) => setZoom(value[0])}
              min={1}
              max={3}
              step={0.1}
              className="w-full"
            />
          </div>
          <div>
            <label className="block font-garamond text-sm text-ink-blue mb-2 font-medium">
              Rotate
            </label>
            <Slider
              value={[rotation]}
              onValueChange={(value) => setRotation(value[0])}
              min={0}
              max={360}
              step={1}
              className="w-full"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={uploading}
            className="border-2 border-lunara-silver/30 text-muted-brown hover:bg-lunara-silver/10 font-garamond"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!imageSrc || uploading}
            className="lunara-button text-cream font-garamond px-6"
          >
            {uploading ? 'Saving...' : 'Save photo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileImageCropDialog;
