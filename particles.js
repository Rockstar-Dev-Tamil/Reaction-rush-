class ParticleSystem {
    constructor() {
        this.container = document.createElement('div');
        this.container.className = 'particles-container';
        document.body.appendChild(this.container);

        this.styleSheet = document.createElement('style');
        this.styleSheet.textContent = `
            .particles-container {
                position: fixed;
                top: 0; left: 0; right: 0; bottom: 0;
                pointer-events: none;
                z-index: 100;
                overflow: hidden;
            }
            .particle {
                position: absolute;
                will-change: transform, opacity;
                pointer-events: none;
            }
            .particle-glow {
                border-radius: 50%;
                mix-blend-mode: screen;
            }
            .particle-trail {
                border-radius: 50%;
                filter: blur(2px);
                mix-blend-mode: screen;
            }
            .particle-emoji {
                display: flex;
                align-items: center;
                justify-content: center;
                filter: drop-shadow(0 0 6px rgba(255,255,255,0.3));
            }
            .particle-spark {
                border-radius: 50%;
                mix-blend-mode: screen;
                box-shadow: 0 0 6px currentColor, 0 0 12px currentColor;
            }
        `;
        document.head.appendChild(this.styleSheet);

        this.activeParticles = [];
        this.isAnimating = false;
    }

    spawn(x, y, count = 20, color = 'random') {
        const colors = [
            '#00f0ff', '#ff2d78', '#00e676', '#bf5af2', '#ffd60a',
            '#ff8c00', '#00e5ff', '#ea80fc', '#69f0ae', '#ffab40'
        ];

        for (let i = 0; i < count; i++) {
            const actualColor = color === 'random'
                ? colors[Math.floor(Math.random() * colors.length)]
                : color;

            const rand = Math.random();
            if (rand < 0.15) {
                this.createEmojiParticle(x, y);
            } else if (rand < 0.4) {
                this.createGlowParticle(x, y, actualColor);
            } else if (rand < 0.7) {
                this.createSparkParticle(x, y, actualColor);
            } else {
                this.createTrailParticle(x, y, actualColor);
            }
        }

        if (!this.isAnimating) {
            this.isAnimating = true;
            this.animate();
        }
    }

    createGlowParticle(x, y, color) {
        const p = document.createElement('div');
        p.className = 'particle particle-glow';
        const size = Math.random() * 12 + 6;
        p.style.width = `${size}px`;
        p.style.height = `${size}px`;
        p.style.backgroundColor = color;
        p.style.boxShadow = `0 0 ${size}px ${color}, 0 0 ${size * 2}px ${color}`;
        p.style.left = `${x}px`;
        p.style.top = `${y}px`;

        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 200 + 80;

        this.container.appendChild(p);
        this.activeParticles.push({
            el: p,
            x: 0, y: 0,
            vx: Math.cos(angle) * velocity,
            vy: Math.sin(angle) * velocity,
            startTime: performance.now(),
            duration: 800 + Math.random() * 500,
            gravity: 80 + Math.random() * 60,
            friction: 0.98
        });
    }

    createSparkParticle(x, y, color) {
        const p = document.createElement('div');
        p.className = 'particle particle-spark';
        const size = Math.random() * 5 + 3;
        p.style.width = `${size}px`;
        p.style.height = `${size}px`;
        p.style.backgroundColor = color;
        p.style.color = color;
        p.style.left = `${x}px`;
        p.style.top = `${y}px`;

        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 300 + 100;

        this.container.appendChild(p);
        this.activeParticles.push({
            el: p,
            x: 0, y: 0,
            vx: Math.cos(angle) * velocity,
            vy: Math.sin(angle) * velocity,
            startTime: performance.now(),
            duration: 500 + Math.random() * 400,
            gravity: 120 + Math.random() * 80,
            friction: 0.96
        });
    }

    createTrailParticle(x, y, color) {
        const p = document.createElement('div');
        p.className = 'particle particle-trail';
        const size = Math.random() * 8 + 4;
        p.style.width = `${size}px`;
        p.style.height = `${size}px`;
        p.style.backgroundColor = color;
        p.style.left = `${x}px`;
        p.style.top = `${y}px`;

        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 160 + 60;

        this.container.appendChild(p);
        this.activeParticles.push({
            el: p,
            x: 0, y: 0,
            vx: Math.cos(angle) * velocity,
            vy: Math.sin(angle) * velocity,
            startTime: performance.now(),
            duration: 600 + Math.random() * 500,
            gravity: 100 + Math.random() * 50,
            friction: 0.97
        });
    }

    createEmojiParticle(x, y) {
        const emojis = ['💥', '✨', '⚡', '🚀', '🔥', '🎉', '💫', '⭐', '🌟', '💎'];
        const p = document.createElement('div');
        p.className = 'particle particle-emoji';
        const size = Math.random() * 14 + 14;
        p.style.fontSize = `${size}px`;
        p.style.width = `${size + 4}px`;
        p.style.height = `${size + 4}px`;
        p.innerText = emojis[Math.floor(Math.random() * emojis.length)];
        p.style.left = `${x}px`;
        p.style.top = `${y}px`;

        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 180 + 60;

        this.container.appendChild(p);
        this.activeParticles.push({
            el: p,
            x: 0, y: 0,
            vx: Math.cos(angle) * velocity,
            vy: Math.sin(angle) * velocity,
            startTime: performance.now(),
            duration: 900 + Math.random() * 400,
            gravity: 60 + Math.random() * 40,
            friction: 0.985,
            spin: (Math.random() - 0.5) * 360
        });
    }

    animate() {
        const now = performance.now();
        let i = this.activeParticles.length;

        while (i--) {
            const p = this.activeParticles[i];
            const elapsed = (now - p.startTime) / 1000; // seconds
            const progress = Math.min(1, (now - p.startTime) / p.duration);

            if (progress >= 1) {
                p.el.remove();
                this.activeParticles.splice(i, 1);
                continue;
            }

            // Physics
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            p.x = p.vx * easeProgress;
            p.y = p.vy * easeProgress + p.gravity * Math.pow(easeProgress, 2);

            const opacity = 1 - Math.pow(progress, 2);
            const scale = 1 - progress * 0.6;
            const rotation = p.spin ? p.spin * easeProgress : 0;

            p.el.style.transform = `translate(${p.x}px, ${p.y}px) scale(${scale}) rotate(${rotation}deg)`;
            p.el.style.opacity = opacity;
        }

        if (this.activeParticles.length > 0) {
            requestAnimationFrame(() => this.animate());
        } else {
            this.isAnimating = false;
        }
    }

    // Impact burst — massive particle explosion for Godlike
    impactBurst(x, y) {
        this.spawn(x, y, 60, 'random');

        // Extra ring of sparks
        for (let i = 0; i < 20; i++) {
            const angle = (i / 20) * Math.PI * 2;
            const p = document.createElement('div');
            p.className = 'particle particle-spark';
            p.style.width = '4px';
            p.style.height = '4px';
            p.style.backgroundColor = '#fff';
            p.style.color = '#fff';
            p.style.left = `${x}px`;
            p.style.top = `${y}px`;

            this.container.appendChild(p);
            const velocity = 350;
            this.activeParticles.push({
                el: p,
                x: 0, y: 0,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                startTime: performance.now(),
                duration: 600,
                gravity: 20,
                friction: 0.95
            });
        }

        if (!this.isAnimating) {
            this.isAnimating = true;
            this.animate();
        }
    }
}

window.particleSystem = new ParticleSystem();
