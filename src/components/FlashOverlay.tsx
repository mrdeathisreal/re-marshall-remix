import { forwardRef, useImperativeHandle, useRef } from 'react'

export interface FlashHandle {
  pulse: () => void
}

export const FlashOverlay = forwardRef<FlashHandle>((_, ref) => {
  const elRef = useRef<HTMLDivElement>(null)

  useImperativeHandle(ref, () => ({
    pulse() {
      const el = elRef.current
      if (!el) return
      el.classList.remove('on')
      // force reflow so the animation restarts
      void el.offsetWidth
      el.classList.add('on')
    },
  }))

  return <div ref={elRef} className="flash" aria-hidden />
})

FlashOverlay.displayName = 'FlashOverlay'
