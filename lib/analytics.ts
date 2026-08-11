export function trackEvent(eventName: string, properties: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;

  // Track event in development console or forward to PostHog / Mixpanel
  if (process.env.NODE_ENV === "development") {
    console.log(`[ANALYTICS] Event: ${eventName}`, properties);
  }

  // Example PostHog / Mixpanel window object check
  const win = window as unknown as { posthog?: { capture: (event: string, props: Record<string, unknown>) => void; identify: (id: string, traits: Record<string, unknown>) => void } };
  if (win.posthog) {
    win.posthog.capture(eventName, properties);
  }
}

export function identifyUser(userId: string, traits: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;

  const win = window as unknown as { posthog?: { capture: (event: string, props: Record<string, unknown>) => void; identify: (id: string, traits: Record<string, unknown>) => void } };
  if (win.posthog) {
    win.posthog.identify(userId, traits);
  }
}
