'use client'

import { useMemo, useState } from 'react'

function unique(items) {
  return [...new Set(items.filter(Boolean))].sort((a, b) => a.localeCompare(b))
}

function relativeDate(dateValue) {
  if (!dateValue) return 'No date'
  const days = Math.ceil((new Date(`${dateValue}T12:00:00`) - new Date().setHours(0, 0, 0, 0)) / 86400000)
  if (days < 0) return `${Math.abs(days)}d ago`
  if (days === 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  return `In ${days}d`
}

function readinessBand(score) {
  if (score >= 90) return 'Ready'
  if (score >= 70) return 'Advancing'
  if (score >= 45) return 'Needs work'
  return 'At risk'
}

function ShowCard({ show }) {
  const score = show.readiness?.score || 0
  const warnings = show.readiness?.warnings || []
  return (
    <a className="asi-card" href={`/admin/shows/${show.id}`}>
      <div className="asi-card-top"><span>{relativeDate(show.date)}</span><em>{show.status}</em></div>
      <div><h2>{show.band}</h2><p>{show.venue} · {show.dateLabel} · {show.startTime}</p></div>
      <div className="asi-score"><div><i style={{ width: `${score}%` }} /></div><strong>{score}%</strong></div>
      <div className="asi-card-foot"><span>{readinessBand(score)}</span><span>{show.owner}</span><b>{warnings.length ? `${warnings.length} open` : 'On track'}</b></div>
    </a>
  )
}

export default function AdminShowsClient({ shows = [] }) {
  const [filters, setFilters] = useState({
    search: '',
    band: '',
    venue: '',
    status: '',
    readiness: '',
    owner: '',
    dateWindow: 'upcoming',
  })

  const options = useMemo(() => ({
    bands: unique(shows.map(show => show.band)),
    venues: unique(shows.map(show => show.venue)),
    statuses: unique(shows.map(show => show.status)),
    owners: unique(shows.map(show => show.owner).filter(owner => owner !== 'Unassigned')),
  }), [shows])

  const filtered = useMemo(() => {
    const query = filters.search.trim().toLowerCase()
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return shows.filter(show => {
      const showDate = show.date ? new Date(`${show.date}T12:00:00`) : null
      const haystack = `${show.band} ${show.venue} ${show.owner} ${show.status}`.toLowerCase()
      if (query && !haystack.includes(query)) return false
      if (filters.band && show.band !== filters.band) return false
      if (filters.venue && show.venue !== filters.venue) return false
      if (filters.status && show.status !== filters.status) return false
      if (filters.owner && show.owner !== filters.owner) return false
      if (filters.readiness && readinessBand(show.readiness?.score || 0) !== filters.readiness) return false
      if (filters.dateWindow === 'upcoming' && showDate && showDate < today) return false
      if (filters.dateWindow === 'past' && (!showDate || showDate >= today)) return false
      return true
    })
  }, [filters, shows])

  function update(name, value) {
    setFilters(current => ({ ...current, [name]: value }))
  }

  function reset() {
    setFilters({ search: '', band: '', venue: '', status: '', readiness: '', owner: '', dateWindow: 'upcoming' })
  }

  return (
    <section className="asi-shell">
      <style>{`
        .asi-shell{display:grid;gap:var(--s-5)}.asi-filters{border:1px solid var(--c-border);background:rgba(255,255,255,.018);padding:var(--s-4);display:grid;grid-template-columns:minmax(220px,1.5fr) repeat(6,minmax(120px,1fr));gap:10px}.asi-filters input,.asi-filters select{min-height:46px;border:1px solid var(--c-border);background:#060606;color:var(--c-text-muted);padding:0 12px;font:inherit}.asi-reset{border:1px solid var(--c-epl-line);background:transparent;color:var(--c-epl);font-family:var(--ff-label);font-size:10px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;cursor:pointer}.asi-summary{display:flex;justify-content:space-between;gap:12px;color:var(--c-text-dim);font-size:14px}.asi-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.asi-card{border:1px solid var(--c-border);background:#070707;color:inherit;text-decoration:none;padding:var(--s-4);display:grid;gap:18px;min-height:235px;transition:transform .18s ease,border-color .18s ease}.asi-card:hover{transform:translateY(-3px);border-color:var(--c-epl-line)}.asi-card-top,.asi-card-foot{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}.asi-card-top span,.asi-card-top em,.asi-card-foot span,.asi-card-foot b{font-family:var(--ff-label);font-size:10px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;font-style:normal}.asi-card-top span,.asi-card-foot b{color:var(--c-epl)}.asi-card-top em,.asi-card-foot span{color:var(--c-text-faint)}.asi-card h2{font-family:var(--ff-display);font-size:clamp(38px,4vw,58px);line-height:.86;letter-spacing:var(--ls-display)}.asi-card p{color:var(--c-text-dim);line-height:var(--lh-snug);margin-top:9px}.asi-score{display:grid;grid-template-columns:1fr auto;align-items:center;gap:12px}.asi-score>div{height:8px;background:rgba(255,255,255,.08);overflow:hidden}.asi-score i{display:block;height:100%;background:var(--c-epl)}.asi-score strong{font-family:var(--ff-label);font-size:11px;color:var(--c-epl)}.asi-empty{border:1px dashed var(--c-border);padding:var(--s-6);color:var(--c-text-muted);grid-column:1/-1}@media(max-width:1180px){.asi-filters{grid-template-columns:repeat(3,1fr)}.asi-filters input{grid-column:span 2}.asi-grid{grid-template-columns:repeat(2,1fr)}}@media(max-width:720px){.asi-filters{grid-template-columns:1fr}.asi-filters input{grid-column:auto}.asi-grid{grid-template-columns:1fr}.asi-card{min-height:210px}.asi-summary{display:grid}}
      `}</style>

      <div className="asi-filters" aria-label="Show filters">
        <input aria-label="Search shows" value={filters.search} onChange={event => update('search', event.target.value)} placeholder="Search band, venue, owner…" />
        <select aria-label="Date window" value={filters.dateWindow} onChange={event => update('dateWindow', event.target.value)}><option value="upcoming">Upcoming</option><option value="past">Past</option><option value="all">All dates</option></select>
        <select aria-label="Band" value={filters.band} onChange={event => update('band', event.target.value)}><option value="">All bands</option>{options.bands.map(item => <option key={item}>{item}</option>)}</select>
        <select aria-label="Venue" value={filters.venue} onChange={event => update('venue', event.target.value)}><option value="">All venues</option>{options.venues.map(item => <option key={item}>{item}</option>)}</select>
        <select aria-label="Lifecycle" value={filters.status} onChange={event => update('status', event.target.value)}><option value="">All stages</option>{options.statuses.map(item => <option key={item}>{item}</option>)}</select>
        <select aria-label="Readiness" value={filters.readiness} onChange={event => update('readiness', event.target.value)}><option value="">All readiness</option>{['Ready', 'Advancing', 'Needs work', 'At risk'].map(item => <option key={item}>{item}</option>)}</select>
        <select aria-label="Owner" value={filters.owner} onChange={event => update('owner', event.target.value)}><option value="">All owners</option><option value="Unassigned">Unassigned</option>{options.owners.map(item => <option key={item}>{item}</option>)}</select>
        <button type="button" className="asi-reset" onClick={reset}>Reset</button>
      </div>

      <div className="asi-summary"><strong>{filtered.length} show{filtered.length === 1 ? '' : 's'}</strong><span>Filters run locally, so the list responds immediately.</span></div>
      <div className="asi-grid">{filtered.length ? filtered.map(show => <ShowCard key={show.id} show={show} />) : <div className="asi-empty">No shows match these filters.</div>}</div>
    </section>
  )
}
