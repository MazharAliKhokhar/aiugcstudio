import { ImageResponse } from 'next/og'
 
export const runtime = 'edge'
 
export const size = {
  width: 256,
  height: 256,
}
export const contentType = 'image/png'
 
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1e293b 0%, #020617 100%)', // Premium dark slate to black
          borderRadius: '50%', // Perfectly Round
          boxShadow: 'inset 0 0 0 8px #f97316', // Premium vibrant orange ring
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: 120,
            fontWeight: 900,
            fontFamily: 'sans-serif',
            textShadow: '0 10px 30px rgba(249, 115, 22, 0.6)', // Glowing text
          }}
        >
          V
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
