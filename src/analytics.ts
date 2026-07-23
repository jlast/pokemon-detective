const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID ?? ''

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

let initialized = false

const initializeGoogleAnalytics = () => {
  if (!GA_MEASUREMENT_ID || initialized || typeof window === 'undefined') return

  window.dataLayer = window.dataLayer ?? []
  window.gtag = window.gtag ?? function gtag() {
    window.dataLayer?.push(arguments)
  }

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_MEASUREMENT_ID)}`
  document.head.append(script)

  window.gtag('js', new Date())
  window.gtag('config', GA_MEASUREMENT_ID, { send_page_view: false })
  initialized = true
}

export const trackPageView = (path: string) => {
  if (!GA_MEASUREMENT_ID || typeof window === 'undefined') return

  initializeGoogleAnalytics()
  window.gtag?.('event', 'page_view', {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
  })
}
