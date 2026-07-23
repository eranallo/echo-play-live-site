'use client'

export default function RunOfShowActions({ pdfHref }) {
  return (
    <div className="portal-run-actions" data-print-hidden>
      <button type="button" onClick={() => window.print()}>
        Print Run of Show
      </button>
      <a href={pdfHref} download>
        Download PDF
      </a>
    </div>
  )
}
