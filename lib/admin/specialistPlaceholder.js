import { createAiRunLog, createApprovalItem, getAdminCampaignContext } from '@/lib/admin/airtable'

export const WORK_LANES = {
  advance: { label: 'Show Advance', review: false },
  promo: { label: 'Promo Plan', review: true },
  design: { label: 'Design Brief', review: true },
}

export function workLaneOptions() {
  return Object.entries(WORK_LANES).map(([kind, lane]) => ({ kind, ...lane }))
}

export async function loadWorkContext(showId) {
  return getAdminCampaignContext(showId)
}

export async function saveWorkLog({ name, notes, review }) {
  const run = await createAiRunLog({ name, notes, status: 'Draft' }).catch(error => ({ id: null, error: error?.message }))
  let reviewRecord = null
  if (review) {
    reviewRecord = await createApprovalItem({ name: `${name} Review`, status: 'Pending', notes }).catch(error => ({ id: null, error: error?.message }))
  }
  return { run, reviewRecord }
}
