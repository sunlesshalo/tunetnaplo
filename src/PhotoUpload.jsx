import React, { useState } from 'react';
import { uploadPhoto, deletePhoto } from './utils/storageHelpers';

// Convert Google Drive fileId to viewable URL
const getPhotoUrl = (fileId) => `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`;

export default function PhotoUpload({ userId, photos, onChange }) {
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);

    const uploadPromises = files.map(file => uploadPhoto(file, userId));
    const results = await Promise.all(uploadPromises);

    const successfulUploads = results
      .filter(r => !r.error)
      .map(r => r.path);

    if (successfulUploads.length > 0) {
      onChange([...(photos || []), ...successfulUploads]);
    }

    const errors = results.filter(r => r.error);
    if (errors.length > 0) {
      alert(`Hiba ${errors.length} kép feltöltésekor`);
    }

    setUploading(false);
    e.target.value = ''; // Reset input
  };

  const handleDelete = async (photoPath, index) => {
    if (!confirm('Biztosan törlöd ezt a képet?')) return;

    await deletePhoto(photoPath);
    const newPhotos = photos.filter((_, i) => i !== index);
    onChange(newPhotos);
  };

  return (
    <div className="space-y-3">
      <label className="block">
        <span className="text-sm font-medium text-slate-700">Fotók 📸</span>
        <div className="mt-2">
          <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-sky-100 text-sky-700 rounded-lg hover:bg-sky-200 transition">
            <span>{uploading ? 'Feltöltés...' : '+ Fotó hozzáadása'}</span>
            <input
              type="file"
              accept="image/*"
              multiple
              capture="environment"
              onChange={handleFileSelect}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>
      </label>

      {photos && photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((photoPath, index) => (
            <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-slate-100">
              <img
                src={getPhotoUrl(photoPath)}
                alt={`Symptom photo ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => handleDelete(photoPath, index)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
