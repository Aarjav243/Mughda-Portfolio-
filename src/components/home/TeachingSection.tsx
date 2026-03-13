"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function TeachingSection() {
    const sectionRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            /* --- Teaching cards --- */
            (gsap.utils.toArray(".teaching__card") as HTMLElement[]).forEach((card: HTMLElement, i: number) => {
                gsap.from(card, {
                    scrollTrigger: {
                        trigger: card,
                        start: "top 85%",
                    },
                    y: 40,
                    opacity: 0,
                    duration: 0.7,
                    delay: i * 0.1,
                    ease: "power3.out",
                });
            });
        }, sectionRef);
        return () => ctx.revert();
    }, []);

    return (
        <section className="section" id="teaching" data-scroll-section ref={sectionRef}>
            <div className="section__container">
                <div className="section__label">Experience</div>
                <div className="section__title">Teaching Experience</div>
                <div className="teaching__grid">
                    <div className="teaching__card glass-card">
                        <div className="teaching__role">INSPIRE Fellow (DST)</div>
                        <div className="teaching__institution">
                            IIT Bhubaneswar
                        </div>
                        <div className="teaching__duration">
                            Postdoctoral Research
                        </div>
                    </div>

                    <div className="teaching__card glass-card">
                        <div className="teaching__role">Assistant Professor</div>
                        <div className="teaching__institution">
                            Siksha &apos;O&apos; Anusandhan (Deemed to be University)
                        </div>
                        <div className="teaching__duration">
                            Department of Mathematics
                        </div>
                    </div>

                    <div className="teaching__card glass-card">
                        <div className="teaching__role">Guest Lecturer</div>
                        <div className="teaching__institution">
                            Various Academic Institutions
                        </div>
                        <div className="teaching__duration">
                            Statistics &amp; Mathematics
                        </div>
                    </div>

                    <div className="teaching__card glass-card">
                        <div className="teaching__role">Research Scholar</div>
                        <div className="teaching__institution">
                            Siksha &apos;O&apos; Anusandhan (Deemed to be University)
                        </div>
                        <div className="teaching__duration">
                            PhD Research &amp; Teaching Assistance
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
