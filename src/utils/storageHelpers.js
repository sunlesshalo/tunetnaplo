// Storage helpers for uploading and managing photos and voice notes
import {
  uploadPhoto as uploadPhotoToDrive,
  uploadVoiceNote as uploadVoiceNoteToDrive,
  deletePhoto as deletePhotoFromDrive,
  deleteVoiceNote as deleteVoiceNoteFromDrive,
} from '../services/googleDriveService';

/**
 * Upload a photo to Google Drive
 * @param {File} file - The photo file to upload
 * @param {string} userId - User ID for folder organization
 * @returns {Promise<{path: string, url: string, error: null} | {path: null, url: null, error: string}>}
 */
export async function uploadPhoto(file, userId) {
  try {
    const { fileId, url, error } = await uploadPhotoToDrive(file, userId);

    if (error) {
      return { path: null, url: null, error };
    }

    // Return fileId as path for consistency with old API
    return { path: fileId, url, error: null };
  } catch (error) {
    console.error('Photo upload error:', error);
    return { path: null, url: null, error: error.message };
  }
}

/**
 * Upload a voice note to Google Drive
 * @param {Blob} audioBlob - The audio blob to upload
 * @param {string} userId - User ID for folder organization
 * @returns {Promise<{path: string, url: string, error: null} | {path: null, url: null, error: string}>}
 */
export async function uploadVoiceNote(audioBlob, userId) {
  try {
    console.log('🎵 uploadVoiceNote called', {
      userId,
      blobSize: audioBlob.size,
      blobType: audioBlob.type,
    });

    const { fileId, url, error } = await uploadVoiceNoteToDrive(audioBlob, userId);

    if (error) {
      console.error('❌ Upload error:', error);
      return { path: null, url: null, error };
    }

    console.log('✅ Upload successful:', { fileId, url });

    // Return fileId as path for consistency with old API
    return { path: fileId, url, error: null };
  } catch (error) {
    console.error('❌ Voice note upload error:', error);
    return { path: null, url: null, error: error.message };
  }
}

/**
 * Delete a photo from Google Drive
 * @param {string} fileId - The file ID of the photo
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export async function deletePhoto(fileId) {
  try {
    const result = await deletePhotoFromDrive(fileId);
    return result;
  } catch (error) {
    console.error('Photo delete error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete a voice note from Google Drive
 * @param {string} fileId - The file ID of the voice note
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export async function deleteVoiceNote(fileId) {
  try {
    const result = await deleteVoiceNoteFromDrive(fileId);
    return result;
  } catch (error) {
    console.error('Voice note delete error:', error);
    return { success: false, error: error.message };
  }
}
