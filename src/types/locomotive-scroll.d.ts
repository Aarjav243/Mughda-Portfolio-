declare module 'locomotive-scroll' {
    export interface LocomotiveScrollOptions {
        el?: HTMLElement;
        name?: string;
        offset?: number;
        repeat?: boolean;
        smooth?: boolean;
        direction?: string;
        lerp?: number;
        class?: string;
        initClass?: string;
        reloadOnContextChange?: boolean;
        aria?: any;
        touchMultiplier?: number;
        smoothMobile?: boolean;
        smartphone?: {
            smooth?: boolean;
            breakpoint?: number;
        };
        tablet?: {
            smooth?: boolean;
            breakpoint?: number;
        };
        multiplier?: number;
    }

    export default class LocomotiveScroll {
        constructor(options?: LocomotiveScrollOptions);
        init(): void;
        update(): void;
        destroy(): void;
        on(event: string, callback: (args: any) => void): void;
        scrollTo(target: string | number | HTMLElement, options?: any): void;
        start(): void;
        stop(): void;
        scroll: any;
    }
}
