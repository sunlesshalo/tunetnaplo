// Storage helpers for uploading and managing photos and voice notes
import { supabase } from './supabaseClient';

/**
 * Upload a photo to Supabase Storage
 * @param {File} file - The photo file to upload
 * @param {string} userId - User ID for folder organization
 * @returns {Promise<{path: string, url: string, error: null} | {path: null, url: null, error: string}>}
 */
export async function uploadPhoto(file, userId) {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('symptom-photos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('symptom-photos')
      .getPublicUrl(fileName);

    return { path: fileName, url: publicUrl, error: null };
  } catch (error) {
    console.error('Photo upload error:', error);
    return { path: null, url: null, error: error.message };
  }
}

/**
 * Upload a voice note to Supabase Storage
 * @param {Blob} audioBlob - The audio blob to upload
 * @param {string} userId - User ID for folder organization
 * @returns {Promise<{path: string, url: string, error: null} | {path: null, url: null, error: string}>}
 */
export async function uploadVoiceNote(audioBlob, userId) {
  try {
    // Determine file extension from blob type
    const mimeType = audioBlob.type;
    let ext = 'webm';
    if (mimeType.includes('mp4')) ext = 'mp4';
    else if (mimeType.includes('ogg')) ext = 'ogg';
    else if (mimeType.includes('wav')) ext = 'wav';

    const fileName = `${userId}/${Date.now()}-voice.${ext}`;

    const { data, error } = await supabase.storage
      .from('voice-notes')
      .upload(fileName, audioBlob, {
        cacheControl: '3600',
        upsert: false,
        contentType: mimeType
      });

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('voice-notes')
      .getPublicUrl(fileName);

    return { path: fileName, url: publicUrl, error: null };
  } catch (error) {
    console.error('Voice note upload error:', error);
    return { path: null, url: null, error: error.message };
  }
}

/**
 * Delete a photo from Supabase Storage
 * @param {string} path - The storage path of the photo
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export async function deletePhoto(path) {
  try {
    const { error } = await supabase.storage
      .from('symptom-photos')
      .remove([path]);

    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error('Photo delete error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete a voice note from Supabase Storage
 * @param {string} path - The storage path of the voice note
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export async function deleteVoiceNote(path) {
  try {
    const { error } = await supabase.storage
      .from('voice-notes')
      .remove([path]);

    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error('Voice note delete error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get signed URL for a private file (if needed)
 * @param {string} bucket - Bucket name
 * @param {string} path - File path
 * @returns {Promise<string>}
 */
export async function getSignedUrl(bucket, path) {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, 3600); // 1 hour expiry

    if (error) throw error;
    return data.signedUrl;
  } catch (error) {
    console.error('Signed URL error:', error);
    return null;
  }
}
