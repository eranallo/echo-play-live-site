'use client'

import { useState } from 'react'

function ActionButton({ children, disabled, onClick }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      border: '1px solid var(--c-epl-line)',
      color: disabled ? 'var(--c-text-faint)' : 'var(--c-epl)',
      padding: '12px 14px',
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
    <div style={{
      border: `1px solid ${message.type === 'error' ? '#8a3030' : 'var(--c-epl-line)'}`,
      background: message.type === 'error' ? 'rgba(138, 48, 48, 0.12)' : 'rgba(212, 160, 23, 0.06)',
      color: message.type === 'error' ? '#f3a6a6' : 'var(--c-text-muted)',
      padding: 'var(--s-4)',
      lineHeight: 'var(--lh-base)',
    }}>
      {message.text}
    </div>
  )
}

function TextBlock({ title, children }) {
  if (!children) return null

  return (
    <div style={{ borderTop: '1px solid var(--c-border-subtle)', paddingTop: 'var(--s-4)' }}>
      <div style={{
        fontFamily: 'var(--ff-label)',
        fontSize: '10px',
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: 'var(--c-text-faint)',
        marginBottom: 'var(--s-2)',
      }}>
        {title}
      </div>
      <div style={{ color: 'var(--c-text-muted)', whiteSpace: 'pre-wrap', lineHeight: 'var(--lh-base)' }}>
        {children}
      </div>
    </div>
  )
}

function ListBlock({ title, items }) {
  if (!Array.isArray(items) || items.length === 0) return null

  return (
    <div style={{ borderTop: '1px solid var(--c-border-subtle)', paddingTop: 'var(--s-4)' }}>
      <div style={{
        fontFamily: 'var(--ff-label)',
        fontSize: '10px',
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: 'var(--c-text-faint)',
        marginBottom: 'var(--s-2)',
      }}>
        {title}
      </div>
      <ul style={{ color: 'var(--c-text-muted)', lineHeight: 'var(--lh-base)', paddingLeft: '1.1rem' }}>
        {items.map((item, index) => (
          <li key={`${title}-${index}`}>{typeof item === 'string' ? item : JSON.stringify(item)}</li>
        ))}
      </ul>
    </div>
  )
}

export default function CampaignDraftPanel({ showId }) {
  const [loading, setLoading] = useState(false)
  const [approving, setApproving] = useState(false)
  const [result, setResult] = useState(null)
  const [message, setMessage] = useState(null)

  async function generateCampaign() {
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch(`/api/admin/shows/${showId}/campaign`, {
        method: 'POST',
      })
      const data = await response.json()

      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'Campaign generation failed.')
      }

      setResult(data)
      setMessage({
        type: data.usedFallback ? 'success' : 'success',
        text: data.usedFallback
          ? 'Campaign draft created with the built-in fallback generator. Add OPENAI_API_KEY later for full AI generation.'
          : 'Campaign draft created and approval item queued.',
      })
    } catch (error) {
      setMessage({ type: 'error', text: error?.message || 'Campaign generation failed.' })
    } finally {
      setLoading(false)
    }
  }

  async function approveEventDescription() {
    if (!result?.approvalItemId) return
    setApproving(true)
    setMessage(null)

    try {
      const response = await fetch(`/api/admin/approvals/${result.approvalItemId}/approve`, {
        method: 'POST',
      })
      const data = await response.json()

      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'Approval failed.')
      }

      setMessage({ type: 'success', text: 'Approved and saved to Airtable. Refresh the page to see the updated Event Description field.' })
    } catch (error) {
      setMessage({ type: 'error', text: error?.message || 'Approval failed.' })
    } finally {
      setApproving(false)
    }
  }

  const campaign = result?.campaign
  const copy = campaign?.copy || {}
  const video = campaign?.short_form_video || {}
  const graphics = campaign?.graphics || {}

  return (
    <div style={{ display: 'grid', gap: 'var(--s-5)' }}>
      <div style={{ display: 'flex', gap: 'var(--s-3)', flexWrap: 'wrap' }}>
        <ActionButton onClick={generateCampaign} disabled={loading}>
          {loading ? 'Generating…' : 'Generate Campaign Draft'}
        </ActionButton>
        <ActionButton onClick={approveEventDescription} disabled={!result?.approvalItemId || approving}>
          {approving ? 'Saving…' : 'Approve + Save Event Description'}
        </ActionButton>
      </div>

      <Message message={message} />

      {result?.approvalError && (
        <Message message={{ type: 'error', text: `Approval item could not be created: ${result.approvalError}` }} />
      )}

      {result?.aiRunError && (
        <Message message={{ type: 'error', text: `AI run log could not be created: ${result.aiRunError}` }} />
      )}

      {campaign && (
        <article style={{
          border: '1px solid var(--c-border)',
          background: 'rgba(255, 255, 255, 0.015)',
          padding: 'var(--s-5)',
          display: 'grid',
          gap: 'var(--s-4)',
        }}>
          <div>
            <div className="section-label" style={{ color: 'var(--c-epl)', marginBottom: 'var(--s-3)' }}>
              Draft Ready
            </div>
            <h3 style={{
              fontFamily: 'var(--ff-display)',
              fontSize: 'var(--t-h3)',
              letterSpacing: 'var(--ls-display)',
            }}>
              {copy.event_title || campaign?.campaign_summary?.show_name || 'Campaign Draft'}
            </h3>
          </div>

          <TextBlock title="Long Event Description">{copy.long_event_description}</TextBlock>
          <TextBlock title="Short Blurb">{copy.short_blurb}</TextBlock>
          <TextBlock title="Facebook Caption">{copy.facebook_caption}</TextBlock>
          <TextBlock title="Instagram Caption">{copy.instagram_caption}</TextBlock>
          <TextBlock title="Venue Co-Promo">{copy.venue_copromo_blurb}</TextBlock>
          <TextBlock title="Bandsintown Listing">{copy.bandsintown_listing}</TextBlock>
          <ListBlock title="Reel Hooks" items={video.reel_hooks} />
          <ListBlock title="Story Frames" items={video.story_frames} />
          <TextBlock title="Creative Direction">{graphics.creative_direction}</TextBlock>
          <ListBlock title="Required Text" items={graphics.required_text} />
          <ListBlock title="Missing Information" items={campaign.missing_information} />
          <ListBlock title="Recommended Next Actions" items={campaign.recommended_next_actions} />
        </article>
      )}
    </div>
  )
}
