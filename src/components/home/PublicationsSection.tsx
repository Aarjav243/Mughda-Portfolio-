"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { SiGooglescholar } from "react-icons/si";

export default function PublicationsSection() {
    const sectionRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            /* --- Publication items --- */
            (gsap.utils.toArray(".pub__item") as HTMLElement[]).forEach((item: HTMLElement, i: number) => {
                gsap.from(item, {
                    scrollTrigger: {
                        trigger: item,
                        start: "top 88%",
                    },
                    y: 25,
                    opacity: 0,
                    duration: 0.6,
                    delay: i * 0.06,
                    ease: "power3.out",
                });
            });
        }, sectionRef);
        return () => ctx.revert();
    }, []);

    return (
        <section className="section" id="publications" data-scroll-section ref={sectionRef}>
            <div className="section__container">
                <div className="section__label">Scholarly Work</div>
                <div className="flex items-center gap-4 mb-4">
                    <div className="section__title mb-0">Publications</div>
                    <a
                        href="https://scholar.google.com/citations?user=a7xV5KAAAAAJ&hl=en"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="pub__scholar-link btn--outline btn--icon magnetic"
                        title="Google Scholar Profile"
                    >
                        <SiGooglescholar size={20} />
                    </a>
                </div>

                <div className="publications__list">
                    <div className="pub__category">Published</div>

                    {[
                        {
                            title:
                                "Improved estimators of hazard rate from a selected exponential population",
                            year: "2023",
                        },
                        {
                            title:
                                "Inadmissibility results for selected hazard rates",
                            year: "2021",
                        },
                        {
                            title:
                                "Estimation of Reliability Following Selection from Pareto Populations",
                            year: "2021",
                        },
                        {
                            title:
                                "Estimation of Hazard Rate of a Selected Exponential Population",
                            year: "2020",
                        },
                        {
                            title:
                                "Reliability Estimation after Selection from One Parameter Exponential Population",
                            year: "2020",
                        },
                        {
                            title:
                                "Estimation of Hazard in Human Brain Signal Using Exponential Distribution",
                            year: "2019",
                        },
                    ].map((pub) => (
                        <div className="pub__item glass-card" key={pub.title}>
                            <div className="pub__title">{pub.title}</div>
                            <div className="pub__year">{pub.year}</div>
                        </div>
                    ))}

                    <div className="pub__category">Submitted</div>
                    <div className="pub__item glass-card">
                        <div className="pub__title">
                            Improving on admissible estimators under entropy loss function
                        </div>
                        <div className="pub__year">2024</div>
                    </div>

                    <div className="pub__category">Preprint</div>
                    <div className="pub__item glass-card">
                        <div className="pub__title">
                            Non-parametric Estimation for Stochastic Differential Equation
                            perturbed by L&eacute;vy Noise
                        </div>
                        <div className="pub__year">2024</div>
                    </div>
                </div>
            </div>
        </section>
    );
}
