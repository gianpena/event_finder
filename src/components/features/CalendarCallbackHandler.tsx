"use client";

import { Suspense } from "react";
import { useCalendarCallback } from "@/hooks/useCalendarCallback";

/**
 * Inner component that calls useCalendarCallback (which uses useSearchParams).
 * Must be a separate component so the Suspense boundary wraps it correctly.
 */
function CalendarCallbackInner() {
    useCalendarCallback();
    return null;
}

/**
 * Renders nothing visible — purely handles the OAuth callback side-effect.
 * Wrapped in Suspense because useSearchParams() requires it in Next.js 16.
 */
export function CalendarCallbackHandler() {
    return (
        <Suspense fallback={null}>
            <CalendarCallbackInner />
        </Suspense>
    );
}
