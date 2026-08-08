export function trackEvent(eventName: string, properties: Record<string, any> = {}) {
  if (typeof window === "undefined") return;

  // Track event in development console or forward to PostHog / Mixpanel
  if (process.env.NODE_ENV === "development") {
    console.log(`[ANALYTICS] Event: ${eventName}`, properties);
  }

  // Example PostHog / Mixpanel window object check
  if ((window as any).posthog) {
    (window as any).posthog.capture(eventName, properties);
  }
}

export function identifyUser(userId: string, traits: Record<string, any> = {}) {
  if (typeof window === "undefined") return;

  if ((window as any).posthog) {
    (window as any).posthog.identify(userId, traits);
  }
}
