import fs from 'node:fs/promises'
import path from 'node:path'
import { NextResponse } from 'next/server'
import { getAdminShowDocument } from '@/lib/admin/airtable'
import { adminUnauthorized, isAdminAuthorized } from '@/lib/admin/auth'
import {
  SHOW_DOCUMENT_KIND_IDS,
  documentFilename,
} from '@/lib/documents/showDocumentModel.mjs'
import { renderShowDocumentPdf } from '@/lib/documents/showDocumentPdf.mjs'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request, { params }) {
  if (!isAdminAuthorized(request)) return adminUnauthorized()

  try {
    const { id, kind } = await params
    if (!id || !SHOW_DOCUMENT_KIND_IDS.has(kind)) {
      return NextResponse.json(
        { ok: false, error: 'Unknown show document.' },
        { status: 404, headers: { 'Cache-Control': 'no-store' } }
      )
    }

    const result = await getAdminShowDocument(id)
    if (!result.ok || !result.document) {
      return NextResponse.json(
        { ok: false, error: result.error || 'Show document could not be loaded.' },
        { status: 404, headers: { 'Cache-Control': 'no-store' } }
      )
    }

    const logoPath = path.join(process.cwd(), 'public', 'logo.png')
    const logoBytes = await fs.readFile(logoPath).catch(() => null)
    const pdfBytes = await renderShowDocumentPdf({
      kindId: kind,
      model: result.document,
      logoBytes,
    })
    const disposition = new URL(request.url).searchParams.get('view') === '1'
      ? 'inline'
      : 'attachment'

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `${disposition}; filename="${documentFilename(result.document, kind)}"`,
        'Cache-Control': 'no-store',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    })
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: error?.message || 'Show document generation failed.',
    }, {
      status: 500,
      headers: {
        'Cache-Control': 'no-store',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    })
  }
}
