import { gapi } from '../googleClient';

const PHOTOS_FOLDER_NAME = 'Tünetnapló/photos';
const VOICE_FOLDER_NAME = 'Tünetnapló/voice';

/**
 * Find or create a folder in Google Drive
 */
async function findOrCreateFolder(folderName) {
  try {
    // Split folder path
    const parts = folderName.split('/');
    let parentId = 'root';

    for (const part of parts) {
      // Search for folder
      const response = await gapi.client.drive.files.list({
        q: `name='${part}' and mimeType='application/vnd.google-apps.folder' and '${parentId}' in parents and trashed=false`,
        fields: 'files(id, name)',
        spaces: 'drive',
      });

      const folders = response.result.files || [];

      if (folders.length > 0) {
        parentId = folders[0].id;
      } else {
        // Create folder
        const createResponse = await gapi.client.drive.files.create({
          resource: {
            name: part,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [parentId],
          },
          fields: 'id',
        });

        parentId = createResponse.result.id;
        console.log(`✅ Created folder: ${part} (${parentId})`);
      }
    }

    return parentId;
  } catch (error) {
    console.error('Error finding/creating folder:', error);
    throw error;
  }
}

/**
 * Get cached folder ID from localStorage
 */
function getCachedFolderId(folderType, userId) {
  return localStorage.getItem(`tunetnaplo_${folderType}_folder_${userId}`);
}

/**
 * Cache folder ID in localStorage
 */
function cacheFolderId(folderType, userId, folderId) {
  localStorage.setItem(`tunetnaplo_${folderType}_folder_${userId}`, folderId);
}

/**
 * Get or create photos folder
 */
async function getPhotosFolderId(userId) {
  let folderId = getCachedFolderId('photos', userId);

  if (!folderId) {
    folderId = await findOrCreateFolder(PHOTOS_FOLDER_NAME);
    cacheFolderId('photos', userId, folderId);
  }

  return folderId;
}

/**
 * Get or create voice notes folder
 */
async function getVoiceFolderId(userId) {
  let folderId = getCachedFolderId('voice', userId);

  if (!folderId) {
    folderId = await findOrCreateFolder(VOICE_FOLDER_NAME);
    cacheFolderId('voice', userId, folderId);
  }

  return folderId;
}

/**
 * Upload a file to Google Drive
 */
async function uploadFile(file, folderId, fileName) {
  try {
    const boundary = '-------314159265358979323846';
    const delimiter = "\r\n--" + boundary + "\r\n";
    const close_delim = "\r\n--" + boundary + "--";

    const reader = new FileReader();

    return new Promise((resolve, reject) => {
      reader.readAsArrayBuffer(file);
      reader.onload = async () => {
        const contentType = file.type || 'application/octet-stream';
        const metadata = {
          name: fileName,
          mimeType: contentType,
          parents: [folderId],
        };

        const base64Data = btoa(
          new Uint8Array(reader.result).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ''
          )
        );

        const multipartRequestBody =
          delimiter +
          'Content-Type: application/json\r\n\r\n' +
          JSON.stringify(metadata) +
          delimiter +
          'Content-Type: ' + contentType + '\r\n' +
          'Content-Transfer-Encoding: base64\r\n' +
          '\r\n' +
          base64Data +
          close_delim;

        try {
          const response = await gapi.client.request({
            path: '/upload/drive/v3/files',
            method: 'POST',
            params: { uploadType: 'multipart' },
            headers: {
              'Content-Type': 'multipart/related; boundary="' + boundary + '"',
            },
            body: multipartRequestBody,
          });

          resolve(response.result);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (error) => reject(error);
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

/**
 * Get public URL for a file
 */
async function getFileUrl(fileId) {
  try {
    // Make file publicly accessible
    await gapi.client.drive.permissions.create({
      fileId: fileId,
      resource: {
        role: 'reader',
        type: 'anyone',
      },
    });

    // Get file metadata to construct URL
    const response = await gapi.client.drive.files.get({
      fileId: fileId,
      fields: 'webContentLink, webViewLink',
    });

    // Use webContentLink for direct download or webViewLink for viewing
    return response.result.webContentLink || response.result.webViewLink;
  } catch (error) {
    console.error('Error getting file URL:', error);
    // Fallback to direct link format
    return `https://drive.google.com/uc?id=${fileId}&export=download`;
  }
}

/**
 * Upload a photo to Google Drive
 * @param {File} file - The photo file to upload
 * @param {string} userId - User ID for folder organization
 * @returns {Promise<{fileId: string, url: string, error: null} | {fileId: null, url: null, error: string}>}
 */
export async function uploadPhoto(file, userId) {
  try {
    const folderId = await getPhotosFolderId(userId);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    console.log('📸 Uploading photo:', fileName);

    const result = await uploadFile(file, folderId, fileName);
    const fileId = result.id;
    const url = await getFileUrl(fileId);

    console.log('✅ Photo uploaded:', fileId);

    return { fileId, url, error: null };
  } catch (error) {
    console.error('Photo upload error:', error);
    return { fileId: null, url: null, error: error.message };
  }
}

/**
 * Upload a voice note to Google Drive
 * @param {Blob} audioBlob - The audio blob to upload
 * @param {string} userId - User ID for folder organization
 * @returns {Promise<{fileId: string, url: string, error: null} | {fileId: null, url: null, error: string}>}
 */
export async function uploadVoiceNote(audioBlob, userId) {
  try {
    console.log('🎵 uploadVoiceNote called', {
      userId,
      blobSize: audioBlob.size,
      blobType: audioBlob.type,
    });

    const folderId = await getVoiceFolderId(userId);

    // Determine file extension from blob type
    const mimeType = audioBlob.type;
    let ext = 'webm';
    if (mimeType.includes('mp4')) ext = 'mp4';
    else if (mimeType.includes('ogg')) ext = 'ogg';
    else if (mimeType.includes('wav')) ext = 'wav';

    const fileName = `${Date.now()}-voice.${ext}`;
    console.log('📁 Uploading to:', fileName, 'with type:', mimeType);

    // Convert Blob to File
    const file = new File([audioBlob], fileName, { type: mimeType });

    const result = await uploadFile(file, folderId, fileName);
    const fileId = result.id;
    const url = await getFileUrl(fileId);

    console.log('✅ Voice note uploaded:', fileId);

    return { fileId, url, error: null };
  } catch (error) {
    console.error('❌ Voice note upload error:', error);
    return { fileId: null, url: null, error: error.message };
  }
}

/**
 * Delete a file from Google Drive
 * @param {string} fileId - The file ID to delete
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export async function deleteFile(fileId) {
  try {
    await gapi.client.drive.files.delete({
      fileId: fileId,
    });

    console.log('🗑️ File deleted:', fileId);
    return { success: true, error: null };
  } catch (error) {
    console.error('File delete error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete a photo from Google Drive
 * @param {string} fileId - The file ID of the photo
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export async function deletePhoto(fileId) {
  return deleteFile(fileId);
}

/**
 * Delete a voice note from Google Drive
 * @param {string} fileId - The file ID of the voice note
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export async function deleteVoiceNote(fileId) {
  return deleteFile(fileId);
}
