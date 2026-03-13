"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

export default function ContactSection() {
    const sectionRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            /* --- Contact inputs --- */
            (gsap.utils.toArray(".contact__input, .contact__textarea") as HTMLElement[]).forEach((el: HTMLElement, i: number) => {
                gsap.from(el, {
                    scrollTrigger: {
                        trigger: el,
                        start: "top 90%",
                    },
                    x: -40,
                    opacity: 0,
                    duration: 0.6,
                    delay: i * 0.1,
                    ease: "power3.out",
                });
            });

            gsap.from(".contact__submit", {
                scrollTrigger: {
                    trigger: ".contact__submit",
                    start: "top 92%",
                },
                scale: 0.9,
                opacity: 0,
                duration: 0.6,
                ease: "power3.out",
            });
        }, sectionRef);
        return () => ctx.revert();
    }, []);

    /* ============================================================
   CONTACT FORM SUBMIT
   ============================================================ */
    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const btn = document.querySelector<HTMLElement>(".contact__submit");
        if (btn && window.gsap) {
            window.gsap.fromTo(
                btn,
                { scale: 0.95 },
                {
                    scale: 1,
                    duration: 0.4,
                    ease: "elastic.out(1, 0.5)",
                }
            );
        }
    }

    return (
        <section className="section contact" id="contact" data-scroll-section ref={sectionRef}>
            <div className="section__container">
                <div className="section__label">Get in Touch</div>
                <div className="section__title">Contact</div>
                <div className="section__desc">
                    Interested in collaboration, research discussion, or academic
                    inquiries? Feel free to reach out.
                </div>
                <form className="contact__form" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        className="contact__input"
                        placeholder="Your Name"
                        required
                    />
                    <input
                        type="email"
                        className="contact__input"
                        placeholder="Your Email"
                        required
                    />
                    <textarea
                        className="contact__textarea"
                        placeholder="Your Message"
                        required
                    />
                    <button type="submit" className="btn btn--primary contact__submit">
                        Send Message
                    </button>
                </form>
            </div>
        </section>
    );
}
