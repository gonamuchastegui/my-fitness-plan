import './globals.css'
import Providers from '@/components/Providers'
import ClientLayout from '@/components/ClientLayout'

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
      <body>
        <Providers>
          <ClientLayout>
            {children}
          </ClientLayout>
        </Providers>
      </body>
    </html>
  )
}