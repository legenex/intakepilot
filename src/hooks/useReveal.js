import { useEffect } from 'react';

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function useReveal() {
  useEffect(() => {
    if (prefersReducedMotion) {
      // Skip animation — make everything visible immediately
      document.querySelectorAll('.reveal').forEach(el => {
        el.classList.add('is-visible');
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const delay = parseFloat(el.dataset.delay || 0) * 80;
            setTimeout(() => {
              el.classList.add('is-visible');
            }, delay);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    const els = document.querySelectorAll('.reveal');
    els.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);
}