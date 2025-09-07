import { useEffect, useState } from 'react'

/**
 * Hook to detect when the component has been hydrated on the client
 * This helps prevent hydration mismatches and handles browser extension interference
 */
export function useHydration() {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    // Mark as hydrated immediately
    setIsHydrated(true)

    // Clean up any browser extension attributes that might cause issues
    const cleanupExtensions = () => {
      if (typeof document === 'undefined') return

      const extensionAttributes = [
        'data-new-gr-c-s-check-loaded',
        'data-gr-ext-installed',
        'data-grammarly-shadow-root',
        'data-lastpass',
        'data-dashlane',
        'data-roam-highlighter',
        'data-ub-block',
        'data-ub-css',
        'data-ub-link',
        'data-ub-id',
        'data-vivaldi-spatnav-clickable',
        'data-vivaldi-spatnav-focusable'
      ]

      // Remove from body and html
      const body = document.body
      const html = document.documentElement

      extensionAttributes.forEach(attr => {
        if (body.hasAttribute(attr)) {
          body.removeAttribute(attr)
        }
        if (html.hasAttribute(attr)) {
          html.removeAttribute(attr)
        }
      })

      // Also clean up any child elements
      const elements = document.querySelectorAll(
        extensionAttributes.map(attr => `[${attr}]`).join(', ')
      )

      elements.forEach(element => {
        extensionAttributes.forEach(attr => {
          if (element.hasAttribute(attr)) {
            element.removeAttribute(attr)
          }
        })
      })
    }

    // Clean up immediately
    cleanupExtensions()

    // Also clean up after a delay to catch extensions that load later
    const timeoutId = setTimeout(cleanupExtensions, 1000)

    return () => clearTimeout(timeoutId)
  }, [])

  return isHydrated
}
