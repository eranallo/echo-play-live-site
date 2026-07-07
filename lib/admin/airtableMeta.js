const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || 'appYUOoJgvRyZ7fLB'
const AIRTABLE_API_TOKEN = process.env.AIRTABLE_API_TOKEN || process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN

const REQUIRED_TABLES = [
  {
    name: 'AI AGENTS',
    purpose: 'Stores definitions for each Echo Play Live AI specialist.',
    requiredFields: [
      'Agent Name',
      'Agent Type',
      'Status',
      'Purpose',
      'Instructions',
      'Allowed Tools',
      'Approval Required For',
      'Output Schema',
      'Version',
      'Last Updated',
    ],
  },
  {
    name: 'AI RUNS',
    purpose: 'Logs every AI specialist run, what it used, what it produced, and whether approval was required.',
    requiredFields: [
      'Run Name',
      'Agent',
      'User Request',
      'Related Show',
      'Input Sources',
      'Output Summary',
      'Proposed Actions',
      'Approval Status',
      'Error / Issue',
      'Created At',
    ],
  },
  {
    name: 'APPROVAL QUEUE',
    purpose: 'Stores proposed actions that need review before Airtable, Gmail, Canva, website, or publishing changes happen.',
    requiredFields: [
      'Approval Item',
      'Related Agent Run',
      'Related Show',
      'Action Type',
      'Proposed Change',
      'Risk Level',
      'Status',
      'Approved By',
      'Approved At',
      'Completed At',
    ],
  },
]

async function airtableMetaFetch() {
  if (!AIRTABLE_API_TOKEN) {
    throw new Error('Missing Airtable server credential in Vercel.')
  }

  const response = await fetch(`https://api.airtable.com/v0/meta/bases/${AIRTABLE_BASE_ID}/tables`, {
    headers: {
      Authorization: `Bearer ${AIRTABLE_API_TOKEN.trim()}`,
    },
    cache: 'no-store',
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Airtable metadata request failed (${response.status}): ${text.slice(0, 240)}`)
  }

  return response.json()
}

function normalizeTable(table, requiredConfig) {
  if (!table) {
    return {
      name: requiredConfig.name,
      id: null,
      exists: false,
      ready: false,
      purpose: requiredConfig.purpose,
      fields: [],
      missingFields: requiredConfig.requiredFields,
      extraFields: [],
      requiredFields: requiredConfig.requiredFields,
    }
  }

  const fields = (table.fields || []).map(field => ({
    id: field.id,
    name: field.name,
    type: field.type,
  }))

  const fieldNames = new Set(fields.map(field => field.name))
  const missingFields = requiredConfig.requiredFields.filter(name => !fieldNames.has(name))
  const requiredFieldSet = new Set(requiredConfig.requiredFields)
  const extraFields = fields.filter(field => !requiredFieldSet.has(field.name))

  return {
    name: requiredConfig.name,
    id: table.id,
    exists: true,
    ready: missingFields.length === 0,
    purpose: requiredConfig.purpose,
    fields,
    missingFields,
    extraFields,
    requiredFields: requiredConfig.requiredFields,
  }
}

export async function getAirtableSetupStatus() {
  try {
    const data = await airtableMetaFetch()
    const tables = data.tables || []

    const supportTables = REQUIRED_TABLES.map(config => {
      const table = tables.find(item => item.name === config.name)
      return normalizeTable(table, config)
    })

    return {
      ok: true,
      error: null,
      baseId: AIRTABLE_BASE_ID,
      supportsMetadata: true,
      supportTables,
      counts: {
        existing: supportTables.filter(table => table.exists).length,
        ready: supportTables.filter(table => table.ready).length,
        required: supportTables.length,
      },
    }
  } catch (error) {
    return {
      ok: false,
      error: error?.message || 'Unknown Airtable metadata error',
      baseId: AIRTABLE_BASE_ID,
      supportsMetadata: false,
      supportTables: REQUIRED_TABLES.map(config => normalizeTable(null, config)),
      counts: {
        existing: 0,
        ready: 0,
        required: REQUIRED_TABLES.length,
      },
    }
  }
}
