import './globals.css'

export const metadata = {
  title: {
    default: 'Echo Play Live',
    template: '%s | Echo Play Live',
  },
  description: "DFW's premier band management company. Home of So Long Goodnight, The Dick Beldings, Jambi, and Elite. Quality, hustle, and love for the show.",
  keywords: ['Echo Play Live', 'DFW bands', 'tribute bands', 'Fort Worth music', 'So Long Goodnight', 'The Dick Beldings', 'Jambi TOOL tribute', 'Elite Deftones tribute'],
  openGraph: {
    title: 'Echo Play Live',
    description: "DFW's premier band management company.",
    siteName: 'Echo Play Live',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&family=Barlow+Condensed:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
