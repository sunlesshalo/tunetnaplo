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
const SETTINGS_SHEET_NAME = 'Settings';
const PROFILES_SHEET_NAME = 'Profiles';
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
        {
          properties: {
            title: SETTINGS_SHEET_NAME,
            gridProperties: {
              frozenRowCount: 1,
            },
          },
        },
        {
          properties: {
            title: PROFILES_SHEET_NAME,
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
 * Initialize sheet headers (includes profile_id for multi-child support)
 */
async function initializeHeaders(spreadsheetId) {
  const symptomsHeaders = [['id', 'name', 'emoji', 'parent_only', 'profile_id', 'created_at', 'updated_at']];
  const entriesHeaders = [
    [
      'id',
      'symptom_id',
      'profile_id',
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
  const settingsHeaders = [['key', 'value', 'updated_at']];
  const profilesHeaders = [['id', 'name', 'theme', 'avatar_emoji', 'created_at', 'updated_at']];

  await gapi.client.sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    resource: {
      valueInputOption: 'RAW',
      data: [
        {
          range: `${SYMPTOMS_SHEET_NAME}!A1:G1`,
          values: symptomsHeaders,
        },
        {
          range: `${ENTRIES_SHEET_NAME}!A1:N1`,
          values: entriesHeaders,
        },
        {
          range: `${SETTINGS_SHEET_NAME}!A1:C1`,
          values: settingsHeaders,
        },
        {
          range: `${PROFILES_SHEET_NAME}!A1:F1`,
          values: profilesHeaders,
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
 * Get joined spreadsheet ID if user has joined another family
 */
function getJoinedSpreadsheetId(userId) {
  return localStorage.getItem(`tunetnaplo_joined_spreadsheet_${userId}`);
}

/**
 * Get or initialize spreadsheet
 * Verifies cached spreadsheet still exists (handles folder merging scenarios)
 * Also checks for joined spreadsheets (multi-parent support)
 */
export async function getSpreadsheetId(userId) {
  // First, check if user has joined another family's spreadsheet
  const joinedId = getJoinedSpreadsheetId(userId);
  if (joinedId) {
    const exists = await verifySpreadsheetExists(joinedId);
    if (exists) {
      console.log('📎 Using joined spreadsheet:', joinedId);
      return joinedId;
    }
    // Joined spreadsheet no longer accessible, clear it
    localStorage.removeItem(`tunetnaplo_joined_spreadsheet_${userId}`);
    console.log('⚠️ Joined spreadsheet no longer accessible, falling back to own');
  }

  // Check for cached own spreadsheet
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
 * After migration: id, name, emoji, parent_only, profile_id, created_at, updated_at
 */
export async function fetchSymptoms(spreadsheetId) {
  try {
    const gapi = getGapi();
    const response = await gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${SYMPTOMS_SHEET_NAME}!A2:G`,
    });

    const rows = response.result.values || [];
    return rows.map((row) => ({
      id: row[0],
      name: row[1],
      emoji: row[2],
      parent_only: row[3] === 'TRUE',
      profile_id: row[4] || null,
      created_at: row[5],
      updated_at: row[6],
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
      symptomData.profile_id || '',
      now,
      now,
    ];

    await gapi.client.sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${SYMPTOMS_SHEET_NAME}!A:G`,
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
      profile_id: symptomData.profile_id || null,
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
      symptom.profile_id || '',
      symptom.created_at,
      now,
    ];

    await gapi.client.sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${SYMPTOMS_SHEET_NAME}!A${rowNumber}:G${rowNumber}`,
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
 * After migration: id, symptom_id, profile_id, date, timestamp, intensity, duration, note, context, environment, photos, voice_note, created_at, updated_at
 */
export async function fetchEntries(spreadsheetId) {
  try {
    const gapi = getGapi();
    const response = await gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${ENTRIES_SHEET_NAME}!A2:N`,
    });

    const rows = response.result.values || [];
    return rows
      .map((row) => ({
        id: row[0],
        symptom_id: row[1],
        profile_id: row[2] || null,
        date: row[3],
        timestamp: row[4],
        intensity: parseInt(row[5]) || 0,
        duration: row[6] ? parseInt(row[6]) : null,
        note: row[7] || '',
        context: row[8] ? JSON.parse(row[8]) : {},
        environment: row[9] ? JSON.parse(row[9]) : null,
        photos: row[10] ? JSON.parse(row[10]) : null,
        voice_note: row[11] || null,
        created_at: row[12],
        updated_at: row[13],
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
      entryData.profile_id || '',
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
      range: `${ENTRIES_SHEET_NAME}!A:N`,
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
 * Fetch entries in raw order (no sorting) - for internal use
 */
async function fetchEntriesRaw(spreadsheetId) {
  try {
    const gapi = getGapi();
    const response = await gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${ENTRIES_SHEET_NAME}!A2:N`,
    });

    const rows = response.result.values || [];
    return rows.map((row) => ({
      id: row[0],
      symptom_id: row[1],
      profile_id: row[2] || null,
      date: row[3],
      timestamp: row[4],
      intensity: parseInt(row[5]) || 0,
      duration: row[6] ? parseInt(row[6]) : null,
      note: row[7] || '',
      context: row[8] ? JSON.parse(row[8]) : {},
      environment: row[9] ? JSON.parse(row[9]) : null,
      photos: row[10] ? JSON.parse(row[10]) : null,
      voice_note: row[11] || null,
      created_at: row[12],
      updated_at: row[13],
    }));
  } catch (error) {
    console.error('Error fetching raw entries:', error);
    return [];
  }
}

/**
 * Update an entry
 */
export async function updateEntry(spreadsheetId, entryId, updates) {
  try {
    const gapi = getGapi();
    // Use raw (unsorted) entries to get correct row index
    const entries = await fetchEntriesRaw(spreadsheetId);
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
      entry.profile_id || '',
      updates.date !== undefined ? updates.date : entry.date,
      updates.timestamp !== undefined ? updates.timestamp : entry.timestamp,
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
      range: `${ENTRIES_SHEET_NAME}!A${rowNumber}:N${rowNumber}`,
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
    // Use raw (unsorted) entries to get correct row index
    const entries = await fetchEntriesRaw(spreadsheetId);
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
 * Ensure the Settings sheet exists (for existing spreadsheets created before this feature)
 */
async function ensureSettingsSheet(spreadsheetId) {
  try {
    const gapi = getGapi();

    // Check if Settings sheet exists
    const spreadsheet = await gapi.client.sheets.spreadsheets.get({
      spreadsheetId,
      fields: 'sheets.properties.title',
    });

    const sheets = spreadsheet.result.sheets || [];
    const settingsSheetExists = sheets.some((s) => s.properties.title === SETTINGS_SHEET_NAME);

    if (!settingsSheetExists) {
      // Create the Settings sheet
      await gapi.client.sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        resource: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: SETTINGS_SHEET_NAME,
                  gridProperties: {
                    frozenRowCount: 1,
                  },
                },
              },
            },
          ],
        },
      });

      // Initialize headers
      await gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${SETTINGS_SHEET_NAME}!A1:C1`,
        valueInputOption: 'RAW',
        resource: {
          values: [['key', 'value', 'updated_at']],
        },
      });

      console.log('✅ Created Settings sheet');
    }
  } catch (error) {
    console.error('Error ensuring Settings sheet:', error);
  }
}

/**
 * Fetch shared settings from Google Sheets
 * @returns {Promise<{userName: string, theme: string}>}
 */
export async function fetchSharedSettings(spreadsheetId) {
  try {
    const gapi = getGapi();

    // Ensure Settings sheet exists
    await ensureSettingsSheet(spreadsheetId);

    const response = await gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${SETTINGS_SHEET_NAME}!A2:B`,
    });

    const rows = response.result.values || [];
    const settings = {};

    for (const row of rows) {
      if (row[0] && row[1] !== undefined) {
        settings[row[0]] = row[1];
      }
    }

    return {
      userName: settings.userName || '',
      theme: settings.theme || 'sky',
    };
  } catch (error) {
    console.error('Error fetching shared settings:', error);
    return { userName: '', theme: 'sky' };
  }
}

/**
 * Save a shared setting to Google Sheets
 */
export async function saveSharedSetting(spreadsheetId, key, value) {
  try {
    const gapi = getGapi();

    // Ensure Settings sheet exists
    await ensureSettingsSheet(spreadsheetId);

    // First, check if the key already exists
    const response = await gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${SETTINGS_SHEET_NAME}!A2:C`,
    });

    const rows = response.result.values || [];
    const existingIndex = rows.findIndex((row) => row[0] === key);
    const now = new Date().toISOString();

    if (existingIndex >= 0) {
      // Update existing row
      const rowNumber = existingIndex + 2;
      await gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${SETTINGS_SHEET_NAME}!A${rowNumber}:C${rowNumber}`,
        valueInputOption: 'RAW',
        resource: {
          values: [[key, value, now]],
        },
      });
    } else {
      // Append new row
      await gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${SETTINGS_SHEET_NAME}!A:C`,
        valueInputOption: 'RAW',
        resource: {
          values: [[key, value, now]],
        },
      });
    }

    console.log(`✅ Saved setting: ${key} = ${value}`);
  } catch (error) {
    console.error('Error saving shared setting:', error);
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

// ============================================
// PROFILES - Multi-child support
// ============================================

/**
 * Check if Profiles sheet exists
 */
async function checkProfilesSheetExists(spreadsheetId) {
  try {
    const gapi = getGapi();
    const response = await gapi.client.sheets.spreadsheets.get({
      spreadsheetId,
      fields: 'sheets.properties.title',
    });

    const sheets = response.result.sheets || [];
    return sheets.some((s) => s.properties.title === PROFILES_SHEET_NAME);
  } catch (error) {
    console.error('Error checking Profiles sheet:', error);
    return false;
  }
}

/**
 * Create the Profiles sheet
 */
async function createProfilesSheet(spreadsheetId) {
  try {
    const gapi = getGapi();

    await gapi.client.sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      resource: {
        requests: [
          {
            addSheet: {
              properties: {
                title: PROFILES_SHEET_NAME,
                gridProperties: {
                  frozenRowCount: 1,
                },
              },
            },
          },
        ],
      },
    });

    // Initialize headers
    await gapi.client.sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${PROFILES_SHEET_NAME}!A1:F1`,
      valueInputOption: 'RAW',
      resource: {
        values: [['id', 'name', 'theme', 'avatar_emoji', 'created_at', 'updated_at']],
      },
    });

    console.log('✅ Created Profiles sheet');
  } catch (error) {
    console.error('Error creating Profiles sheet:', error);
    throw error;
  }
}

/**
 * Fetch all profiles
 */
export async function fetchProfiles(spreadsheetId) {
  try {
    const gapi = getGapi();
    const response = await gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${PROFILES_SHEET_NAME}!A2:F`,
    });

    const rows = response.result.values || [];
    return rows.map((row) => ({
      id: row[0],
      name: row[1],
      theme: row[2] || 'sky',
      avatar_emoji: row[3] || '🧒',
      created_at: row[4],
      updated_at: row[5],
    }));
  } catch (error) {
    console.error('Error fetching profiles:', error);
    return [];
  }
}

/**
 * Add a new profile
 */
export async function addProfile(spreadsheetId, profileData) {
  try {
    const gapi = getGapi();
    const id = generateId();
    const now = new Date().toISOString();
    const row = [
      id,
      profileData.name,
      profileData.theme || 'sky',
      profileData.avatar_emoji || '🧒',
      now,
      now,
    ];

    await gapi.client.sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${PROFILES_SHEET_NAME}!A:F`,
      valueInputOption: 'RAW',
      resource: {
        values: [row],
      },
    });

    console.log('✅ Created profile:', profileData.name);

    return {
      id,
      name: profileData.name,
      theme: profileData.theme || 'sky',
      avatar_emoji: profileData.avatar_emoji || '🧒',
      created_at: now,
      updated_at: now,
    };
  } catch (error) {
    console.error('Error adding profile:', error);
    throw error;
  }
}

/**
 * Update a profile
 */
export async function updateProfile(spreadsheetId, profileId, updates) {
  try {
    const gapi = getGapi();
    const profiles = await fetchProfiles(spreadsheetId);
    const index = profiles.findIndex((p) => p.id === profileId);

    if (index === -1) {
      throw new Error('Profile not found');
    }

    const rowNumber = index + 2;
    const profile = profiles[index];
    const now = new Date().toISOString();

    const row = [
      profile.id,
      updates.name !== undefined ? updates.name : profile.name,
      updates.theme !== undefined ? updates.theme : profile.theme,
      updates.avatar_emoji !== undefined ? updates.avatar_emoji : profile.avatar_emoji,
      profile.created_at,
      now,
    ];

    await gapi.client.sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${PROFILES_SHEET_NAME}!A${rowNumber}:F${rowNumber}`,
      valueInputOption: 'RAW',
      resource: {
        values: [row],
      },
    });

    console.log('✅ Updated profile:', updates.name || profile.name);

    return {
      ...profile,
      ...updates,
      updated_at: now,
    };
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
}

/**
 * Delete a profile (and optionally cascade delete related data)
 */
export async function deleteProfile(spreadsheetId, profileId, cascadeDelete = false) {
  try {
    const gapi = getGapi();

    if (cascadeDelete) {
      // Delete all entries for this profile
      const entries = await fetchEntriesRaw(spreadsheetId);
      const profileEntries = entries.filter((e) => e.profile_id === profileId);
      for (let i = profileEntries.length - 1; i >= 0; i--) {
        await deleteEntry(spreadsheetId, profileEntries[i].id);
      }

      // Delete all symptoms for this profile
      const symptoms = await fetchSymptoms(spreadsheetId);
      const profileSymptoms = symptoms.filter((s) => s.profile_id === profileId);
      for (let i = profileSymptoms.length - 1; i >= 0; i--) {
        await deleteSymptom(spreadsheetId, profileSymptoms[i].id);
      }
    }

    // Delete the profile itself
    const profiles = await fetchProfiles(spreadsheetId);
    const index = profiles.findIndex((p) => p.id === profileId);

    if (index === -1) {
      throw new Error('Profile not found');
    }

    const rowNumber = index + 2;
    const sheetId = await getSheetIdByName(spreadsheetId, PROFILES_SHEET_NAME);

    if (sheetId === null) {
      throw new Error('Profiles sheet not found');
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

    console.log('✅ Deleted profile');
  } catch (error) {
    console.error('Error deleting profile:', error);
    throw error;
  }
}

/**
 * Add a column to an existing sheet
 */
async function addColumnToSheet(spreadsheetId, sheetName, columnName, columnIndex) {
  try {
    const gapi = getGapi();
    const sheetId = await getSheetIdByName(spreadsheetId, sheetName);

    if (sheetId === null) {
      console.warn(`Sheet ${sheetName} not found, skipping column addition`);
      return;
    }

    // Insert the column
    await gapi.client.sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      resource: {
        requests: [
          {
            insertDimension: {
              range: {
                sheetId: sheetId,
                dimension: 'COLUMNS',
                startIndex: columnIndex,
                endIndex: columnIndex + 1,
              },
              inheritFromBefore: false,
            },
          },
        ],
      },
    });

    // Add header for the new column
    const columnLetter = String.fromCharCode(65 + columnIndex); // A=0, B=1, etc.
    await gapi.client.sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!${columnLetter}1`,
      valueInputOption: 'RAW',
      resource: {
        values: [[columnName]],
      },
    });

    console.log(`✅ Added column '${columnName}' to ${sheetName}`);
  } catch (error) {
    console.error(`Error adding column to ${sheetName}:`, error);
    throw error;
  }
}

/**
 * Backfill a column with a value for all existing rows
 */
async function backfillColumn(spreadsheetId, sheetName, columnIndex, value) {
  try {
    const gapi = getGapi();

    // Get all rows (excluding header)
    const response = await gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A2:A`,
    });

    const rows = response.result.values || [];
    if (rows.length === 0) {
      console.log(`No rows to backfill in ${sheetName}`);
      return;
    }

    // Create values array with the same value for each row
    const columnLetter = String.fromCharCode(65 + columnIndex);
    const values = rows.map(() => [value]);

    await gapi.client.sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!${columnLetter}2:${columnLetter}${rows.length + 1}`,
      valueInputOption: 'RAW',
      resource: {
        values: values,
      },
    });

    console.log(`✅ Backfilled ${rows.length} rows in ${sheetName} with profile_id`);
  } catch (error) {
    console.error(`Error backfilling column in ${sheetName}:`, error);
    throw error;
  }
}

/**
 * Ensure multi-profile support is set up (migration for existing users)
 * This adds the Profiles sheet and profile_id columns to Symptoms/Entries
 */
export async function ensureMultiProfileSupport(spreadsheetId) {
  try {
    // Check if already migrated
    const profilesExist = await checkProfilesSheetExists(spreadsheetId);
    if (profilesExist) {
      return; // Already set up
    }

    console.log('🔄 Migrating to multi-profile support...');

    // 1. Create Profiles sheet
    await createProfilesSheet(spreadsheetId);

    // 2. Get current settings for default profile
    const settings = await fetchSharedSettings(spreadsheetId);

    // 3. Create default profile from existing userName
    const defaultProfile = await addProfile(spreadsheetId, {
      name: settings.userName || 'Gyermek',
      theme: settings.theme || 'sky',
      avatar_emoji: '🧒',
    });

    // 4. Add profile_id column to Symptoms sheet (column E, index 4)
    // Current: id, name, emoji, parent_only, created_at, updated_at
    // New: id, name, emoji, parent_only, profile_id, created_at, updated_at
    await addColumnToSheet(spreadsheetId, SYMPTOMS_SHEET_NAME, 'profile_id', 4);

    // 5. Add profile_id column to Entries sheet (column C, index 2)
    // Current: id, symptom_id, date, timestamp, ...
    // New: id, symptom_id, profile_id, date, timestamp, ...
    await addColumnToSheet(spreadsheetId, ENTRIES_SHEET_NAME, 'profile_id', 2);

    // 6. Backfill existing data with default profile ID
    await backfillColumn(spreadsheetId, SYMPTOMS_SHEET_NAME, 4, defaultProfile.id);
    await backfillColumn(spreadsheetId, ENTRIES_SHEET_NAME, 2, defaultProfile.id);

    console.log('✅ Migration to multi-profile support complete');
    return defaultProfile;
  } catch (error) {
    console.error('Error during multi-profile migration:', error);
    throw error;
  }
}
