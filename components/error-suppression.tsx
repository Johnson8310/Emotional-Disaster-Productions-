"use client"

import { useEffect } from "react"

export function ErrorSuppression() {
  useEffect(() => {
    const resizeObserverErr = window.console.error
    window.console.error = (...args: unknown[]) => {
      if (typeof args[0] === "string" && args[0].includes("ResizeObserver loop")) {
        return
      }
      resizeObserverErr(...args)
    }

    return () => {
      window.console.error = resizeObserverErr
    }
  }, [])

  return null
}
