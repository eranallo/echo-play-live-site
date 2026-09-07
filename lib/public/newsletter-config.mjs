// Public integration fields verified in the existing Echo Play Live audience
// and its generated website embed on 2026-09-07. These are not API credentials.
export const newsletterForm = {
  action:
    'https://live.us2.list-manage.com/subscribe/post?u=32f0ae5f59cb3cdf2dcc21f38&id=133abd4974&f_id=0063c2e1f0',
  honeypot: 'b_32f0ae5f59cb3cdf2dcc21f38_133abd4974',
  cityField: 'CITY',
  bands: {
    jambi: { name: 'group[22799][1]', value: '1' },
    'so-long-goodnight': { name: 'group[22799][2]', value: '1' },
    elite: { name: 'group[22799][4]', value: '1' },
    'the-dick-beldings': { name: 'group[22799][8]', value: '1' },
  },
}

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
