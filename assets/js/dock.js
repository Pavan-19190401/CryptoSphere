/**
 * CryptoSphere - macOS Magnetic Dock Engine
 * Developed by Vennu Manikanta Pavan (https://github.com/Pavan-19190401)
 *
 * Implements silky-smooth raised-cosine falloff physics, neighbour displacement integral,
 * spring-smoothed pointer tracking, and floating tooltips with zero jumping.
 */

(function () {
    const DEFAULT_BASE_SIZE = 42;
    const DEFAULT_GAP = 9;
    const DEFAULT_MAGNIFICATION = 1.48;
    const DEFAULT_DISTANCE = 140;
    const HALF = 0.5;
    const QUARTER = 0.25;

    // Raised-cosine falloff: flat near cursor, smooth tapering
    function falloffAt(delta, distance) {
        const spread = Math.abs(delta);
        if (spread >= distance) return 0;
        return (Math.cos((Math.PI * spread) / distance) + 1) * HALF;
    }

    // Signed integral of falloff curve: exact stretch displacement
    function falloffIntegral(delta, distance) {
        const sign = delta < 0 ? -1 : 1;
        const spread = Math.min(Math.abs(delta), distance);
        return sign * (((distance / (2 * Math.PI)) * Math.sin((Math.PI * spread) / distance)) + (spread * HALF));
    }

    function initDock() {
        const dockNav = document.querySelector('.dock-nav');
        if (!dockNav) return;

        const dockTrack = dockNav.querySelector('.dock-track');
        const items = Array.from(dockNav.querySelectorAll('.dock-item'));
        if (!dockTrack || items.length === 0) return;

        const count = items.length;
        const baseSize = DEFAULT_BASE_SIZE;
        const gap = DEFAULT_GAP;
        const magnification = DEFAULT_MAGNIFICATION;
        const distance = DEFAULT_DISTANCE;

        let restingCenters = [];
        for (let i = 0; i < count; i++) {
            restingCenters[i] = i * (baseSize + gap) + baseSize * HALF;
        }

        const restingLength = Math.max(baseSize, count * (baseSize + gap) - gap);
        dockTrack.style.width = `${restingLength}px`;
        dockTrack.style.height = `${baseSize}px`;

        let currentPointer = 0;
        let targetPointer = 0;
        let currentInfluence = 0;
        let targetInfluence = 0;
        let isHovering = false;
        let rafId = null;

        function gainOf(influence) {
            return influence * (magnification - 1);
        }

        function scaleAt(index, pointer, influence) {
            const gain = gainOf(influence);
            return 1 + gain * falloffAt(restingCenters[index] - pointer, distance);
        }

        function centreShift(pointer, influence) {
            const first = restingCenters[0] - pointer;
            const last = restingCenters[count - 1] - pointer;
            return (
                (falloffIntegral(first, distance) + falloffIntegral(last, distance)) * HALF +
                baseSize * (falloffAt(last, distance) - falloffAt(first, distance)) * QUARTER
            );
        }

        function centreAt(index, pointer, influence) {
            const resting = restingCenters[index];
            const gain = gainOf(influence);
            return resting + gain * (falloffIntegral(resting - pointer, distance) - centreShift(pointer, influence));
        }

        function solvePointer(rendered, influence) {
            const gain = gainOf(influence);
            let probe = rendered;
            for (let step = 0; step < 3; step++) {
                probe = rendered + gain * centreShift(probe, influence);
            }
            return probe;
        }

        function updateLayout() {
            // Smooth spring interpolation
            currentPointer += (targetPointer - currentPointer) * 0.22;
            currentInfluence += (targetInfluence - currentInfluence) * 0.18;

            const solved = solvePointer(currentPointer, currentInfluence);

            items.forEach((item, index) => {
                const scale = scaleAt(index, solved, currentInfluence);
                const center = centreAt(index, solved, currentInfluence);
                const left = center - (baseSize * HALF);

                item.style.transform = `translateX(${left}px) scale(${scale})`;
                item.style.transformOrigin = 'bottom center';
            });

            // Calculate overall bar expansion
            if (items.length > 0) {
                const firstScale = scaleAt(0, solved, currentInfluence);
                const lastScale = scaleAt(count - 1, solved, currentInfluence);
                const start = centreAt(0, solved, currentInfluence) - (baseSize * firstScale * HALF);
                const end = centreAt(count - 1, solved, currentInfluence) + (baseSize * lastScale * HALF);
                const activeLength = Math.max(restingLength, end - start);
                const pillBg = dockNav.querySelector('.dock-bg');
                if (pillBg) {
                    pillBg.style.width = `${activeLength + 24}px`;
                }
            }

            if (isHovering || Math.abs(targetInfluence - currentInfluence) > 0.005) {
                rafId = requestAnimationFrame(updateLayout);
            } else {
                currentInfluence = 0;
                items.forEach((item, index) => {
                    const left = restingCenters[index] - (baseSize * HALF);
                    item.style.transform = `translateX(${left}px) scale(1)`;
                });
                const pillBg = dockNav.querySelector('.dock-bg');
                if (pillBg) {
                    pillBg.style.width = `${restingLength + 24}px`;
                }
                rafId = null;
            }
        }

        dockTrack.addEventListener('pointerenter', () => {
            isHovering = true;
            targetInfluence = 1;
            if (!rafId) rafId = requestAnimationFrame(updateLayout);
        });

        dockTrack.addEventListener('pointermove', (e) => {
            const rect = dockTrack.getBoundingClientRect();
            targetPointer = e.clientX - rect.left;
            targetInfluence = 1;
            if (!rafId) rafId = requestAnimationFrame(updateLayout);
        });

        dockTrack.addEventListener('pointerleave', () => {
            isHovering = false;
            targetInfluence = 0;
            if (!rafId) rafId = requestAnimationFrame(updateLayout);
        });

        // Set initial resting layout
        items.forEach((item, index) => {
            const left = restingCenters[index] - (baseSize * HALF);
            item.style.position = 'absolute';
            item.style.left = '0';
            item.style.bottom = '0';
            item.style.width = `${baseSize}px`;
            item.style.height = `${baseSize}px`;
            item.style.transform = `translateX(${left}px) scale(1)`;
        });

        const pillBg = dockNav.querySelector('.dock-bg');
        if (pillBg) {
            pillBg.style.width = `${restingLength + 24}px`;
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDock);
    } else {
        initDock();
    }
})();
