// Helper to get gapi client
const getGapi = () => {
  if (!window.gapi || !window.gapi.client) {
    throw new Error('Google API client not initialized');
  }
  return window.gapi;
};

const SPREADSHEET_NAME = 'Tünetnapló';
const SYMPTOMS_SHEET_NAME = 'Symptoms';
const ENTRIES_SHEET_NAME = 'Entries';
const APP_FOLDER_NAME = 'Tünetnapló';

/**
 * Find or create the Tünetnapló folder
 * Handles duplicate folders by merging them into the oldest one
 */
async function findOrCreateAppFolder() {
  try {
    const gapi = getGapi();

    // Search for ALL existing folders with this name (handles duplicates from multiple devices)
    const response = await gapi.client.drive.files.list({
      q: `name='${APP_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and 'root' in parents and trashed=false`,
      fields: 'files(id, name, createdTime)',
      spaces: 'drive',
      orderBy: 'createdTime', // Oldest first
    });

    const folders = response.result.files || [];

    if (folders.length > 1) {
      // Multiple folders found - merge them into the oldest one
      console.log(`⚠️ Found ${folders.length} duplicate Tünetnapló folders, merging...`);
      const primaryFolder = folders[0]; // Oldest folder

      // Move contents from duplicate folders to primary folder
      for (let i = 1; i < folders.length; i++) {
        const duplicateFolder = folders[i];
        await mergeFolderContents(duplicateFolder.id, primaryFolder.id);

        // Delete the now-empty duplicate folder
        try {
          await gapi.client.drive.files.delete({ fileId: duplicateFolder.id });
          console.log(`🗑️ Deleted duplicate folder: ${duplicateFolder.id}`);
        } catch (deleteError) {
          console.error('Error deleting duplicate folder:', deleteError);
        }
      }

      return primaryFolder.id;
    }

    if (folders.length === 1) {
      return folders[0].id;
    }

    // Create folder
    const createResponse = await gapi.client.drive.files.create({
      resource: {
        name: APP_FOLDER_NAME,
        mimeType: 'application/vnd.google-apps.folder',
      },
      fields: 'id',
    });

    console.log('✅ Created app folder:', createResponse.result.id);
    return createResponse.result.id;
  } catch (error) {
    console.error('Error finding/creating app folder:', error);
    throw error;
  }
}

/**
 * Merge contents from source folder to target folder
 */
async function mergeFolderContents(sourceFolderId, targetFolderId) {
  try {
    const gapi = getGapi();

    // Get all files in source folder
    const response = await gapi.client.drive.files.list({
      q: `'${sourceFolderId}' in parents and trashed=false`,
      fields: 'files(id, name, mimeType)',
      spaces: 'drive',
    });

    const files = response.result.files || [];

    for (const file of files) {
      // Check if file with same name already exists in target
      const existingResponse = await gapi.client.drive.files.list({
        q: `name='${file.name}' and '${targetFolderId}' in parents and trashed=false`,
        fields: 'files(id)',
        spaces: 'drive',
      });

      const existingFiles = existingResponse.result.files || [];

      if (existingFiles.length === 0) {
        // Move file to target folder
        await gapi.client.drive.files.update({
          fileId: file.id,
          addParents: targetFolderId,
          removeParents: sourceFolderId,
          fields: 'id, parents',
        });
        console.log(`📦 Moved ${file.name} to primary folder`);
      } else {
        // File already exists in target, delete the duplicate
        await gapi.client.drive.files.delete({ fileId: file.id });
        console.log(`🗑️ Deleted duplicate file: ${file.name}`);
      }
    }
  } catch (error) {
    console.error('Error merging folder contents:', error);
  }
}

/**
 * Move a file to a folder (removes from root)
 */
async function moveFileToFolder(fileId, folderId) {
  try {
    const gapi = getGapi();

    // Get current parents
    const file = await gapi.client.drive.files.get({
      fileId: fileId,
      fields: 'parents',
    });

    const previousParents = file.result.parents ? file.result.parents.join(',') : '';

    // Move file to new folder
    await gapi.client.drive.files.update({
      fileId: fileId,
      addParents: folderId,
      removeParents: previousParents,
      fields: 'id, parents',
    });

    console.log('✅ Moved spreadsheet to Tünetnapló folder');
  } catch (error) {
    console.error('Error moving file to folder:', error);
    // Don't throw - spreadsheet still works even if not in folder
  }
}

/**
 * Find or create the user's Tünetnapló spreadsheet
 */
export async function findOrCreateSpreadsheet() {
  try {
    const gapi = getGapi();

    // First, ensure the app folder exists
    const folderId = await findOrCreateAppFolder();

    // Search for existing spreadsheet IN the folder
    const folderResponse = await gapi.client.drive.files.list({
      q: `name='${SPREADSHEET_NAME}' and mimeType='application/vnd.google-apps.spreadsheet' and '${folderId}' in parents and trashed=false`,
      fields: 'files(id, name)',
      spaces: 'drive',
    });

    let files = folderResponse.result.files || [];

    if (files.length > 0) {
      console.log('✅ Found existing spreadsheet in folder:', files[0].id);
      return files[0].id;
    }

    // Also check root (for existing users who have spreadsheet in root)
    const rootResponse = await gapi.client.drive.files.list({
      q: `name='${SPREADSHEET_NAME}' and mimeType='application/vnd.google-apps.spreadsheet' and 'root' in parents and trashed=false`,
      fields: 'files(id, name)',
      spaces: 'drive',
    });

    files = rootResponse.result.files || [];

    if (files.length > 0) {
      console.log('📦 Found spreadsheet in root, moving to folder...');
      await moveFileToFolder(files[0].id, folderId);
      return files[0].id;
    }

    // Create new spreadsheet
    console.log('📝 Creating new spreadsheet...');
    const createResponse = await gapi.client.sheets.spreadsheets.create({
      properties: {
        title: SPREADSHEET_NAME,
      },
      sheets: [
        {
          properties: {
            title: SYMPTOMS_SHEET_NAME,
            gridProperties: {
              frozenRowCount: 1,
            },
          },
        },
        {
          properties: {
            title: ENTRIES_SHEET_NAME,
            gridProperties: {
              frozenRowCount: 1,
            },
          },
        },
      ],
    });

    const spreadsheetId = createResponse.result.spreadsheetId;
    console.log('✅ Created new spreadsheet:', spreadsheetId);

    // Move to app folder
    await moveFileToFolder(spreadsheetId, folderId);

    // Initialize headers
    await initializeHeaders(spreadsheetId);

    return spreadsheetId;
  } catch (error) {
    console.error('Error finding/creating spreadsheet:', error);
    throw error;
  }
}

/**
 * Initialize sheet headers
 */
async function initializeHeaders(spreadsheetId) {
  const symptomsHeaders = [['id', 'name', 'emoji', 'parent_only', 'created_at', 'updated_at']];
  const entriesHeaders = [
    [
      'id',
      'symptom_id',
      'date',
      'timestamp',
      'intensity',
      'duration',
      'note',
      'context',
      'environment',
      'photos',
      'voice_note',
      'created_at',
      'updated_at',
    ],
  ];

  await gapi.client.sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    resource: {
      valueInputOption: 'RAW',
      data: [
        {
          range: `${SYMPTOMS_SHEET_NAME}!A1:F1`,
          values: symptomsHeaders,
        },
        {
          range: `${ENTRIES_SHEET_NAME}!A1:M1`,
          values: entriesHeaders,
        },
      ],
    },
  });
}

/**
 * Get cached spreadsheet ID from localStorage
 */
function getCachedSpreadsheetId(userId) {
  return localStorage.getItem(`tunetnaplo_spreadsheet_${userId}`);
}

/**
 * Cache spreadsheet ID in localStorage
 */
function cacheSpreadsheetId(userId, spreadsheetId) {
  localStorage.setItem(`tunetnaplo_spreadsheet_${userId}`, spreadsheetId);
}

/**
 * Clear cached spreadsheet ID
 */
function clearCachedSpreadsheetId(userId) {
  localStorage.removeItem(`tunetnaplo_spreadsheet_${userId}`);
}

/**
 * Verify a spreadsheet still exists and is accessible
 */
async function verifySpreadsheetExists(spreadsheetId) {
  try {
    const gapi = getGapi();
    await gapi.client.sheets.spreadsheets.get({
      spreadsheetId,
      fields: 'spreadsheetId',
    });
    return true;
  } catch (error) {
    // 404 means file doesn't exist or was deleted
    if (error.status === 404 || error.result?.error?.code === 404) {
      return false;
    }
    // Other errors (network, etc.) - assume it exists to avoid re-creating
    console.warn('Error verifying spreadsheet:', error);
    return true;
  }
}

/**
 * Get or initialize spreadsheet
 * Verifies cached spreadsheet still exists (handles folder merging scenarios)
 */
export async function getSpreadsheetId(userId) {
  let spreadsheetId = getCachedSpreadsheetId(userId);

  if (spreadsheetId) {
    // Verify the cached spreadsheet still exists (might have been deleted during folder merge)
    const exists = await verifySpreadsheetExists(spreadsheetId);
    if (!exists) {
      console.log('⚠️ Cached spreadsheet no longer exists, re-discovering...');
      clearCachedSpreadsheetId(userId);
      spreadsheetId = null;
    }
  }

  if (!spreadsheetId) {
    spreadsheetId = await findOrCreateSpreadsheet();
    cacheSpreadsheetId(userId, spreadsheetId);
  }

  return spreadsheetId;
}

/**
 * Generate a unique ID
 */
function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Fetch all symptoms
 */
export async function fetchSymptoms(spreadsheetId) {
  try {
    const gapi = getGapi();
    const response = await gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${SYMPTOMS_SHEET_NAME}!A2:F`,
    });

    const rows = response.result.values || [];
    return rows.map((row) => ({
      id: row[0],
      name: row[1],
      emoji: row[2],
      parent_only: row[3] === 'TRUE',
      created_at: row[4],
      updated_at: row[5],
    }));
  } catch (error) {
    console.error('Error fetching symptoms:', error);
    return [];
  }
}

/**
 * Add a new symptom
 */
export async function addSymptom(spreadsheetId, symptomData) {
  try {
    const gapi = getGapi();
    const id = generateId();
    const now = new Date().toISOString();
    const row = [
      id,
      symptomData.name,
      symptomData.emoji,
      symptomData.parent_only ? 'TRUE' : 'FALSE',
      now,
      now,
    ];

    await gapi.client.sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${SYMPTOMS_SHEET_NAME}!A:F`,
      valueInputOption: 'RAW',
      resource: {
        values: [row],
      },
    });

    return {
      id,
      name: symptomData.name,
      emoji: symptomData.emoji,
      parent_only: symptomData.parent_only || false,
      created_at: now,
      updated_at: now,
    };
  } catch (error) {
    console.error('Error adding symptom:', error);
    throw error;
  }
}

/**
 * Update a symptom
 */
export async function updateSymptom(spreadsheetId, symptomId, updates) {
  try {
    const gapi = getGapi();
    // First, find the row index
    const symptoms = await fetchSymptoms(spreadsheetId);
    const index = symptoms.findIndex((s) => s.id === symptomId);

    if (index === -1) {
      throw new Error('Symptom not found');
    }

    const rowNumber = index + 2; // +2 because of header and 0-indexing
    const symptom = symptoms[index];
    const now = new Date().toISOString();

    const row = [
      symptom.id,
      updates.name !== undefined ? updates.name : symptom.name,
      updates.emoji !== undefined ? updates.emoji : symptom.emoji,
      updates.parent_only !== undefined
        ? updates.parent_only
          ? 'TRUE'
          : 'FALSE'
        : symptom.parent_only
        ? 'TRUE'
        : 'FALSE',
      symptom.created_at,
      now,
    ];

    await gapi.client.sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${SYMPTOMS_SHEET_NAME}!A${rowNumber}:F${rowNumber}`,
      valueInputOption: 'RAW',
      resource: {
        values: [row],
      },
    });

    return {
      ...symptom,
      ...updates,
      updated_at: now,
    };
  } catch (error) {
    console.error('Error updating symptom:', error);
    throw error;
  }
}

/**
 * Get sheet ID by sheet name
 */
async function getSheetIdByName(spreadsheetId, sheetName) {
  const gapi = getGapi();
  const response = await gapi.client.sheets.spreadsheets.get({
    spreadsheetId,
    fields: 'sheets.properties',
  });

  const sheet = response.result.sheets.find((s) => s.properties.title === sheetName);
  return sheet ? sheet.properties.sheetId : null;
}

/**
 * Count entries for a symptom
 */
export async function countEntriesForSymptom(spreadsheetId, symptomId) {
  try {
    const entries = await fetchEntries(spreadsheetId);
    return entries.filter((e) => e.symptom_id === symptomId).length;
  } catch (error) {
    console.error('Error counting entries:', error);
    return 0;
  }
}

/**
 * Delete a symptom (with cascade delete of related entries)
 */
export async function deleteSymptom(spreadsheetId, symptomId) {
  try {
    const gapi = getGapi();

    // First, delete all entries with this symptom_id (cascade delete)
    const entries = await fetchEntries(spreadsheetId);
    const relatedEntries = entries.filter((e) => e.symptom_id === symptomId);

    // Delete entries in reverse order to avoid index shifting issues
    for (let i = relatedEntries.length - 1; i >= 0; i--) {
      await deleteEntry(spreadsheetId, relatedEntries[i].id);
    }

    // Now delete the symptom itself
    const symptoms = await fetchSymptoms(spreadsheetId);
    const index = symptoms.findIndex((s) => s.id === symptomId);

    if (index === -1) {
      throw new Error('Symptom not found');
    }

    const rowNumber = index + 2;
    const sheetId = await getSheetIdByName(spreadsheetId, SYMPTOMS_SHEET_NAME);

    if (sheetId === null) {
      throw new Error('Symptoms sheet not found');
    }

    await gapi.client.sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      resource: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: sheetId,
                dimension: 'ROWS',
                startIndex: rowNumber - 1,
                endIndex: rowNumber,
              },
            },
          },
        ],
      },
    });
  } catch (error) {
    console.error('Error deleting symptom:', error);
    throw error;
  }
}

/**
 * Fetch all entries
 */
export async function fetchEntries(spreadsheetId) {
  try {
    const gapi = getGapi();
    const response = await gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${ENTRIES_SHEET_NAME}!A2:M`,
    });

    const rows = response.result.values || [];
    return rows
      .map((row) => ({
        id: row[0],
        symptom_id: row[1],
        date: row[2],
        timestamp: row[3],
        intensity: parseInt(row[4]) || 0,
        duration: row[5] ? parseInt(row[5]) : null,
        note: row[6] || '',
        context: row[7] ? JSON.parse(row[7]) : {},
        environment: row[8] ? JSON.parse(row[8]) : null,
        photos: row[9] ? JSON.parse(row[9]) : null,
        voice_note: row[10] || null,
        created_at: row[11],
        updated_at: row[12],
      }))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  } catch (error) {
    console.error('Error fetching entries:', error);
    return [];
  }
}

/**
 * Add a new entry
 */
export async function addEntry(spreadsheetId, entryData) {
  try {
    const gapi = getGapi();
    const id = generateId();
    const now = new Date().toISOString();
    const row = [
      id,
      entryData.symptom_id,
      entryData.date,
      entryData.timestamp,
      entryData.intensity,
      entryData.duration || '',
      entryData.note || '',
      JSON.stringify(entryData.context || {}),
      JSON.stringify(entryData.environment || null),
      JSON.stringify(entryData.photos || null),
      entryData.voice_note || '',
      now,
      now,
    ];

    await gapi.client.sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${ENTRIES_SHEET_NAME}!A:M`,
      valueInputOption: 'RAW',
      resource: {
        values: [row],
      },
    });

    return {
      id,
      ...entryData,
      created_at: now,
      updated_at: now,
    };
  } catch (error) {
    console.error('Error adding entry:', error);
    throw error;
  }
}

/**
 * Update an entry
 */
export async function updateEntry(spreadsheetId, entryId, updates) {
  try {
    const gapi = getGapi();
    const entries = await fetchEntries(spreadsheetId);
    const index = entries.findIndex((e) => e.id === entryId);

    if (index === -1) {
      throw new Error('Entry not found');
    }

    const rowNumber = index + 2;
    const entry = entries[index];
    const now = new Date().toISOString();

    const row = [
      entry.id,
      updates.symptom_id !== undefined ? updates.symptom_id : entry.symptom_id,
      entry.date,
      entry.timestamp,
      updates.intensity !== undefined ? updates.intensity : entry.intensity,
      updates.duration !== undefined ? updates.duration || '' : entry.duration || '',
      updates.note !== undefined ? updates.note : entry.note,
      updates.context !== undefined ? JSON.stringify(updates.context) : JSON.stringify(entry.context),
      JSON.stringify(entry.environment),
      updates.photos !== undefined ? JSON.stringify(updates.photos) : JSON.stringify(entry.photos),
      updates.voice_note !== undefined ? updates.voice_note || '' : entry.voice_note || '',
      entry.created_at,
      now,
    ];

    await gapi.client.sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${ENTRIES_SHEET_NAME}!A${rowNumber}:M${rowNumber}`,
      valueInputOption: 'RAW',
      resource: {
        values: [row],
      },
    });

    return {
      ...entry,
      ...updates,
      updated_at: now,
    };
  } catch (error) {
    console.error('Error updating entry:', error);
    throw error;
  }
}

/**
 * Delete an entry
 */
export async function deleteEntry(spreadsheetId, entryId) {
  try {
    const gapi = getGapi();
    const entries = await fetchEntries(spreadsheetId);
    const index = entries.findIndex((e) => e.id === entryId);

    if (index === -1) {
      throw new Error('Entry not found');
    }

    const rowNumber = index + 2;
    const sheetId = await getSheetIdByName(spreadsheetId, ENTRIES_SHEET_NAME);

    if (sheetId === null) {
      throw new Error('Entries sheet not found');
    }

    await gapi.client.sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      resource: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: sheetId,
                dimension: 'ROWS',
                startIndex: rowNumber - 1,
                endIndex: rowNumber,
              },
            },
          },
        ],
      },
    });
  } catch (error) {
    console.error('Error deleting entry:', error);
    throw error;
  }
}

/**
 * Delete the entire Tünetnapló folder from Google Drive (including spreadsheet, photos, voice notes)
 * Also clears all localStorage data
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function deleteAllData() {
  try {
    const gapi = getGapi();

    // Find the Tünetnapló folder
    const response = await gapi.client.drive.files.list({
      q: `name='${APP_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and 'root' in parents and trashed=false`,
      fields: 'files(id, name)',
      spaces: 'drive',
    });

    const folders = response.result.files || [];

    if (folders.length > 0) {
      // Delete the folder (this will delete all contents: spreadsheet, photos, voice notes)
      await gapi.client.drive.files.delete({
        fileId: folders[0].id,
      });
      console.log('Deleted Tünetnapló folder from Google Drive');
    }

    // Also check if there's a spreadsheet in root (for older setups)
    const rootResponse = await gapi.client.drive.files.list({
      q: `name='${SPREADSHEET_NAME}' and mimeType='application/vnd.google-apps.spreadsheet' and 'root' in parents and trashed=false`,
      fields: 'files(id, name)',
      spaces: 'drive',
    });

    const rootFiles = rootResponse.result.files || [];
    for (const file of rootFiles) {
      await gapi.client.drive.files.delete({
        fileId: file.id,
      });
      console.log('Deleted orphan spreadsheet from root');
    }

    // Clear all tunetnaplo-related localStorage items
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('tunetnaplo')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
    console.log('Cleared localStorage:', keysToRemove);

    return { success: true };
  } catch (error) {
    console.error('Error deleting all data:', error);
    return { success: false, error: error.message || 'Ismeretlen hiba történt' };
  }
}
