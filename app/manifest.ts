import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Flash Ecommerce',
    short_name: 'Flash',
    description: 'Bold, affirming fashion for everyone.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '/flash-logo.jpg',
        sizes: 'any',
        type: 'image/jpeg',
      },
    ],
  }
}
