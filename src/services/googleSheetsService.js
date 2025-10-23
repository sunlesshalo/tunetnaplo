import { gapi } from '../googleClient';

const SPREADSHEET_NAME = 'Tünetnapló';
const SYMPTOMS_SHEET_NAME = 'Symptoms';
const ENTRIES_SHEET_NAME = 'Entries';

/**
 * Find or create the user's Tünetnapló spreadsheet
 */
export async function findOrCreateSpreadsheet() {
  try {
    // Search for existing spreadsheet
    const response = await gapi.client.drive.files.list({
      q: `name='${SPREADSHEET_NAME}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`,
      fields: 'files(id, name)',
      spaces: 'drive',
    });

    const files = response.result.files || [];

    if (files.length > 0) {
      console.log('✅ Found existing spreadsheet:', files[0].id);
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
 * Get or initialize spreadsheet
 */
export async function getSpreadsheetId(userId) {
  let spreadsheetId = getCachedSpreadsheetId(userId);

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
 * Delete a symptom
 */
export async function deleteSymptom(spreadsheetId, symptomId) {
  try {
    const symptoms = await fetchSymptoms(spreadsheetId);
    const index = symptoms.findIndex((s) => s.id === symptomId);

    if (index === -1) {
      throw new Error('Symptom not found');
    }

    const rowNumber = index + 2;

    await gapi.client.sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      resource: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: 0, // Symptoms sheet is first (ID 0)
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
    const entries = await fetchEntries(spreadsheetId);
    const index = entries.findIndex((e) => e.id === entryId);

    if (index === -1) {
      throw new Error('Entry not found');
    }

    const rowNumber = index + 2;

    await gapi.client.sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      resource: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: 1, // Entries sheet is second (ID 1)
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
