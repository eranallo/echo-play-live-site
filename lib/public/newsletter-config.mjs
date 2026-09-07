// Populate only from the existing audience's verified public Mailchimp form.
// No API key belongs here. null keeps email collection off until configured.
export const newsletterForm = null

export function validNewsletterForm(form) {
  if (!form || typeof form.action !== 'string') return false
  try {
    const url = new URL(form.action)
    return (
      url.protocol === 'https:' &&
      /^[a-z0-9-]+\.[a-z0-9-]+\.list-manage\.com$/.test(url.hostname) &&
      url.pathname === '/subscribe/post' &&
      !url.username &&
      !url.password &&
      /^[a-f0-9]+$/.test(url.searchParams.get('u') || '') &&
      /^[a-f0-9]+$/.test(url.searchParams.get('id') || '') &&
      typeof form.honeypot === 'string' &&
      /^b_[a-f0-9]+_[a-f0-9]+$/.test(form.honeypot)
    )
  } catch {
    return false
  }
}
