import './globals.css'
 
export const metadata = {
  title: 'Video Clipper',
  description: 'Clip and download video segments',
}
 
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
