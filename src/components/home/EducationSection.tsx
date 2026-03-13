"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

export default function EducationSection() {
    const sectionRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            /* --- Education timeline --- */
            gsap.to(".timeline-line-fill", {
                scrollTrigger: {
                    trigger: ".education__timeline",
                    start: "top 80%",
                    end: "bottom 60%",
                    scrub: 1,
                },
                height: "100%",
                ease: "none",
            });

            (gsap.utils.toArray(".education__item") as HTMLElement[]).forEach((item: HTMLElement, i: number) => {
                gsap.from(item, {
                    scrollTrigger: {
                        trigger: item,
                        start: "top 85%",
                    },
                    y: 50,
                    opacity: 0,
                    duration: 0.8,
                    delay: i * 0.15,
                    ease: "power3.out",
                });
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section className="section" id="education" data-scroll-section ref={sectionRef}>
            <div className="section__container">
                <div className="section__label">Education</div>
                <div className="section__title">Academic Qualifications</div>
                <div className="education__timeline">
                    <div className="timeline-line-fill" />

                    <div className="education__item">
                        <div className="education__card glass-card">
                            <div className="education__degree">
                                PhD in Statistics
                            </div>
                            <div className="education__institution">
                                Siksha &apos;O&apos; Anusandhan (Deemed to be University)
                            </div>
                            <div className="education__location">Bhubaneswar, Odisha</div>
                        </div>
                    </div>

                    <div className="education__item">
                        <div className="education__card glass-card">
                            <div className="education__degree">
                                MSc in Statistics
                            </div>
                            <div className="education__institution">
                                Utkal University
                            </div>
                            <div className="education__location">Bhubaneswar, Odisha</div>
                        </div>
                    </div>

                    <div className="education__item">
                        <div className="education__card glass-card">
                            <div className="education__degree">
                                BSc in Mathematics &amp; Computing
                            </div>
                            <div className="education__institution">
                                Institute of Mathematics and Applications
                            </div>
                            <div className="education__location">Bhubaneswar, Odisha</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
