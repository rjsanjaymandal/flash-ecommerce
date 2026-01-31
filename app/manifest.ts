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
    orientation: 'portrait',
    categories: ['shopping', 'lifestyle', 'fashion'],
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
    screenshots: [
      {
        src: '/hero-banner.png',
        sizes: '1920x1080',
        type: 'image/png',
        label: 'Home Screen'
      },
      {
         src: '/flash-logo.jpg',
         sizes: '512x512',
         type: 'image/jpeg',
         label: 'App Icon'
      }
    ],
    shortcuts: [
      {
        name: 'New Drops',
        short_name: 'Drops',
        description: 'Check out the latest arrivals',
        url: '/store?sort=newest',
        icons: [{ src: '/flash-logo.jpg', sizes: '192x192' }]
      },
      {
        name: 'My Account',
        short_name: 'Account',
        description: 'View orders and profile',
        url: '/account',
        icons: [{ src: '/flash-logo.jpg', sizes: '192x192' }]
      }
    ]
  }
}
