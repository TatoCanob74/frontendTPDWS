import { useEffect } from 'react'

// Port de initReveal(): agrega .is-visible a [data-reveal] cuando entra al viewport.
// El hero se anima al montar, no al scrollear.
export function useScrollReveal(scope) {
  useEffect(() => {
    const root = scope?.current ?? document
    const els = Array.from(root.querySelectorAll('[data-reveal]'))
    if (!els.length) return

    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('is-visible'))
      return
    }

    const heroEls = els.filter((el) => el.closest('.hero'))
    const scrollEls = els.filter((el) => !el.closest('.hero'))

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (!entry.isIntersecting) return
          const el = entry.target
          setTimeout(() => el.classList.add('is-visible'), i * 90)
          io.unobserve(el)
        })
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    )
    scrollEls.forEach((el) => io.observe(el))

    heroEls.forEach((el) => {
      requestAnimationFrame(() => el.classList.add('is-visible'))
    })

    return () => io.disconnect()
  }, [scope])
}
