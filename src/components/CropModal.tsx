import React, { useState } from 'react';
import Cropper from 'react-easy-crop';
import getCroppedImg from '@/utils/cropImage';
import { Button } from '@/components/ui/Button';
import styles from '@/app/profile/page.module.css';

interface CropModalProps {
  cropImageSrc: string;
  onClose: () => void;
  onSave: (croppedBlob: Blob) => Promise<void>;
  isUploading: boolean;
}

export default function CropModal({ cropImageSrc, onClose, onSave, isUploading }: CropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const onCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleSaveCrop = async () => {
    if (!croppedAreaPixels) return;
    try {
      const croppedBlob = await getCroppedImg(cropImageSrc, croppedAreaPixels);
      if (!croppedBlob) throw new Error('Crop failed');
      await onSave(croppedBlob);
    } catch (error) {
      console.error('Crop error:', error);
      alert('Could not process the image crop.');
    }
  };

  return (
    <div className={styles.cropModalOverlay}>
      <div className={styles.cropModalContent}>
        <h2 className={styles.cropTitle}>Position Profile Picture</h2>
        <div className={styles.cropperContainer}>
          <Cropper
            image={cropImageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
          />
        </div>
        <div className={styles.cropControls}>
          <input
            type="range"
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            aria-labelledby="Zoom"
            onChange={(e) => setZoom(Number(e.target.value))}
            className={styles.zoomSlider}
          />
        </div>
        <div className={styles.cropActions}>
          <Button 
            title="Cancel" 
            variant="ghost" 
            onClick={onClose} 
            disabled={isUploading}
          />
          <Button 
            title="Save" 
            variant="primary" 
            onClick={handleSaveCrop} 
            loading={isUploading}
          />
        </div>
      </div>
    </div>
  );
}
