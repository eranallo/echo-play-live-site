export const WORK_LANES = {
  advance: { label: 'Show Advance', review: false },
  promo: { label: 'Promo Plan', review: true },
  design: { label: 'Design Brief', review: true },
}

export function workLaneOptions() {
  return Object.entries(WORK_LANES).map(([kind, lane]) => ({ kind, ...lane }))
}
