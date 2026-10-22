export interface SeoConfig {
  title: string;
  description: string;
  canonicalUrl: string;
  lang: 'ar' | 'en';
  dir: 'rtl' | 'ltr';
  imageUrl?: string;
  alternateArUrl?: string;
  alternateEnUrl?: string;
  alternateDefaultUrl?: string;
}

export function updateDocumentSeo(config: SeoConfig) {
  if (typeof document === 'undefined') return;

  // 1. Update HTML lang and dir attributes
  document.documentElement.lang = config.lang;
  document.documentElement.dir = config.dir;

  // 2. Update Document Title
  document.title = config.title;

  // 3. Helper to update or create meta tags
  const setMeta = (attribute: 'name' | 'property', key: string, value: string) => {
    let el = document.querySelector(`meta[${attribute}="${key}"]`) as HTMLMetaElement | null;
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attribute, key);
      document.head.appendChild(el);
    }
    el.setAttribute('content', value);
  };

  // 4. Helper to update or create link tags
  const setLink = (rel: string, href: string, extraAttrs?: Record<string, string>) => {
    let selector = `link[rel="${rel}"]`;
    if (extraAttrs?.hreflang) {
      selector += `[hreflang="${extraAttrs.hreflang}"]`;
    }
    let el = document.querySelector(selector) as HTMLLinkElement | null;
    if (!el) {
      el = document.createElement('link');
      el.setAttribute('rel', rel);
      if (extraAttrs) {
        Object.entries(extraAttrs).forEach(([k, v]) => el!.setAttribute(k, v));
      }
      document.head.appendChild(el);
    }
    el.setAttribute('href', href);
  };

  // 5. Update primary meta description
  setMeta('name', 'description', config.description);

  // 6. Update Canonical URL
  setLink('canonical', config.canonicalUrl);

  // 7. Update Hreflang alternates
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://kareem-ashmawy.netlify.app';
  const arUrl = config.alternateArUrl || `${origin}/ar`;
  const enUrl = config.alternateEnUrl || `${origin}/en`;
  const defaultUrl = config.alternateDefaultUrl || `${origin}/`;

  setLink('alternate', arUrl, { hreflang: 'ar' });
  setLink('alternate', enUrl, { hreflang: 'en' });
  setLink('alternate', defaultUrl, { hreflang: 'x-default' });

  // 8. Update OpenGraph tags
  setMeta('property', 'og:title', config.title);
  setMeta('property', 'og:description', config.description);
  setMeta('property', 'og:url', config.canonicalUrl);
  setMeta('property', 'og:locale', config.lang === 'en' ? 'en_US' : 'ar_EG');
  if (config.imageUrl) {
    setMeta('property', 'og:image', config.imageUrl);
    setMeta('property', 'og:image:secure_url', config.imageUrl);
  }

  // 9. Update Twitter tags
  setMeta('name', 'twitter:title', config.title);
  setMeta('name', 'twitter:description', config.description);
  if (config.imageUrl) {
    setMeta('name', 'twitter:image', config.imageUrl);
  }
}
