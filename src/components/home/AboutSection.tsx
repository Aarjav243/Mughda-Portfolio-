"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

export default function AboutSection() {
    const sectionRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            /* --- About section --- */
            gsap.from(".about__photo-wrap", {
                scrollTrigger: {
                    trigger: ".about",
                    start: "top 80%",
                },
                x: -60,
                opacity: 0,
                filter: "blur(10px)",
                duration: 1,
                ease: "power3.out",
            });

            gsap.from(".about__bio > *", {
                scrollTrigger: {
                    trigger: ".about__bio",
                    start: "top 80%",
                },
                y: 30,
                opacity: 0,
                filter: "blur(6px)",
                stagger: 0.12,
                duration: 0.8,
                ease: "power3.out",
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section className="section about" id="about" data-scroll-section ref={sectionRef}>
            <div className="section__container">
                <div className="section__label">Profile</div>
                <div className="section__title">About Me</div>
                <div className="about__grid">
                    <div className="about__photo-wrap">
                        <div className="about__photo-glow" />
                        {/* Placeholder profile – uses a gradient circle until a real photo is provided */}
                        <div
                            className="about__photo"
                            style={{
                                background:
                                    "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "3.5rem",
                                fontFamily: "var(--font-heading)",
                                color: "var(--accent-cyan)",
                                fontWeight: 600,
                            }}
                        >
                            BKJ
                        </div>
                    </div>
                    <div className="about__bio">
                        <h3>Academic &amp; Research Profile</h3>
                        <p>
                            Dr. Brijesh Kumar Jha holds a <strong>PhD in Statistics</strong> from
                            Siksha &apos;O&apos; Anusandhan (Deemed to be University), Bhubaneswar,
                            with a research focus on Statistical Inference, Point Estimation,
                            Bayesian Estimation, and Decision Theory.
                        </p>
                        <p>
                            He completed his <strong>MSc in Statistics</strong> from Utkal
                            University, Bhubaneswar, and his <strong>BSc in Mathematics &amp;
                                Computing</strong> from the Institute of Mathematics and Applications,
                            Bhubaneswar.
                        </p>
                        <p>
                            He has pursued postdoctoral research at <strong>IIT Bhubaneswar</strong>{" "}
                            under an INSPIRE-funded project and is currently expanding his
                            research into <strong>Queuing Theory</strong> and{" "}
                            <strong>Econometrics</strong>.
                        </p>
                        <ul className="about__list">
                            <li>Statistical Inference &amp; Point Estimation</li>
                            <li>Bayesian Estimation &amp; Decision Theory</li>
                            <li>Postdoctoral Research — IIT Bhubaneswar (INSPIRE)</li>
                            <li>Current: Queuing Theory &amp; Econometrics</li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
}
