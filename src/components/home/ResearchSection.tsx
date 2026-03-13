"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

export default function ResearchSection() {
    const sectionRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            /* --- Research grid items --- */
            (gsap.utils.toArray(".research__item") as HTMLElement[]).forEach((item: HTMLElement, i: number) => {
                gsap.from(item, {
                    scrollTrigger: {
                        trigger: item,
                        start: "top 88%",
                    },
                    scale: 0.8,
                    opacity: 0,
                    duration: 0.6,
                    delay: i * 0.08,
                    ease: "back.out(1.4)",
                });
            });
        }, sectionRef);
        return () => ctx.revert();
    }, []);

    return (
        <section className="section" id="research" data-scroll-section ref={sectionRef}>
            <div className="section__container">
                <div className="section__label">Focus Areas</div>
                <div className="section__title">Research Interests</div>
                <div className="research__grid">
                    {[
                        { icon: "📐", name: "Point Estimation" },
                        { icon: "📊", name: "Bayesian Estimation" },
                        { icon: "⚖️", name: "Decision Theory" },
                        { icon: "💻", name: "Data Science" },
                        { icon: "🔄", name: "Queuing Theory" },
                        { icon: "📈", name: "Econometrics" },
                    ].map((item) => (
                        <div className="research__item glass-card" key={item.name}>
                            <span className="research__icon">{item.icon}</span>
                            <div className="research__name">{item.name}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
