"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { Gavel, Droplets, Shield, Stethoscope, LineChart } from "lucide-react";

/* ── FRAME ANIMATION INTRO ── */
function FrameAnimationIntro({ onComplete }: { onComplete: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const totalFrames = 84;
    const frameRate = 18;
    const images: HTMLImageElement[] = [];
    let loadedCount = 0;
    let frameIndex = 1;
    let animationRef: number;
    let lastTime = 0;
    let hasStarted = false;

    // Drawing logic
    const drawFrame = (index: number) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      // Arrays are 0-indexed, frameIndex is 1-indexed
      const img = images[index - 1]; 
      if (!canvas || !ctx || !img) return;

      // Sync canvas internal resolution with CSS display size
      const { width, height } = canvas.parentElement!.getBoundingClientRect();
      if (canvas.width !== width || canvas.height !== height) {
        // Boost resolution slightly for retina displays
        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);
      }

      const hRatio = width / img.width;
      const vRatio = height / img.height;
      
      // Use 'contain' on mobile to show full laptop, 'cover' on desktop
      const isMobile = width <= 768;
      const ratio = isMobile ? Math.min(hRatio, vRatio) : Math.max(hRatio, vRatio);
      
      const centerShift_x = (width - img.width * ratio) / 2;
      const centerShift_y = (height - img.height * ratio) / 2;  

      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, img.width, img.height,
                    centerShift_x, centerShift_y, img.width * ratio, img.height * ratio);
    };

    // Preload all frames into memory
    for (let i = 1; i <= totalFrames; i++) {
        const img = new (window as any).Image();
        img.src = `/mughda_animation/ezgif-frame-${String(i).padStart(3, '0')}.png`;
        img.onload = () => {
            loadedCount++;
            if (loadedCount === 1) {
                // Ensure first frame is drawn immediately while others load
                drawFrame(1);
            }
            // Buffer ~15 frames before starting the animation loop to ensure smooth playback
            if (loadedCount > 15 && !hasStarted) {
                hasStarted = true;
                animationRef = requestAnimationFrame(play);
            }
        };
        images.push(img);
    }

    const play = (time: number) => {
      if (!lastTime) lastTime = time;
      const elapsed = time - lastTime;
      const fpsInterval = 1000 / frameRate;

      if (elapsed > fpsInterval) {
        lastTime = time - (elapsed % fpsInterval);
        drawFrame(frameIndex);
        
        if (frameIndex >= totalFrames) {
            setFading(true);
            setTimeout(onComplete, 900);
            return; // Stop animation loop
        }
        
        // Only advance frame index if the next frame has finished downloading
        if (images[frameIndex]?.complete) {
            frameIndex++;
        }
      }
      animationRef = requestAnimationFrame(play);
    };

    // Cleanup
    const handleResize = () => drawFrame(frameIndex);
    window.addEventListener('resize', handleResize);
    
    return () => {
        if (animationRef) cancelAnimationFrame(animationRef);
        window.removeEventListener('resize', handleResize);
    }
  }, [onComplete]);

  return (
    <div
      className="intro-overlay"
      style={{
        opacity: fading ? 0 : 1,
        transition: fading ? 'opacity 0.8s ease-out' : 'none',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fdfaf5' /* Matches site background so borders blend on mobile */
      }}
    >
      <div className="intro-frame-container" style={{ width: '100%', height: '100%', position: 'relative' }}>
        <canvas 
          ref={canvasRef} 
          style={{ width: '100%', height: '100%', display: 'block' }} 
        />
      </div>
    </div>
  );
}


/* ------------------------------------------------------------------ */
/* Declare globals loaded via CDN <script> tags                       */
/* ------------------------------------------------------------------ */
declare global {
  interface Window {
    gsap: any;
    ScrollTrigger: any;
    LocomotiveScroll: any;
  }
}

export default function Home() {
  const [activeNodes, setActiveNodes] = useState<string[]>([]);
  const [activeResearchId, setActiveResearchId] = useState<string | null>(null);
  const [showIntro, setShowIntro] = useState(true);
  
  // Refs for different causal pathway sections
  const causalLayerRef = useRef<SVGSVGElement>(null);
  const acceptedLayerRef = useRef<SVGSVGElement>(null);
  const presentedLayerRef = useRef<SVGSVGElement>(null);
  
  // Ref for the workshops timeline
  const workshopTimelineRef = useRef<HTMLDivElement>(null);

  const getPath = (paperId: string, nodeId: string, svgRef: React.RefObject<SVGSVGElement | null>, sectionPrefix: string) => {
    if (typeof document === 'undefined') return "";
    const paper = document.getElementById(paperId);
    const node = document.getElementById(`${sectionPrefix}-node-${nodeId}`);
    const svg = svgRef.current;
    if (!paper || !node || !svg) return "";

    const svgRect = svg.getBoundingClientRect();
    const pRect = paper.getBoundingClientRect();
    const nRect = node.getBoundingClientRect();

    const startX = pRect.right - svgRect.left;
    const startY = pRect.top + pRect.height / 2 - svgRect.top;
    const endX = nRect.left - svgRect.left;
    const endY = nRect.top + nRect.height / 2 - svgRect.top;

    const cp1x = startX + (endX - startX) * 0.5;
    const cp2x = startX + (endX - startX) * 0.5;

    return `M ${startX} ${startY} C ${cp1x} ${startY}, ${cp2x} ${endY}, ${endX} ${endY}`;
  };

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const locoScrollRef = useRef<any>(null);

  useEffect(() => {
    if (showIntro) return; // Wait until intro is done and main content is mounted

    /* Wait for GSAP + Locomotive CDN scripts to load */
    const waitForLibs = setInterval(() => {
      if (window.gsap && window.ScrollTrigger && window.LocomotiveScroll) {
        clearInterval(waitForLibs);
        // Small timeout to ensure DOM is painted
        setTimeout(() => {
          initSite();
          // Force a ScrollTrigger refresh after elements are initialized
          window.ScrollTrigger.refresh();
        }, 50);
      }
    }, 100);

    return () => clearInterval(waitForLibs);
  }, [showIntro]);

  function initSite() {
    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;

    gsap.registerPlugin(ScrollTrigger);

    /* Immediately trigger layout and animations */
    initLocomotive();
    initAnimations();
    gsap.to(".main-content", {
      opacity: 1,
      duration: 0.5,
      ease: "power2.out",
    });


    /* ============================================================
       CANVAS PRELOADER ANIMATION REMOVED
       ============================================================ */


    /* ============================================================
       LOCOMOTIVE SCROLL
       ============================================================ */
    function initLocomotive() {
      const container = scrollContainerRef.current;
      if (!container) return;

      const locoScroll = new window.LocomotiveScroll({
        el: container,
        smooth: true,
        multiplier: 1.0,
        lerp: 0.1,
        touchMultiplier: 3.5,
        tablet: {
          smooth: true,
          breakpoint: 0,
          lerp: 0.15
        },
        smartphone: {
          smooth: true,
          breakpoint: 0,
          lerp: 0.18
        }
      });

      locoScrollRef.current = locoScroll;

      locoScroll.on("scroll", ScrollTrigger.update);

      ScrollTrigger.scrollerProxy(container, {
        scrollTop(value?: number) {
          if (arguments.length && value !== undefined) {
            locoScroll.scrollTo(value, { duration: 0, disableLerp: true });
          }
          return locoScroll.scroll?.instance?.scroll?.y ?? 0;
        },
        getBoundingClientRect() {
          return {
            top: 0,
            left: 0,
            width: window.innerWidth,
            height: window.innerHeight,
          };
        },
        pinType: container.style.transform ? "transform" : "fixed",
      });

      ScrollTrigger.addEventListener("refresh", () => locoScroll.update());
      ScrollTrigger.defaults({ scroller: container });
      ScrollTrigger.refresh();
    }

    /* ============================================================
       GSAP ANIMATIONS
       ============================================================ */
    function initAnimations() {
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
        duration: 1.2,
        delay: 0.2,
        ease: "power3.out",
      });

      /* --- Bell Curve Breathing --- */
      gsap.to(".bell-curve", {
        y: 15,
        opacity: 0.6,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut"
      });

      gsap.from(".hero__subtitle", {
        opacity: 0,
        y: 30,
        duration: 1,
        delay: 0.5,
        ease: "power3.out",
      });

      gsap.from(".hero__ctas .btn", {
        opacity: 0,
        y: 20,
        stagger: 0.15,
        duration: 0.8,
        delay: 0.8,
        ease: "power3.out",
      });

      /* --- About section (Row Alignment) --- */
      const aboutRows = gsap.utils.toArray(".about__bio p") as HTMLElement[];
      aboutRows.forEach((row, i) => {
        gsap.from(row, {
          scrollTrigger: {
            trigger: row,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
          x: i % 2 === 0 ? -50 : 50,
          opacity: 0,
          duration: 1,
          ease: "power2.out",
        });
      });

      gsap.from(".about__photo-wrap", {
        scrollTrigger: {
          trigger: ".about",
          start: "top 70%",
          toggleActions: "play none none reverse",
        },
        x: -60,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
      });

      gsap.from(".about__bio > *", {
        scrollTrigger: {
          trigger: ".about__bio",
          start: "top 80%",
          toggleActions: "play reverse play reverse",
        },
        y: 30,
        opacity: 0,
        stagger: 0.12,
        duration: 0.8,
        ease: "power3.out",
      });

      /* --- Education Timeline Nature Animation --- */
      const eduItems = document.querySelectorAll(".education__item");
      eduItems.forEach((item) => {
        const dot = item.querySelector(".edu-dot");

        gsap.to(dot, {
          scrollTrigger: {
            trigger: item,
            start: "top 65%",
            end: "bottom 35%",
            onEnter: () => {
              dot?.classList.add("active");
            },
            onLeaveBack: () => {
              dot?.classList.remove("active");
            },
            onEnterBack: () => {
              dot?.classList.add("active");
            },
            onLeave: () => {
              dot?.classList.remove("active");
            },
          }
        });
      });

      /* --- Education Cards — staggered alternating slide-in --- */
      (gsap.utils.toArray(".education__card") as HTMLElement[]).forEach((card: HTMLElement, i: number) => {
        const fromX = i % 2 === 0 ? -60 : 60; // alternate left/right

        gsap.from(card, {
          scrollTrigger: {
            trigger: card,
            start: "top 88%",
            toggleActions: "play reverse play reverse",
            onEnter: () => card.classList.add("animated"),
            onLeaveBack: () => card.classList.remove("animated"),
            onEnterBack: () => card.classList.add("animated"),
          },
          x: fromX,
          opacity: 0,
          duration: 0.75,
          delay: i * 0.12,
          ease: "power3.out",
        });

        const badge = card.querySelector(".education__badge");
        if (badge) {
          gsap.from(badge, {
            scrollTrigger: { trigger: card, start: "top 85%", toggleActions: "play reverse play reverse" },
            scale: 0,
            opacity: 0,
            duration: 0.5,
            delay: i * 0.12 + 0.3,
            ease: "back.out(2)",
          });
        }
      });

      /* --- Teaching cards — staggered alternating slide-in --- */
      (gsap.utils.toArray(".teaching__card") as HTMLElement[]).forEach((card: HTMLElement, i: number) => {
        const fromX = i % 2 === 0 ? -60 : 60; // alternate left/right

        gsap.from(card, {
          scrollTrigger: {
            trigger: card,
            start: "top 88%",
            toggleActions: "play reverse play reverse",
            onEnter: () => card.classList.add("animated"),
            onLeaveBack: () => card.classList.remove("animated"),
            onEnterBack: () => card.classList.add("animated"),
          },
          x: fromX,
          opacity: 0,
          duration: 0.75,
          delay: i * 0.12,
          ease: "power3.out",
        });

        // Badge pop-in
        const badge = card.querySelector(".teaching__badge");
        if (badge) {
          gsap.from(badge, {
            scrollTrigger: { trigger: card, start: "top 85%", toggleActions: "play reverse play reverse" },
            scale: 0,
            opacity: 0,
            duration: 0.5,
            delay: i * 0.12 + 0.3,
            ease: "back.out(2)",
          });
        }
      });

      /* --- Research grid items --- */
      /* --- Research Interests Water Table Animation --- */
      const interestItems = document.querySelectorAll(".research__item");
      interestItems.forEach((item, i) => {
        const water = item.querySelector(".water-table");
        
        // Initial entrance (Staggered slide-in)
        const fromX = i % 2 === 0 ? -60 : 60;
        gsap.from(item, {
          scrollTrigger: {
            trigger: item,
            start: "top 88%",
            toggleActions: "play reverse play reverse",
            onEnter: () => item.classList.add("animated"),
            onLeaveBack: () => item.classList.remove("animated"),
            onEnterBack: () => item.classList.add("animated"),
          },
          x: fromX,
          opacity: 0,
          duration: 0.7,
          delay: i * 0.08,
          ease: "power3.out",
        });

        // Skill badge pop-in
        const badge = item.querySelector(".skill__badge");
        if (badge) {
          gsap.from(badge, {
            scrollTrigger: { trigger: item, start: "top 85%", toggleActions: "play reverse play reverse" },
            scale: 0,
            opacity: 0,
            duration: 0.5,
            delay: i * 0.08 + 0.3,
            ease: "back.out(2)",
          });
        }
               // Scroll-triggered height change (Primary rise)
        // Levels up on scroll down, levels down on scroll up
        gsap.to(water, {
          height: "75%",
          scrollTrigger: {
            trigger: item,
            start: "top 95%",
            end: "bottom 20%",
            scrub: 0.5,
          },
          ease: "none"
        });

        // "Full Fill" scrub when reaching publications section
        // This ensures the water levels down smoothly when scrolling back up
        gsap.to(water, {
          height: "100%",
          backgroundColor: "rgba(30, 64, 175, 0.35)",
          scrollTrigger: {
            trigger: "#publications",
            start: "top 95%",
            end: "top 60%",
            scrub: 0.5,
          },
          ease: "none"
        });


        // Hover effect (Updated colors to deep blue)
        item.addEventListener("mouseenter", () => {
          gsap.to(water, {
            height: "95%",
            duration: 0.6,
            ease: "back.out(1.5)",
            backgroundColor: "rgba(0, 85, 255, 0.35)"
          });
        });

        item.addEventListener("mouseleave", () => {
          gsap.to(water, {
            height: "20%",
            duration: 1,
            ease: "elastic.out(1, 0.3)",
            backgroundColor: "rgba(0, 102, 255, 0.18)"
          });
        });
      });

      /* --- Publication items (Correlation Thread) --- */
      const causalSections = document.querySelectorAll(".causal-container");
      causalSections.forEach(section => {
        const items = section.querySelectorAll(".pub__item") as NodeListOf<HTMLElement>;
        const list = section.querySelector(".publications__list") as HTMLElement;
        const pointer = section.querySelector(".pub__thread-pointer") as HTMLElement;
        
        items.forEach((item: HTMLElement, i: number) => {
          gsap.from(item, {
            scrollTrigger: {
              trigger: item,
              start: "top 88%",
              toggleActions: "play reverse play reverse",
            },
            y: 25,
            opacity: 0,
            duration: 0.6,
            delay: i * 0.06,
            ease: "power3.out",
          });

          // Correlation thread tracking
          ScrollTrigger.create({
            trigger: item,
            start: "top 50%",
            end: "bottom 50%",
            onEnter: () => {
              if (pointer && list) {
                gsap.to(pointer, {
                  y: item.offsetTop - list.offsetTop,
                  duration: 0.4,
                  ease: "back.out(1.7)"
                });
              }
              gsap.to(item, { backgroundColor: "rgba(255, 140, 0, 0.08)", duration: 0.3 });
            },
            onLeave: () => {
              gsap.to(item, { backgroundColor: "transparent", duration: 0.3 });
            },
            onEnterBack: () => {
              if (pointer && list) {
                gsap.to(pointer, {
                  y: item.offsetTop - list.offsetTop,
                  duration: 0.4,
                  ease: "back.out(1.7)"
                });
              }
              gsap.to(item, { backgroundColor: "rgba(255, 140, 0, 0.08)", duration: 0.3 });
            },
            onLeaveBack: () => {
              gsap.to(item, { backgroundColor: "transparent", duration: 0.3 });
            }
          });
        });
      });

      /* --- Holographic Glow for Cards (Tilt Removed) --- */
      const cards = gsap.utils.toArray(".glass-card") as HTMLElement[];
      cards.forEach((card) => {
        const glimmer = card.querySelector(".glimmer-overlay") as HTMLElement;
        const glimmerX = glimmer ? gsap.quickTo(glimmer, "x", { duration: 0.2 }) : null;
        const glimmerY = glimmer ? gsap.quickTo(glimmer, "y", { duration: 0.2 }) : null;
        const glimmerOpacity = glimmer ? gsap.quickTo(glimmer, "opacity", { duration: 0.2 }) : null;

        card.addEventListener("mousemove", (e) => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;

          if (glimmer && glimmerX && glimmerY && glimmerOpacity) {
            glimmerOpacity(0.4);
            glimmerX(x - rect.width / 2);
            glimmerY(y - rect.height / 2);
          }
        });

        card.addEventListener("mousedown", () => {
          gsap.to(card, {
            boxShadow: "0 4px 20px rgba(255, 140, 0, 0.4)",
            duration: 0.2,
            ease: "power2.out",
          });
          if (glimmer) {
            gsap.to(glimmer, { opacity: 0.8, duration: 0.2 });
          }
        });

        card.addEventListener("mouseup", () => {
          gsap.to(card, {
            boxShadow: "0 8px 40px rgba(255, 140, 0, 0.12)",
            duration: 0.4,
            ease: "back.out(2)",
          });
          if (glimmer) {
            gsap.to(glimmer, { opacity: 0.4, duration: 0.4 });
          }
        });

        card.addEventListener("mouseleave", () => {
          gsap.to(card, {
            boxShadow: "none",
            duration: 0.5,
            ease: "power2.out",
          });
          if (glimmer) {
            gsap.to(glimmer, { opacity: 0, duration: 0.5 });
          }
        });
      });
      (gsap.utils.toArray(".section__label, .section__title, .section__desc") as HTMLElement[]).forEach((el: HTMLElement) => {
        gsap.from(el, {
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            toggleActions: "play reverse play reverse",
          },
          y: 30,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
        });
      });

      /* --- Contact inputs --- */
      (gsap.utils.toArray(".contact__input, .contact__textarea") as HTMLElement[]).forEach((el: HTMLElement, i: number) => {
        gsap.from(el, {
          scrollTrigger: {
            trigger: el,
            start: "top 90%",
            toggleActions: "play reverse play reverse",
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
          toggleActions: "play reverse play reverse",
        },
        scale: 0.9,
        opacity: 0,
        duration: 0.6,
        ease: "power3.out",
      });

      /* --- Footer --- */
      gsap.from(".footer > *", {
        scrollTrigger: {
          trigger: ".footer",
          start: "top 90%",
          toggleActions: "play reverse play reverse",
        },
        y: 60,
        opacity: 0,
        stagger: 0.1,
        duration: 0.8,
        ease: "power3.out",
      });
    }
  }

  /* ============================================================
     HAMBURGER TOGGLE
     ============================================================ */
  function toggleMenu() {
    document.querySelector(".nav__hamburger")?.classList.toggle("active");
    document.querySelector(".nav__mobile-menu")?.classList.toggle("active");
  }

  function closeMenu() {
    document.querySelector(".nav__hamburger")?.classList.remove("active");
    document.querySelector(".nav__mobile-menu")?.classList.remove("active");
  }

  function handleNavClick(e: React.MouseEvent<HTMLAnchorElement>, targetId: string) {
    e.preventDefault();
    closeMenu();
    if (locoScrollRef.current) {
      locoScrollRef.current.scrollTo(targetId, { offset: -80, duration: 1.2 });
    }
  }

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

  /* ============================================================
     FOOTER PARTICLES (generate positions)
     ============================================================ */
  // Use deterministic values to avoid SSR/client hydration mismatch
  const particles = Array.from({ length: 30 }, (_, i) => {
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
  });

  return (
    <>
      {showIntro && (
        <FrameAnimationIntro onComplete={() => setShowIntro(false)} />
      )}

      {/* Main content fades in after intro completes */}
      {!showIntro && (
        <>


      {/* ============================
          NAVIGATION
          ============================ */}
      <nav className="nav" style={{ opacity: 0, animation: 'fadeInPage 0.8s ease-out 0.1s forwards' }}>
        <div className="nav__logo">
          M<span>.</span> Kinhikar
        </div>
        <ul className="nav__links">
          <li><a href="#about" onClick={(e) => handleNavClick(e, "#about")}>About</a></li>
          <li><a href="#education" onClick={(e) => handleNavClick(e, "#education")}>Education</a></li>
          <li><a href="#teaching" onClick={(e) => handleNavClick(e, "#teaching")}>Teaching</a></li>
          <li><a href="#awards" onClick={(e) => handleNavClick(e, "#awards")}>Awards</a></li>
          <li><a href="#accepted" onClick={(e) => handleNavClick(e, "#accepted")}>Conferences</a></li>
          <li><a href="#workshops" onClick={(e) => handleNavClick(e, "#workshops")}>Workshops</a></li>
          <li><a href="#publications" onClick={(e) => handleNavClick(e, "#publications")}>Research</a></li>
          <li><a href="#contact" onClick={(e) => handleNavClick(e, "#contact")}>Contact</a></li>
        </ul>
        <div className="nav__hamburger" onClick={toggleMenu}>
          <span /><span /><span />
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className="nav__mobile-menu">
        <a href="#about" onClick={(e) => handleNavClick(e, "#about")}>About</a>
        <a href="#education" onClick={(e) => handleNavClick(e, "#education")}>Education</a>
        <a href="#teaching" onClick={(e) => handleNavClick(e, "#teaching")}>Teaching</a>
        <a href="#awards" onClick={(e) => handleNavClick(e, "#awards")}>Awards</a>
        <a href="#accepted" onClick={(e) => handleNavClick(e, "#accepted")}>Conferences</a>
        <a href="#workshops" onClick={(e) => handleNavClick(e, "#workshops")}>Workshops</a>
        <a href="#publications" onClick={(e) => handleNavClick(e, "#publications")}>Research</a>
        <a href="#contact" onClick={(e) => handleNavClick(e, "#contact")}>Contact</a>
      </div>

      {/* ============================
          MAIN CONTENT
          ============================ */}
      <div
        className="main-content"
        ref={scrollContainerRef}
        data-scroll-container
        style={{ opacity: 0, animation: 'fadeInPage 0.8s ease-out 0.2s forwards' }}
      >
        {/* ── HERO ── */}
        <section className="hero" id="hero" data-scroll-section>
          <div className="hero__pattern-bg">
          </div>
          <div className="hero__overlay" />
          <div className="glow-orb glow-orb--1" />
          <div className="glow-orb glow-orb--2" />
          <div className="glow-orb glow-orb--3" />
          <div className="hero__content">
            <h1 className="hero__title">Mugdha Kinhikar</h1>
            <p className="hero__subtitle">
              PhD Researcher (Economics) &nbsp;|&nbsp; Environmental & Resource Economics &nbsp;|&nbsp;
              Groundwater Governance &nbsp;|&nbsp; Policy Evaluation
            </p>
            <div className="hero__ctas">
              <a href="#publications" className="btn btn--primary" onClick={(e) => handleNavClick(e, "#publications")}>
                View Research
              </a>
              <a href="#contact" className="btn btn--outline" onClick={(e) => handleNavClick(e, "#contact")}>
                Contact
              </a>
              <a
                href="https://www.linkedin.com/in/mugdha-kinhikar/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn--outline magnetic"
                title="LinkedIn Profile"
              >
                LinkedIn
              </a>
            </div>
          </div>
        </section>

        {/* ── ABOUT / PROFILE ── */}
        <section className="section about" id="about" data-scroll-section>
          <div className="section__container">
            <div className="section__label">Profile</div>
            <div className="section__title">About Me</div>
            <div className="about__grid">
              <div className="about__photo-wrap">
                <div className="about__photo-glow" />
                <Image
                  src="/mughda_profile.JPG"
                  alt="Mugdha Kinhikar"
                  width={400}
                  height={400}
                  className="about__photo"
                  priority
                />
              </div>
              <div className="about__bio">
                <h3>Academic &amp; Research Profile</h3>
                <p>
                  Mugdha Kinhikar is a <strong>PhD research scholar</strong> specialising in environmental and resource economics, with a focus on groundwater governance and institutions. She has extensive experience in cross-country empirical analysis using large-scale geospatial and climate datasets.
                </p>
                <p>
                  Her work involves advanced econometric methods for causal inference and impact evaluation. She has a strong background in policy-relevant research and data-intensive analysis using <strong>Stata and R</strong>.
                </p>
                <p>
                  Currently a PhD Researcher at <strong>IFMR-GSB, Krea University</strong>, she is exploring the colonial origins of groundwater depletion and the impact of institutional quality on water outcomes.
                </p>
                <ul className="about__list">
                  <li>Environmental and Resource Economics</li>
                  <li>Groundwater Governance & Institutions</li>
                  <li>Climate Adaptation Policy</li>
                  <li>Applied Causal Inference</li>
                </ul>
              </div>

            </div>
          </div>
        </section>

        {/* ── EDUCATION ── */}
        <section className="section" id="education" data-scroll-section>
          <div className="section__container">
            <div className="section__label">Education</div>
            <div className="section__title">Academic Qualifications</div>
            <div className="education__timeline">
              <div className="education__item">
                <div className="edu-dot-container">
                  <div className="edu-dot" />
                </div>
                <div className="education__card glass-card">
                  <div className="glimmer-overlay" />
                  
                  <div className="education__degree">
                    PhD in Economics
                  </div>
                  <div className="education__institution">
                    IFMR-GSB, Krea University
                  </div>
                  <div className="education__location">India</div>
                  <div className="education__duration">2022 – Present</div>
                </div>
              </div>

              <div className="education__item">
                <div className="edu-dot-container">
                  <div className="edu-dot" />
                </div>
                <div className="education__card glass-card">
                  <div className="glimmer-overlay" />
                  <div className="education__degree">
                    MPhil in Public Health
                  </div>
                  <div className="education__institution">
                    Tata Institute of Social Sciences (TISS)
                  </div>
                  <div className="education__location">Mumbai, India</div>
                  <div className="education__duration">2019 – 2021</div>
                </div>
              </div>

              <div className="education__item">
                <div className="edu-dot-container">
                  <div className="edu-dot" />
                </div>
                <div className="education__card glass-card">
                  <div className="glimmer-overlay" />
                  <div className="education__degree">
                    MA in Economics
                  </div>
                  <div className="education__institution">
                    Savitribai Phule Pune University
                  </div>
                  <div className="education__location">Pune, India</div>
                  <div className="education__duration">2016 – 2018</div>
                </div>
              </div>

              <div className="education__item">
                <div className="edu-dot-container">
                  <div className="edu-dot" />
                </div>
                <div className="education__card glass-card">
                  <div className="glimmer-overlay" />
                  <div className="education__degree">
                    BA in Economics
                  </div>
                  <div className="education__institution">
                    Savitribai Phule Pune University
                  </div>
                  <div className="education__location">Pune, India</div>
                  <div className="education__duration">2013 – 2016</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── TEACHING EXPERIENCE ── */}
        <section className="section" id="teaching" data-scroll-section>
          <div className="section__container">
            <div className="section__label">Experience</div>
            <div className="section__title">Teaching Experience</div>
            <div className="teaching__grid">
              <div className="teaching__card glass-card">
                <div className="glimmer-overlay" />
                <div className="teaching__role">Macroeconomics</div>
                <div className="teaching__institution">Teaching Assistant | IFMR-GSB, Krea University</div>
                <div className="teaching__duration">Term 2, 2023, 2024</div>
              </div>

              <div className="teaching__card glass-card">
                <div className="glimmer-overlay" />
                <div className="teaching__role">Global Economy and Business</div>
                <div className="teaching__institution">Teaching Assistant | IFMR-GSB, Krea University</div>
                <div className="teaching__duration">Term 3, 2022, 2023</div>
              </div>

              <div className="teaching__card glass-card">
                <div className="glimmer-overlay" />
                <div className="teaching__role">Strategic Management</div>
                <div className="teaching__institution">Teaching Assistant | IFMR-GSB, Krea University</div>
                <div className="teaching__duration">Term 3, 2022, 2023</div>
              </div>

              <div className="teaching__card glass-card">
                <div className="glimmer-overlay" />
                <div className="teaching__role">Financial Technology</div>
                <div className="teaching__institution">Teaching Assistant | IFMR-GSB, Krea University</div>
                <div className="teaching__duration">Term 3, 2022</div>
              </div>

              <div className="teaching__card glass-card">
                <div className="glimmer-overlay" />
                <div className="teaching__role">Sustainability and Finance</div>
                <div className="teaching__institution">Teaching Assistant | IFMR-GSB, Krea University</div>
                <div className="teaching__duration">Term 3, 2025</div>
              </div>

              <div className="teaching__card glass-card">
                <div className="glimmer-overlay" />
                <div className="teaching__role">Information System in Business</div>
                <div className="teaching__institution">Teaching Assistant | IFMR-GSB, Krea University</div>
                <div className="teaching__duration">Term 1, 2023, 2024</div>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="awards" data-scroll-section>
          <div className="section__container">
            <div className="section__label">Recognition</div>
            <div className="section__title">Awards & Qualifications</div>
            <div className="awards__grid">
              <div className="teaching__card glass-card">
                <div className="glimmer-overlay" />
                <div className="teaching__role">ESG Mentee Cohort</div>
                <div className="teaching__institution">Earth System Governance Project (2026-2027)</div>
              </div>
              <div className="teaching__card glass-card">
                <div className="glimmer-overlay" />
                <div className="teaching__role">UGC NET (Economics)</div>
                <div className="teaching__institution">Junior Research Fellowship (2021)</div>
              </div>
              <div className="teaching__card glass-card">
                <div className="glimmer-overlay" />
                <div className="teaching__role">Maharashtra SET</div>
                <div className="teaching__institution">Assistant Professor Eligibility (2019)</div>
              </div>
              <div className="teaching__card glass-card">
                <div className="glimmer-overlay" />
                <div className="teaching__role">Licentiate</div>
                <div className="teaching__institution">Insurance Institute of India</div>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="skills" data-scroll-section>
          <div className="section__container">
            <div className="section__label">Expertise</div>
            <div className="section__title">Skills & Languages</div>
            <div className="skills__grid">
              {[
                { name: "Stata & R" },
                { name: "Geospatial Data (GIS)" },
                { name: "Econometrics" },
                { name: "Impact Evaluation" },
                { name: "English, Hindi, Marathi" },
                { name: "Academic Writing" },
              ].map((item) => (
                <div className="research__item glass-card" key={item.name}>
                  <div className="glimmer-overlay" />
                  <div className="research__name">{item.name}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── RESEARCH INTERESTS ── */}
        <section className="section" id="research" data-scroll-section>
          <div className="section__container">
            <div className="section__label">Focus Areas</div>
            <div className="section__title">Research Interests</div>
            <div className="research__grid">
              {[
                { name: "Environmental and Resource Economics" },
                { name: "Groundwater Governance & Institutions" },
                { name: "Climate Adaptation Policy" },
                { name: "Public Finance and Health" },
                { name: "Applied Causal Inference" },
                { name: "Institutions and Development" },
              ].map((item) => (
                <div className="research__item glass-card" key={item.name}>
                  <div className="water-table">
                    <div className="wave" />
                    <div className="wave" />
                  </div>
                  <div className="glimmer-overlay" />
                  <div className="research__name">{item.name}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PAPERS ACCEPTED ── */}
        <section className="section" id="accepted" data-scroll-section>
          <div className="section__container">
            <div className="section__label">Upcoming</div>
            <div className="section__title">Papers Accepted</div>

            <div className="causal-container">
              <div className="impact-nodes">
                {[
                  { id: "institutions", label: "Institutions", icon: <Gavel size={18} /> },
                  { id: "resource", label: "Resources", icon: <Droplets size={18} /> },
                  { id: "policy", label: "Policy", icon: <Shield size={18} /> },
                  { id: "health", label: "Health", icon: <Stethoscope size={18} /> },
                  { id: "finance", label: "Finance", icon: <LineChart size={18} /> },
                ].map((node) => (
                  <div
                    key={node.id}
                    id={`accepted-node-${node.id}`}
                    className={`impact-node ${activeResearchId?.startsWith('accepted-') && activeNodes.includes(node.id) ? "active" : ""}`}
                  >
                    <div className="impact-node__icon">{node.icon}</div>
                    <div className="impact-node__label">{node.label}</div>
                  </div>
                ))}
              </div>

              <svg className="causal-svg-layer" ref={acceptedLayerRef}>
                <defs>
                  <filter id="accepted-path-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>
                {activeResearchId?.startsWith('accepted-') && activeNodes.map(nodeId => (
                  <path
                    key={`accepted-${activeResearchId}-${nodeId}`}
                    className="causal-path active"
                    d={getPath(activeResearchId!, nodeId, acceptedLayerRef, 'accepted')}
                    filter="url(#accepted-path-glow)"
                  />
                ))}
              </svg>

              <div className="publications__list-wrapper">
                <div className="pub__thread">
                  <div className="pub__thread-line" />
                  <div className="pub__thread-pointer" />
                </div>
                <div className="publications__list">
                  <div className="pub__category">Forthcoming</div>
                  <div
                    id="accepted-pub-1"
                    className="pub__item glass-card"
                    onMouseEnter={() => {
                      setActiveResearchId("accepted-pub-1");
                      setActiveNodes(["policy", "institutions"]);
                    }}
                    onMouseLeave={() => {
                      setActiveResearchId(null);
                      setActiveNodes([]);
                    }}
                  >
                    <div className="glimmer-overlay" />
                    <div className="pub__title">Land and Property Rights Conference</div>
                    <div className="pub__desc" style={{ fontSize: '0.8rem', color: 'var(--accent-orange)', marginTop: '0.2rem', lineHeight: '1.4' }}>
                      World Bank Headquarters, Washington DC (29th April - 1st May, 2026).
                      Analyzing institutional frameworks and property rights within the context of sustainable land governance and resource management. 
                      This presentation will explore the critical intersection of colonial legacies and modern land tenure systems.
                    </div>
                    <div className="pub__year">2026</div>
                  </div>

                  <div
                    id="accepted-pub-2"
                    className="pub__item glass-card"
                    onMouseEnter={() => {
                      setActiveResearchId("accepted-pub-2");
                      setActiveNodes(["resource", "policy"]);
                    }}
                    onMouseLeave={() => {
                      setActiveResearchId(null);
                      setActiveNodes([]);
                    }}
                  >
                    <div className="glimmer-overlay" />
                    <div className="pub__title">AIDA World Water Law Congress 2026</div>
                    <div className="pub__desc" style={{ fontSize: '0.8rem', color: 'var(--accent-orange)', marginTop: '0.2rem', lineHeight: '1.4' }}>
                      Oslo, Norway (24th - 26th June 2026).
                      Focusing on global water law and the evolution of governance mechanisms for transboundary and local water resources. 
                      The presentation highlights the critical policy shifts needed for resilient water management in water-scarce regions.
                    </div>
                    <div className="pub__year">2026</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── PAPERS PRESENTED ── */}
        <section className="section" id="presented" data-scroll-section>
          <div className="section__container">
            <div className="section__label">Conferences</div>
            <div className="section__title">Papers Presented</div>

            <div className="causal-container">
              <div className="impact-nodes">
                {[
                  { id: "institutions", label: "Institutions", icon: <Gavel size={18} /> },
                  { id: "resource", label: "Resources", icon: <Droplets size={18} /> },
                  { id: "policy", label: "Policy", icon: <Shield size={18} /> },
                  { id: "health", label: "Health", icon: <Stethoscope size={18} /> },
                  { id: "finance", label: "Finance", icon: <LineChart size={18} /> },
                ].map((node) => (
                  <div
                    key={node.id}
                    id={`presented-node-${node.id}`}
                    className={`impact-node ${activeResearchId?.startsWith('presented-') && activeNodes.includes(node.id) ? "active" : ""}`}
                  >
                    <div className="impact-node__icon">{node.icon}</div>
                    <div className="impact-node__label">{node.label}</div>
                  </div>
                ))}
              </div>

              <svg className="causal-svg-layer" ref={presentedLayerRef}>
                <defs>
                  <filter id="presented-path-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>
                {activeResearchId?.startsWith('presented-') && activeNodes.map(nodeId => (
                  <path
                    key={`presented-${activeResearchId}-${nodeId}`}
                    className="causal-path active"
                    d={getPath(activeResearchId!, nodeId, presentedLayerRef, 'presented')}
                    filter="url(#presented-path-glow)"
                  />
                ))}
              </svg>

              <div className="publications__list-wrapper">
                <div className="pub__thread">
                  <div className="pub__thread-line" />
                  <div className="pub__thread-pointer" />
                </div>
                <div className="publications__list">
                  {[
                    { id: "presented-1", title: "XIX World Water Congress", inst: "Marrakech, Morocco", year: "2025", nodes: ["resource", "policy"] },
                    { id: "presented-2", title: "Annual Conference on Economics and Finance", inst: "BITS Pilani, Hyderabad Campus", year: "2025", nodes: ["finance", "institutions"] },
                    { id: "presented-3", title: "International Conference on Economics and Public Policy", inst: "IIM Shillong", year: "2024", nodes: ["policy", "institutions"] },
                    { id: "presented-4", title: "12th South Asia Economic Policy Network Conference", inst: "World Bank Group, Dhaka, Bangladesh", year: "2023", nodes: ["policy", "institutions"] },
                    { id: "presented-5", title: "Management Education and Research Colloquium (MERC)", inst: "IIM Kashipur", year: "2023", nodes: ["institutions"] },
                    { id: "presented-6", title: "National Conference on Artificial Intelligence, Health Informatics and Virtual Reality", inst: "TISS Mumbai", year: "2019", nodes: ["health", "institutions"] },
                    { id: "presented-7", title: "Econ-Visva National Conference", inst: "Visva Bharati University", year: "2018", nodes: ["institutions"] },
                  ].map((pub) => (
                    <div
                      key={pub.id}
                      id={pub.id}
                      className="pub__item glass-card"
                      onMouseEnter={() => {
                        setActiveResearchId(pub.id);
                        setActiveNodes(pub.nodes);
                      }}
                      onMouseLeave={() => {
                        setActiveResearchId(null);
                        setActiveNodes([]);
                      }}
                    >
                      <div className="glimmer-overlay" />
                      <div className="pub__title">{pub.title}</div>
                      <div className="pub__desc" style={{ fontSize: '0.8rem', color: 'var(--accent-orange)', marginTop: '0.2rem' }}>
                        {pub.inst}
                      </div>
                      <div className="pub__year">{pub.year}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── WORKSHOPS & SCHOOLS ── */}
        <section className="section" id="workshops" data-scroll-section>
          <div className="section__container">
            <div className="section__label">Training</div>
            <div className="section__title">Workshops & Schools</div>
            <div className="education__timeline">
              <div className="education__item">
                <div className="edu-dot-container">
                  <div className="edu-dot" />
                </div>
                <div className="education__card glass-card">
                  <div className="glimmer-overlay" />
                  <div className="education__degree">Workshop on Building Ideas About Justice in Policy Research</div>
                  <div className="education__institution">IIT Tirupati</div>
                  <div className="education__duration">2023</div>
                </div>
              </div>

              <div className="education__item">
                <div className="edu-dot-container">
                  <div className="edu-dot" />
                </div>
                <div className="education__card glass-card">
                  <div className="glimmer-overlay" />
                  <div className="education__degree">Workshop on Data Science Perspectives</div>
                  <div className="education__institution">IFMR–Krea University</div>
                  <div className="education__duration">2022</div>
                </div>
              </div>

              <div className="education__item">
                <div className="edu-dot-container">
                  <div className="edu-dot" />
                </div>
                <div className="education__card glass-card">
                  <div className="glimmer-overlay" />
                  <div className="education__degree">Winter School</div>
                  <div className="education__institution">Delhi School of Economics, University of Delhi</div>
                  <div className="education__duration">2021 (Virtual)</div>
                </div>
              </div>

              <div className="education__item">
                <div className="edu-dot-container">
                  <div className="edu-dot" />
                </div>
                <div className="education__card glass-card">
                  <div className="glimmer-overlay" />
                  <div className="education__degree">Online Workshop on Economics of Pandemics</div>
                  <div className="education__institution">University of Warwick & Meghnad Desai Academy</div>
                  <div className="education__duration">2021</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── RESEARCH & PUBLICATIONS ── */}
        <section className="section" id="publications" data-scroll-section>
          <div className="section__container">
            <div className="section__label">Scholarly Work</div>
            <div className="section__title">Research & Working Papers</div>

            <div className="causal-container">
              <div className="impact-nodes">
                {[
                  { id: "institutions", label: "Institutions", icon: <Gavel size={18} /> },
                  { id: "resource", label: "Resources", icon: <Droplets size={18} /> },
                  { id: "policy", label: "Policy", icon: <Shield size={18} /> },
                  { id: "health", label: "Health", icon: <Stethoscope size={18} /> },
                  { id: "finance", label: "Finance", icon: <LineChart size={18} /> },
                ].map((node) => (
                  <div
                    key={node.id}
                    id={`causal-node-${node.id}`}
                    className={`impact-node ${(!activeResearchId?.includes('accepted') && !activeResearchId?.includes('presented')) && activeNodes.includes(node.id) ? "active" : ""}`}
                  >
                    <div className="impact-node__icon">{node.icon}</div>
                    <div className="impact-node__label">{node.label}</div>
                  </div>
                ))}
              </div>

              <svg className="causal-svg-layer" ref={causalLayerRef}>
                <defs>
                  <filter id="path-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>
                {activeResearchId?.startsWith('causal-') && activeNodes.map(nodeId => (
                  <path
                    key={`causal-${activeResearchId}-${nodeId}`}
                    className="causal-path active"
                    d={getPath(activeResearchId!, nodeId, causalLayerRef, 'causal')}
                    filter="url(#path-glow)"
                  />
                ))}
              </svg>

              <div className="publications__list-wrapper">
                <div className="pub__thread">
                  <div className="pub__thread-line" />
                  <div className="pub__thread-pointer" />
                </div>
                <div className="publications__list">
                  <div className="pub__category">Working Paper</div>
                  <div
                    id="causal-pub-wp-1"
                    className="pub__item glass-card"
                    onMouseEnter={() => {
                      setActiveResearchId("causal-pub-wp-1");
                      setActiveNodes(["institutions", "resource"]);
                    }}
                    onMouseLeave={() => {
                      setActiveResearchId(null);
                      setActiveNodes([]);
                    }}
                  >
                    <div className="glimmer-overlay" />
                    <div className="pub__title">Groundwater Depletion and Institutions: Exploring the Colonial Origin</div>
                    <div className="pub__desc" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                      Using panel data for 64 countries (2003–2019), this study examines the impact of institutional quality on groundwater outcomes, addressing endogeneity through a 2SLS framework with colonial legacy instruments.
                    </div>
                    <div className="pub__year">2024</div>
                  </div>

                  {/* <div className="pub__category">Doctoral Research</div> */}
                  {(() => {
                    const researchItems = [
                      {
                        title: "Colonial Institutions and the Historical Roots of Groundwater Extraction Patterns in India",
                        desc: "Collaborative research with Dr. Soumya Pal",
                        impact: ["institutions", "resource"]
                      },
                      {
                        title: "Governance, Institutions, and Groundwater Outcomes: A Mixed-Methods Evaluation of Atal Bhujal Yojana in Sinnar",
                        desc: "Collaborative research with Dr. Soumya Pal and Dr. Veena Srinivasan",
                        impact: ["institutions", "policy"]
                      },
                      {
                        title: "Evolution of Groundwater Policy in Water-Scarce Regions: A Global Literature Review",
                        desc: "Comprehensive review of global groundwater management strategies",
                        impact: ["policy", "resource"]
                      },
                      {
                        title: "Does the fiscal position of States matter in the allocation of climate adaptation funds in India?",
                        desc: "Analyzing State-level climate fund allocations",
                        impact: ["finance", "policy"]
                      },
                      {
                        title: "Miles to Go: A systematic literature review of gender pay gaps in India",
                        desc: "Collaborative work with Dr. Pallavi Pandey",
                        impact: ["institutions", "policy"]
                      },
                      {
                        title: "Groundwater Depletion and Institutions: Exploring the Colonial Origin",
                        desc: "Collaborative research with Dr. Soumya Pal",
                        impact: ["institutions", "resource"]
                      },
                      {
                        title: "Impact of Fiscal Transfers on Public Spending on Health in Maharashtra",
                        desc: "Analyzing health sector fiscal dynamics",
                        impact: ["health", "policy", "finance"]
                      },
                    ];

                    const doctoralItems = researchItems.filter(item => item.desc.toLowerCase().includes("soumya pal"));
                    const independentItems = researchItems.filter(item => !item.desc.toLowerCase().includes("soumya pal"));

                    return (
                      <>
                        {doctoralItems.length > 0 && (
                          <>
                            <div className="pub__category" style={{ marginTop: '2rem' }}>Doctoral Research</div>
                            {doctoralItems.map((res, idx) => (
                              <div
                                id={`causal-pub-ongoing-doc-${idx}`}
                                className="pub__item glass-card"
                                key={res.title}
                                onMouseEnter={() => {
                                  setActiveResearchId(`causal-pub-ongoing-doc-${idx}`);
                                  setActiveNodes(res.impact);
                                }}
                                onMouseLeave={() => {
                                  setActiveResearchId(null);
                                  setActiveNodes([]);
                                }}
                              >
                                <div className="glimmer-overlay" />
                                <div className="pub__title">{res.title}</div>
                                <div className="pub__desc" style={{ fontSize: '0.8rem', color: 'var(--accent-orange)', marginTop: '0.2rem' }}>{res.desc}</div>
                              </div>
                            ))}
                          </>
                        )}
                        {independentItems.length > 0 && (
                          <>
                            <div className="pub__category" style={{ marginTop: '2.5rem' }}>Independent Studies</div>
                            {independentItems.map((res, idx) => (
                              <div
                                id={`causal-pub-ongoing-ind-${idx}`}
                                className="pub__item glass-card"
                                key={res.title}
                                onMouseEnter={() => {
                                  setActiveResearchId(`causal-pub-ongoing-ind-${idx}`);
                                  setActiveNodes(res.impact);
                                }}
                                onMouseLeave={() => {
                                  setActiveResearchId(null);
                                  setActiveNodes([]);
                                }}
                              >
                                <div className="glimmer-overlay" />
                                <div className="pub__title">{res.title}</div>
                                <div className="pub__desc" style={{ fontSize: '0.8rem', color: 'var(--accent-orange)', marginTop: '0.2rem' }}>{res.desc}</div>
                              </div>
                            ))}
                          </>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* ── CONTACT ── */}
        <section className="section" id="doctoral" data-scroll-section>
          <div className="section__container">
            <div className="section__label">Research Experience</div>
            <div className="section__title">Doctoral Research</div>
            <div className="experience__content glass-card">
              <div className="glimmer-overlay" />
              <h3>PhD Researcher | IFMR-GSB, Krea University</h3>
              <p>
                Exploring the effects of institutional quality on groundwater outcomes and the colonial origins of groundwater depletion.
              </p>
            </div>
          </div>
        </section>


        {/* ── CONTACT ── */}
        <section className="section contact" id="contact" data-scroll-section>
          <div className="section__container">
            <div className="section__label">Get in Touch</div>
            <div className="section__title">Contact</div>
            <div className="section__desc">
              Interested in collaboration, research discussion, or academic
              inquiries? Feel free to reach out.
            </div>
            <form className="contact__form" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-4">
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
              </div>
            </form>
          </div>
        </section>


        {/* ── FOOTER ── */}
        <footer className="footer" data-scroll-section>
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
            <li><a href="#about" onClick={(e) => handleNavClick(e, "#about")}>About</a></li>
            <li><a href="#research" onClick={(e) => handleNavClick(e, "#research")}>Research</a></li>
            <li><a href="#publications" onClick={(e) => handleNavClick(e, "#publications")}>Publications</a></li>
            <li><a href="#contact" onClick={(e) => handleNavClick(e, "#contact")}>Contact</a></li>
          </ul>
          <div className="footer__icons">
            <a
              href="mailto:mugdha.kinhikar.phd22@krea.ac.in"
              className="footer__icon"
              aria-label="Email"
            >
              Email
            </a>
          </div>
          <p className="footer__copy">
            &copy; {new Date().getFullYear()} Mugdha Kinhikar. All rights
            reserved.
          </p>

        </footer>
      </div>
        </>
      )}
    </>
  );
}




