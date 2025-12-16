import { ImageResponse } from 'next/og'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

// Route segment config
export const runtime = 'nodejs'

// Image metadata
export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'

// Image generation
export default function Icon() {
  try {
      const filePath = join(process.cwd(), 'public/flash-logo.jpg')
      const file = readFileSync(filePath)
      const base64 = file.toString('base64')
      const src = `data:image/jpeg;base64,${base64}`

      return new ImageResponse(
        (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              overflow: 'hidden',
              backgroundColor: 'black', // Fallback
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
                src={src} 
                alt="Favicon"
                width="100%"
                height="100%"
                style={{
                    objectFit: 'cover'
                }}
            />
          </div>
        ),
        {
          ...size,
        }
      )
  } catch (e) {
      // Fallback if file not found
      return new ImageResponse(
          (
            <div
                style={{
                fontSize: 20,
                background: 'black',
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                borderRadius: '50%',
                fontWeight: 800,
                }}
            >
                F
            </div>
          ),
          { ...size }
      )
  }
}
