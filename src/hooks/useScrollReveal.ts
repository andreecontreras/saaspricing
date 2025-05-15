import { useEffect, useRef } from 'react';

export const useScrollReveal = () => {
    const observerRef = useRef<IntersectionObserver | null>(null);

    useEffect(() => {
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        observerRef.current = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                }
            });
        }, options);

        const elements = document.querySelectorAll('.reveal-on-scroll');
        elements.forEach(element => {
            observerRef.current?.observe(element);
        });

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, []);

    return null;
}; 