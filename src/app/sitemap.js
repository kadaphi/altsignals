export default function sitemap() {
  return [
    { url: 'https://altsignals.finance', lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: 'https://altsignals.finance/about', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://altsignals.finance/contact', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://altsignals.finance/performance', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: 'https://altsignals.finance/auth/register', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: 'https://altsignals.finance/auth/login', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: 'https://altsignals.finance/legal/privacy-policy', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: 'https://altsignals.finance/legal/terms-of-service', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: 'https://altsignals.finance/legal/risk-disclosure', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: 'https://altsignals.finance/legal/aml-policy', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ]
}