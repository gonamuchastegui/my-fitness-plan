import './globals.css'

export const metadata = {
  title: 'My Fitness Plan',
  description: 'Track your fitness journey with personalized workout plans',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
