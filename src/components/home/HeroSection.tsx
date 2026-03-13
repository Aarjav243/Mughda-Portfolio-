"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { Linkedin } from "lucide-react";

// Only load Spline if not on mobile or if requested?
// For now, we'll just use a simple iframe, but we can delay it.

export default function HeroSection() {
  const [loadSpline, setLoadSpline] = useState(false);

  useEffect(() => {
    // Delay loading the heavy Spline iframe until after initial render
    const timer = setTimeout(() => {
      setLoadSpline(true);
    }, 2000); // 2 second delay to prioritize LCP

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // GSAP animations for Hero
    const ctx = gsap.context(() => {
      /* --- Floating orbs --- */
      (gsap.utils.toArray(".glow-orb") as HTMLElement[]).forEach((orb: HTMLElement, i: number) => {
        gsap.to(orb, {
          y: -20,
          duration: 3 + i * 0.5,
          repeat: -1,
          yoyo: true,
          ease: "power1.inOut",
        });
      });

      /* --- Hero text --- */
      gsap.from(".hero__title", {
        opacity: 0,
        y: 50,
        filter: "blur(10px)",
        duration: 1.2,
        delay: 0.2, // Reduced delay slightly
        ease: "power3.out",
      });

      gsap.from(".hero__subtitle", {
        opacity: 0,
        y: 30,
        filter: "blur(6px)",
        duration: 1,
        delay: 0.5,
        ease: "power3.out",
      });

      gsap.from(".hero__ctas .btn", {
        opacity: 0,
        y: 20,
        stagger: 0.15, // Reduced stagger
        duration: 0.8,
        delay: 0.8,
        ease: "power3.out",
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <section className="hero" id="hero" data-scroll-section>
      <div className="hero__spline-bg">
        {loadSpline && (
          <iframe
            src="https://my.spline.design/projectpromolookatmouse-CMgW7tIuRoFMZPcG7XkuA6ts/"
            width="100%"
            height="100%"
            style={{ border: "none" }}
            loading="lazy"
            title="Spline 3D Background"
          />
        )}
      </div>
      <div className="hero__overlay" />
      <div className="glow-orb glow-orb--1" />
      <div className="glow-orb glow-orb--2" />
      <div className="glow-orb glow-orb--3" />
      <div className="hero__content">
        <h1 className="hero__title">Dr. Brijesh Kumar Jha</h1>
        <p className="hero__subtitle">
          PhD in Statistics &nbsp;|&nbsp; Statistical Inference &nbsp;|&nbsp;
          Bayesian Estimation &nbsp;|&nbsp; Decision Theory
        </p>
        <div className="hero__ctas">
          <a href="#publications" className="btn btn--primary">
            View Research
          </a>
          <a href="#contact" className="btn btn--outline">
            Contact
          </a>
          <a
            href="https://www.linkedin.com/in/brijesh-kumar-jha-38a132131/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--icon btn--outline magnetic"
            title="LinkedIn Profile"
          >
            <Linkedin size={20} />
          </a>
        </div>
      </div>
    </section>
  );
}
