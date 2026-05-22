import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://archive-downloader--sohamroychoudhu.replit.app'

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/login', '/request-service', '/unauthorized'],
        disallow: ['/admin', '/dashboard', '/test-tools', '/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
