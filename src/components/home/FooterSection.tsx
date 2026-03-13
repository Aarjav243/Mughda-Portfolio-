"use client";

import { useEffect, useRef, useMemo } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

export default function FooterSection() {
    const sectionRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            /* --- Footer --- */
            gsap.from(".footer > *", {
                scrollTrigger: {
                    trigger: ".footer",
                    start: "top 90%",
                },
                y: 60,
                opacity: 0,
                filter: "blur(6px)",
                stagger: 0.1,
                duration: 0.8,
                ease: "power3.out",
            });
        }, sectionRef);
        return () => ctx.revert();
    }, []);

    /* ============================================================
   FOOTER PARTICLES (generate positions)
   ============================================================ */
    // Use deterministic values to avoid SSR/client hydration mismatch
    // MEMOIZED to prevent recalculation
    const particles = useMemo(() => Array.from({ length: 30 }, (_, i) => {
        const hash1 = ((i * 2654435761) >>> 0) / 4294967296;
        const hash2 = ((i * 2246822519 + 1) >>> 0) / 4294967296;
        const hash3 = ((i * 3266489917 + 2) >>> 0) / 4294967296;
        const hash4 = ((i * 668265263 + 3) >>> 0) / 4294967296;
        return {
            id: i,
            left: `${(hash1 * 100).toFixed(4)}%`,
            top: `${(hash2 * 100).toFixed(4)}%`,
            animDelay: `${(hash3 * 4).toFixed(4)}s`,
            size: `${(1 + hash4 * 2).toFixed(4)}px`,
        };
    }), []);

    return (
        <footer className="footer" data-scroll-section ref={sectionRef}>
            <div className="footer__particles">
                {particles.map((p) => (
                    <div
                        key={p.id}
                        className="footer__particle"
                        style={{
                            left: p.left,
                            top: p.top,
                            width: p.size,
                            height: p.size,
                            animationDelay: p.animDelay,
                        }}
                    />
                ))}
            </div>
            <ul className="footer__links">
                <li><a href="#about">About</a></li>
                <li><a href="#research">Research</a></li>
                <li><a href="#publications">Publications</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
            <div className="footer__icons">
                <a
                    href="mailto:brijesh@example.com"
                    className="footer__icon"
                    aria-label="Email"
                >
                    {/* Email SVG icon */}
                    <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <rect x="2" y="4" width="20" height="16" rx="2" />
                        <path d="M22 7l-10 7L2 7" />
                    </svg>
                </a>
                <a
                    href="https://scholar.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer__icon"
                    aria-label="Google Scholar"
                >
                    {/* Scholar SVG icon */}
                    <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                    >
                        <path d="M12 24a7 7 0 1 1 0-14 7 7 0 0 1 0 14zm0-3a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM1 10L12 2l11 8H1z" />
                    </svg>
                </a>
            </div>
            <p className="footer__copy">
                &copy; {new Date().getFullYear()} Dr. Brijesh Kumar Jha. All rights
                reserved.
            </p>
        </footer>
    );
}
