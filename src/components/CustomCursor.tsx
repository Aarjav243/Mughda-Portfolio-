"use client";

import { useEffect, useRef } from "react";

export default function CustomCursor() {
    const dotRef = useRef<HTMLDivElement>(null);
    const ringRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Check if device supports hover (ignores mobile devices)
        if (window.matchMedia("(pointer: coarse)").matches) return;

        const dot = dotRef.current;
        const ring = ringRef.current;
        if (!dot || !ring) return;

        const gsap = (window as any).gsap;
        if (!gsap) {
            console.warn("GSAP not loaded yet for custom cursor.");
            return;
        }

        // Set initial opacity to 0
        gsap.set([dot, ring], { opacity: 0 });

        const xToDot = gsap.quickTo(dot, "x", { duration: 0.1, ease: "power3" });
        const yToDot = gsap.quickTo(dot, "y", { duration: 0.1, ease: "power3" });

        const xToRing = gsap.quickTo(ring, "x", { duration: 0.4, ease: "power3" });
        const yToRing = gsap.quickTo(ring, "y", { duration: 0.4, ease: "power3" });

        let isVisible = false;

        const onMouseMove = (e: MouseEvent) => {
            if (!isVisible) {
                gsap.to([dot, ring], { opacity: 1, duration: 0.3 });
                isVisible = true;
            }
            xToDot(e.clientX);
            yToDot(e.clientY);
            xToRing(e.clientX);
            yToRing(e.clientY);
        };

        const onMouseEnter = () => {
            gsap.to([dot, ring], { opacity: 1, duration: 0.3 });
            isVisible = true;
        };

        const onMouseLeave = () => {
            gsap.to([dot, ring], { opacity: 0, duration: 0.3 });
            isVisible = false;
        };

        window.addEventListener("mousemove", onMouseMove);
        document.body.addEventListener("mouseenter", onMouseEnter);
        document.body.addEventListener("mouseleave", onMouseLeave);

        // Magnetic & Snap Effect Selectors
        const interactiveElements = document.querySelectorAll(
            "a, button, .glass-card, .btn, .nav__hamburger, .section__title, .pub__title, .education__degree, .teaching__role, .research__name, .research__icon"
        );

        const onHoverEnter = (e: Event) => {
            const target = e.currentTarget as HTMLElement;
            gsap.to(dot, { scale: 0, opacity: 0, duration: 0.3 });

            const rect = target.getBoundingClientRect();
            const isSmall = rect.width < 120 && rect.height < 120;

            gsap.to(ring, {
                scale: isSmall ? 1.2 : 1.5,
                backgroundColor: "transparent",
                borderColor: "#ff8c00",
                duration: 0.3,
            });

            if (isSmall) {
                xToRing(rect.left + rect.width / 2);
                yToRing(rect.top + rect.height / 2);
            }
        };

        const onHoverLeave = (e: Event) => {
            gsap.to(dot, { scale: 1, opacity: 1, duration: 0.3 });
            gsap.to(ring, {
                scale: 1,
                backgroundColor: "transparent",
                borderColor: "rgba(255, 255, 255, 0.3)",
                duration: 0.3,
            });
        };

        interactiveElements.forEach((el) => {
            el.addEventListener("mouseenter", onHoverEnter);
            el.addEventListener("mouseleave", onHoverLeave);
        });

        return () => {
            window.removeEventListener("mousemove", onMouseMove);
            document.body.removeEventListener("mouseenter", onMouseEnter);
            document.body.removeEventListener("mouseleave", onMouseLeave);
            interactiveElements.forEach((el) => {
                el.removeEventListener("mouseenter", onHoverEnter);
                el.removeEventListener("mouseleave", onHoverLeave);
            });
        };
    }, []);

    return (
        <>
            <div ref={ringRef} className="cursor-ring" />
            <div ref={dotRef} className="cursor-dot" />
        </>
    );
}
