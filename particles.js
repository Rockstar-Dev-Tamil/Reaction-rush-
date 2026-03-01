/* ==========================================================
   REACTION RUSH — Particle System v3
   ========================================================== */

class ParticleSystem {
    constructor() {
        this.particles = [];
        this.raf = null;
        this.running = false;
    }

    emit(x, y, count = 15, colorMode = 'random') {
        const colors = this.getColors(colorMode);

        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i + (Math.random() - 0.5) * 0.6;
            const speed = 2 + Math.random() * 4;
            const type = Math.random() < 0.15 ? 'emoji' : Math.random() < 0.35 ? 'spark' : 'glow';

            this.particles.push({
                x, y, type,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 1.5,
                size: type === 'emoji' ? 16 : (2 + Math.random() * 4),
                alpha: 1,
                decay: 0.015 + Math.random() * 0.015,
                color: colors[Math.floor(Math.random() * colors.length)],
                rotation: Math.random() * 360,
                rotSpeed: (Math.random() - 0.5) * 8,
                emoji: type === 'emoji' ? ['⚡', '✨', '💥', '🔥'][Math.floor(Math.random() * 4)] : null,
                gravity: 0.05 + Math.random() * 0.05,
                blur: type === 'glow' ? Math.random() * 3 : 0,
            });
        }

        if (!this.running) this.startLoop();
    }

    impactBurst(x, y) {
        const colors = ['#00e676', '#00e5ff', '#ffd740', '#ffffff'];

        /* Main burst — 60 particles */
        for (let i = 0; i < 60; i++) {
            const angle = (Math.PI * 2 / 60) * i + (Math.random() - 0.5) * 0.3;
            const speed = 3 + Math.random() * 7;
            this.particles.push({
                x, y, type: 'glow',
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 2,
                size: 2 + Math.random() * 5,
                alpha: 1,
                decay: 0.01 + Math.random() * 0.012,
                color: colors[Math.floor(Math.random() * colors.length)],
                rotation: 0, rotSpeed: 0, emoji: null,
                gravity: 0.06,
                blur: Math.random() * 4,
            });
        }

        /* Spark ring — 20 sparks */
        for (let i = 0; i < 20; i++) {
            const angle = (Math.PI * 2 / 20) * i;
            const speed = 5 + Math.random() * 3;
            this.particles.push({
                x, y, type: 'spark',
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 2 + Math.random() * 2,
                alpha: 1,
                decay: 0.02 + Math.random() * 0.01,
                color: '#ffd740',
                rotation: 0, rotSpeed: 0, emoji: null,
                gravity: 0.02,
                blur: 0,
            });
        }

        /* Emojis */
        for (let i = 0; i < 6; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 3;
            this.particles.push({
                x, y, type: 'emoji',
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 2,
                size: 18 + Math.random() * 8,
                alpha: 1,
                decay: 0.01,
                color: null,
                rotation: Math.random() * 360,
                rotSpeed: (Math.random() - 0.5) * 12,
                emoji: ['💎', '⚡', '🔥', '✨', '🌟', '💥'][i],
                gravity: 0.08,
                blur: 0,
            });
        }

        if (!this.running) this.startLoop();
    }

    getColors(mode) {
        switch (mode) {
            case 'gold': return ['#ffd740', '#ffea00', '#fff176', '#ffe082'];
            case 'green': return ['#00e676', '#69f0ae', '#b9f6ca', '#00e5ff'];
            case 'red': return ['#ff2255', '#ff5722', '#ff8a65'];
            default: return ['#00e5ff', '#ff2d78', '#c060ff', '#00e676', '#ffd740', '#ffffff'];
        }
    }

    startLoop() {
        this.running = true;
        const loop = () => {
            if (this.particles.length === 0) {
                this.running = false;
                return;
            }

            this.particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += p.gravity;
                p.vx *= 0.985;
                p.alpha -= p.decay;
                p.rotation += p.rotSpeed;
            });

            this.particles = this.particles.filter(p => p.alpha > 0);
            this.render();
            this.raf = requestAnimationFrame(loop);
        };
        loop();
    }

    render() {
        /* Remove old DOM particles */
        document.querySelectorAll('.p-particle').forEach(el => el.remove());

        this.particles.forEach(p => {
            const el = document.createElement('div');
            el.className = 'p-particle';
            el.style.cssText = `
                position:fixed;left:${p.x}px;top:${p.y}px;pointer-events:none;z-index:600;
                transform:translate(-50%,-50%) rotate(${p.rotation}deg);
                opacity:${Math.max(0, p.alpha)};
            `;

            if (p.type === 'emoji') {
                el.style.fontSize = p.size + 'px';
                el.innerText = p.emoji;
            } else {
                el.style.width = p.size + 'px';
                el.style.height = p.size + 'px';
                el.style.borderRadius = '50%';
                el.style.background = p.color;

                if (p.type === 'glow') {
                    el.style.mixBlendMode = 'screen';
                    el.style.filter = `blur(${p.blur}px)`;
                    el.style.boxShadow = `0 0 ${p.size * 2}px ${p.color}`;
                } else if (p.type === 'spark') {
                    el.style.boxShadow = `0 0 ${p.size + 4}px ${p.color}, 0 0 ${p.size + 8}px ${p.color}`;
                }
            }

            document.body.appendChild(el);
        });
    }
}

const particleSystem = new ParticleSystem();
