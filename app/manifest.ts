import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'FLASH | Premium Anime Streetwear',
    short_name: 'FLASH',
    description: 'Cyberpunk aesthetics meets nano-fabric engineering. Premium anime streetwear and intelligent clothing.',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#000000',
    icons: [
      {
        src: '/flash-logo.jpg',
        sizes: '192x192',
        type: 'image/jpeg',
      },
      {
        src: '/flash-logo.jpg',
        sizes: '512x512',
        type: 'image/jpeg',
      },
    ],
  }
}
