'use client'

import { useState } from 'react'

const CHECKBOX_FIELDS = [
  ['Contract Signed', 'Contract Signed'],
  ['Graphic Created', 'Graphic Created'],
  ['Trailer Reserved', 'Trailer Reserved'],
  ['Facebook Event Created', 'Facebook Event Created'],
  ['Bandsintown Posted', 'Bandsintown Posted'],
  ['Promotion Released', 'Promotion Released'],
  ['Ads Running', 'Ads Running'],
]

function ControlButton({ children, disabled, onClick }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      border: '1px solid var(--c-epl-line)',
      color: disabled ? 'var(--c-text-faint)' : 'var(--c-epl)',
      padding: '10px 14px',
      fontFamily: 'var(--ff-label)',
      fontSize: '11px',
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      background: disabled ? 'var(--c-surface-2)' : 'rgba(212, 160, 23, 0.06)',
      cursor: disabled ? 'not-allowed' : 'pointer',
    }}>
      {children}
    </button>
  )
}

function Message({ message }) {
  if (!message) return null

  return (
    <p style={{
      color: message.type === 'error' ? '#f3a6a6' : 'var(--c-epl)',
      lineHeight: 'var(--lh-base)',
      marginTop: 'var(--s-3)',
    }}>
      {message.text}
    </p>
  )
}

export default function ShowControls({ showId, notes, checklist }) {
  const [form, setForm] = useState({
    'Show Notes': notes?.showNotes || '',
    'Sound Notes': notes?.soundNotes || '',
    'Merch Notes': notes?.merchNotes || '',
  })
  const [checkboxes, setCheckboxes] = useState(() => {
    const values = {}
    for (const [fieldName, label] of CHECKBOX_FIELDS) {
      const item = checklist?.find(entry => entry.label === label)
      values[fieldName] = Boolean(item?.complete)
    }
    return values
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)

  function updateText(fieldName, value) {
    setForm(prev => ({ ...prev, [fieldName]: value }))
  }

  async function saveFields(fields, successText) {
    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch(`/api/admin/shows/${showId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields }),
      })
      const data = await response.json()

      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'Show update failed.')
      }

      setMessage({ type: 'success', text: successText })
    } catch (error) {
      setMessage({ type: 'error', text: error?.message || 'Show update failed.' })
    } finally {
      setSaving(false)
    }
  }

  async function saveNotes() {
    await saveFields(form, 'Notes saved to Airtable.')
  }

  async function toggleCheckbox(fieldName) {
    const nextValue = !checkboxes[fieldName]
    setCheckboxes(prev => ({ ...prev, [fieldName]: nextValue }))
    await saveFields({ [fieldName]: nextValue }, `${fieldName} updated.`)
  }

  return (
    <div style={{ display: 'grid', gap: 'var(--s-5)' }}>
      <div style={{ display: 'grid', gap: 'var(--s-4)' }}>
        {Object.entries(form).map(([fieldName, value]) => (
          <label key={fieldName} style={{ display: 'grid', gap: 'var(--s-2)' }}>
            <span style={{
              fontFamily: 'var(--ff-label)',
              fontSize: '10px',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--c-text-faint)',
            }}>
              {fieldName}
            </span>
            <textarea
              value={value}
              onChange={event => updateText(fieldName, event.target.value)}
              rows={4}
              style={{
                width: '100%',
                border: '1px solid var(--c-border)',
                background: 'var(--c-bg)',
                color: 'var(--c-text-muted)',
                padding: 'var(--s-3)',
                font: 'inherit',
                lineHeight: 'var(--lh-base)',
              }}
            />
          </label>
        ))}
        <ControlButton onClick={saveNotes} disabled={saving}>Save Notes</ControlButton>
      </div>

      <div style={{ borderTop: '1px solid var(--c-border-subtle)', paddingTop: 'var(--s-5)' }}>
        <div className="section-label" style={{ marginBottom: 'var(--s-3)' }}>
          Manual Status Toggles
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--s-2)' }}>
          {CHECKBOX_FIELDS.map(([fieldName, label]) => (
            <button key={fieldName} onClick={() => toggleCheckbox(fieldName)} disabled={saving} style={{
              border: `1px solid ${checkboxes[fieldName] ? 'var(--c-epl-line)' : 'var(--c-border)'}`,
              background: checkboxes[fieldName] ? 'rgba(212, 160, 23, 0.08)' : 'var(--c-surface-2)',
              color: checkboxes[fieldName] ? 'var(--c-epl)' : 'var(--c-text-dim)',
              padding: '8px 10px',
              fontFamily: 'var(--ff-label)',
              fontSize: '10px',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              cursor: saving ? 'not-allowed' : 'pointer',
            }}>
              {checkboxes[fieldName] ? '✓ ' : ''}{label}
            </button>
          ))}
        </div>
      </div>

      <Message message={message} />
    </div>
  )
}
