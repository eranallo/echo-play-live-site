'use client'

import { usePathname } from 'next/navigation'
import { useState } from 'react'

const PRIMARY_LINKS = [
  ['Today', '/admin'],
  ['Tasks', '/admin/tasks'],
  ['Shows', '/admin#shows'],
  ['Chief', '/admin/chief-of-staff'],
  ['Specialists', '/admin/specialists'],
  ['Approvals', '/admin/approvals'],
  ['Portal', '/portal'],
]

const SPECIALIST_LINKS = [
  ['Advance', '/admin/specialists/advance'],
  ['Promo', '/admin/specialists/promo'],
  ['Design', '/admin/specialists/design'],
  ['Booking', '/admin/specialists/booking'],
  ['Finance', '/admin/specialists/finance'],
  ['Content', '/admin/specialists/content'],
  ['Web', '/admin/specialists/web'],
  ['Merch', '/admin/specialists/merch'],
]

const TOOL_LINKS = [
  ['Airtable', 'https://airtable.com/appYUOoJgvRyZ7fLB'],
  ['Gmail', 'https://mail.google.com/'],
  ['Calendar', 'https://calendar.google.com/'],
  ['Drive', 'https://drive.google.com/drive/my-drive'],
  ['Canva', 'https://www.canva.com/'],
  ['Vercel', 'https://vercel.com/eranallo-6688s-projects/echo-play-live-site'],
]

function isActive(pathname, href) {
  const path = href.split('#')[0]
  if (path === '/admin') return pathname === '/admin'
  return pathname === path || pathname.startsWith(`${path}/`)
}

function NavLink({ href, children, onClick }) {
  const pathname = usePathname()
  const external = href.startsWith('http')
  const active = !external && isActive(pathname, href)

  return (
    <a className={`an-link ${active ? 'an-active' : ''}`} href={href} onClick={onClick} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined}>
      {children}
    </a>
  )
}

export default function AdminNav({ contextLabel = 'Echo Play OS', backHref = '', backLabel = 'Back' }) {
  const [open, setOpen] = useState(false)

  function close() {
    setOpen(false)
  }

  return (
    <>
      <style>{`
        .an-shell{position:fixed;top:0;left:0;right:0;z-index:1000;background:rgba(5,5,5,.88);border-bottom:1px solid var(--c-border);backdrop-filter:blur(18px);color:var(--c-text)}.an-wrap{max-width:var(--layout-max);margin:0 auto;padding:0 var(--gutter-fluid);min-height:58px;display:grid;grid-template-columns:auto 1fr auto;gap:14px;align-items:center}.an-brand{display:flex;align-items:center;gap:10px;color:inherit;text-decoration:none;min-width:max-content}.an-mark{width:10px;height:10px;background:var(--c-epl);box-shadow:0 0 28px rgba(212,160,23,.55)}.an-brand span,.an-link,.an-menu-button,.an-back,.an-section-title{font-family:var(--ff-label);font-size:10px;font-weight:900;letter-spacing:.14em;text-transform:uppercase;text-decoration:none}.an-brand span{color:var(--c-epl)}.an-context{color:var(--c-text-faint);font-family:var(--ff-label);font-size:10px;letter-spacing:.12em;text-transform:uppercase}.an-links{display:flex;justify-content:flex-end;gap:6px;align-items:center}.an-link,.an-back{color:var(--c-text-muted);border:1px solid transparent;padding:8px 10px}.an-link:hover,.an-back:hover,.an-active{color:var(--c-epl);border-color:var(--c-epl-line);background:rgba(212,160,23,.06)}.an-back{display:inline-flex;align-items:center;gap:6px}.an-menu-button{display:none;min-height:40px;border:1px solid var(--c-border);background:#070707;color:var(--c-epl);padding:0 12px;cursor:pointer}.an-menu-button i{display:inline-block;width:14px;height:10px;border-top:2px solid currentColor;border-bottom:2px solid currentColor;margin-right:8px;position:relative}.an-menu-button i:before{content:'';position:absolute;left:0;right:0;top:3px;border-top:2px solid currentColor}.an-overlay{position:fixed;inset:0;z-index:999;background:rgba(0,0,0,.64);opacity:0;pointer-events:none;transition:opacity .18s ease}.an-overlay-open{opacity:1;pointer-events:auto}.an-panel{position:fixed;top:0;right:0;bottom:0;width:min(430px,92vw);z-index:1001;background:#050505;border-left:1px solid var(--c-border);transform:translateX(100%);transition:transform .22s ease;color:var(--c-text);overflow:auto}.an-panel-open{transform:none}.an-panel-head{min-height:62px;display:flex;justify-content:space-between;align-items:center;gap:16px;padding:0 var(--s-4);border-bottom:1px solid var(--c-border)}.an-close{border:1px solid var(--c-border);background:#070707;color:var(--c-text-muted);width:40px;height:40px;font-size:24px;line-height:1;cursor:pointer}.an-close:hover{border-color:var(--c-epl-line);color:var(--c-epl)}.an-panel-body{display:grid;gap:var(--s-5);padding:var(--s-4)}.an-section{display:grid;gap:8px}.an-section-title{color:var(--c-epl);margin-bottom:4px}.an-mobile-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.an-mobile-grid .an-link{display:grid;min-height:46px;place-items:center;text-align:center;background:#070707;border-color:var(--c-border)}.an-wide{grid-column:1 / -1}.an-bottom{display:none;position:fixed;left:0;right:0;bottom:0;z-index:900;background:rgba(5,5,5,.94);border-top:1px solid var(--c-border);backdrop-filter:blur(18px);grid-template-columns:repeat(5,1fr)}.an-bottom .an-link{min-height:54px;display:grid;place-items:center;border:0;border-right:1px solid var(--c-border);padding:0}.an-bottom .an-link:last-child{border-right:0}@media(max-width:1020px){.an-wrap{grid-template-columns:auto 1fr auto}.an-links{display:none}.an-menu-button{display:inline-flex;align-items:center}.an-context{justify-self:end;margin-right:4px}.an-bottom{display:grid}}@media(max-width:680px){.an-wrap{min-height:56px}.an-context{display:none}.an-brand span{font-size:9px}.an-mobile-grid{grid-template-columns:1fr}.an-wide{grid-column:auto}}
      `}</style>

      <nav className="an-shell" aria-label="Echo Play OS navigation">
        <div className="an-wrap">
          <a className="an-brand" href="/admin"><span className="an-mark" aria-hidden="true" /><span>Echo Play OS</span></a>
          <div className="an-context">{contextLabel}</div>
          <div className="an-links">
            {backHref && <a className="an-back" href={backHref}>← {backLabel}</a>}
            {PRIMARY_LINKS.map(([label, href]) => <NavLink key={href} href={href}>{label}</NavLink>)}
          </div>
          <button className="an-menu-button" type="button" onClick={() => setOpen(true)} aria-expanded={open} aria-controls="admin-nav-panel"><i aria-hidden="true" />Menu</button>
        </div>
      </nav>

      <div className={`an-overlay ${open ? 'an-overlay-open' : ''}`} onClick={close} />
      <aside id="admin-nav-panel" className={`an-panel ${open ? 'an-panel-open' : ''}`} aria-hidden={!open}>
        <div className="an-panel-head"><div><div className="an-section-title">Echo Play OS</div><div className="an-context" style={{ display: 'block' }}>{contextLabel}</div></div><button type="button" className="an-close" onClick={close} aria-label="Close menu">×</button></div>
        <div className="an-panel-body">
          {backHref && <div className="an-section"><a className="an-back an-wide" href={backHref} onClick={close}>← {backLabel}</a></div>}
          <div className="an-section"><div className="an-section-title">Main</div><div className="an-mobile-grid">{PRIMARY_LINKS.map(([label, href]) => <NavLink key={href} href={href} onClick={close}>{label}</NavLink>)}</div></div>
          <div className="an-section"><div className="an-section-title">Specialists</div><div className="an-mobile-grid">{SPECIALIST_LINKS.map(([label, href]) => <NavLink key={href} href={href} onClick={close}>{label}</NavLink>)}</div></div>
          <div className="an-section"><div className="an-section-title">Tools</div><div className="an-mobile-grid">{TOOL_LINKS.map(([label, href]) => <NavLink key={href} href={href} onClick={close}>{label}</NavLink>)}</div></div>
        </div>
      </aside>

      <nav className="an-bottom" aria-label="Mobile quick navigation">
        <NavLink href="/admin">Today</NavLink>
        <NavLink href="/admin/tasks">Tasks</NavLink>
        <NavLink href="/admin#shows">Shows</NavLink>
        <NavLink href="/admin/specialists">Agents</NavLink>
        <NavLink href="/admin/approvals">Review</NavLink>
      </nav>
    </>
  )
}
