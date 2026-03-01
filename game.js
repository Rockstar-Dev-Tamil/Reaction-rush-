/* ==========================================================
   REACTION RUSH — Game Engine v3
   ========================================================== */

const GameState = { IDLE: 'idle', WAITING: 'waiting', ACTIVE: 'active', PENALTY: 'penalty', BONUS: 'bonus' };

class ReactionRush {
    constructor() {
        /* --- DOM refs --- */
        this.introSection = document.getElementById('intro-section');
        this.gameSection = document.getElementById('game-section');
        this.startBtn = document.getElementById('start-btn');
        this.arena = document.getElementById('game-arena');
        this.title = document.getElementById('arena-title');
        this.subtitle = document.getElementById('arena-subtitle');
        this.currentScoreEl = document.getElementById('current-score');
        this.streakEl = document.getElementById('streak-multiplier');
        this.roundEl = document.getElementById('round-number');
        this.streakFire = document.getElementById('streak-fire');
        this.streakChip = document.getElementById('streak-chip');
        this.scoreChip = document.getElementById('score-chip');
        this.audioToggle = document.getElementById('audio-toggle');
        this.themeSelect = document.getElementById('theme-select');
        this.feedbackEl = document.getElementById('feedback-overlay');
        this.feedbackText = document.getElementById('feedback-text');
        this.feedbackSub = document.getElementById('feedback-subtext');
        this.modal = document.getElementById('stats-modal');
        this.statAvgEl = document.getElementById('stat-avg');
        this.statRoundsEl = document.getElementById('stat-rounds');
        this.statBestEl = document.getElementById('stat-best');
        this.leaderboardEl = document.getElementById('leaderboard-list');
        this.spotlight = document.getElementById('arena-spotlight');
        this.gridPlane = document.getElementById('grid-plane');
        this.shockwave = document.getElementById('shockwave');
        this.vigPulse = document.getElementById('vignette-pulse');
        this.cursorGlow = document.getElementById('cursor-glow');
        this.dustCanvas = document.getElementById('dust-canvas');

        /* --- State --- */
        this.currentState = GameState.IDLE;
        this.introActive = true;
        this.currentScore = 0;
        this.displayedScore = 0;
        this.streak = 1;
        this.round = 1;
        this.waitingTimeout = null;
        this.activationTime = 0;
        this.deceptionCount = 0;
        this.scoreAnimFrame = null;

        /* --- Persistence --- */
        this.topScores = JSON.parse(localStorage.getItem('top_scores') || '[]');
        this.totalRoundsAllTime = parseInt(localStorage.getItem('total_rounds_all') || '0');
        this.totalLatencyAllTime = parseInt(localStorage.getItem('total_latency_all') || '0');
        this.audioEnabled = localStorage.getItem('audio_enabled') !== 'false';

        /* --- Dust particles --- */
        this.dustParticles = [];
        this.initDust();

        this.init();
    }

    init() {
        this.updateStatsUI();
        this.updateAudioIcon();

        /* Intro */
        this.startBtn.addEventListener('click', () => this.launchGame());

        /* Arena */
        this.arena.addEventListener('click', (e) => this.handleAction(e));

        /* Keyboard */
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space' || e.key === ' ') {
                e.preventDefault();
                if (this.introActive) this.launchGame();
                else this.handleAction();
            }
        });

        /* Audio toggle */
        this.audioToggle.addEventListener('click', () => {
            this.audioEnabled = !this.audioEnabled;
            localStorage.setItem('audio_enabled', this.audioEnabled);
            this.updateAudioIcon();
        });

        /* Theme */
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.body.setAttribute('data-theme', savedTheme);
        this.themeSelect.value = savedTheme;
        this.themeSelect.addEventListener('change', () => {
            document.body.setAttribute('data-theme', this.themeSelect.value);
            localStorage.setItem('theme', this.themeSelect.value);
        });

        /* Stats modal */
        document.getElementById('stats-button').addEventListener('click', () => this.openModal());
        document.getElementById('close-stats').addEventListener('click', () => this.closeModal());
        document.querySelector('.modal-backdrop').addEventListener('click', () => this.closeModal());

        /* Cursor glow + grid parallax */
        let glowRaf = null;
        window.addEventListener('mousemove', (e) => {
            if (glowRaf) return;
            glowRaf = requestAnimationFrame(() => {
                this.cursorGlow.style.left = e.clientX + 'px';
                this.cursorGlow.style.top = e.clientY + 'px';
                /* Grid parallax */
                const mx = (e.clientX / window.innerWidth - 0.5) * 2;
                const my = (e.clientY / window.innerHeight - 0.5) * 2;
                this.gridPlane.style.transform = `perspective(500px) rotateX(${55 + my * 2}deg) rotateY(${mx * 1.5}deg)`;
                glowRaf = null;
            });
        });
    }

    /* ========== DUST PARTICLES ========== */
    initDust() {
        const ctx = this.dustCanvas.getContext('2d');
        const resize = () => {
            this.dustCanvas.width = window.innerWidth;
            this.dustCanvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        for (let i = 0; i < 50; i++) {
            this.dustParticles.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                r: Math.random() * 1.2 + 0.3,
                vx: (Math.random() - 0.3) * 0.35,
                vy: (Math.random() - 0.5) * 0.15,
                alpha: Math.random() * 0.4 + 0.1,
            });
        }

        const draw = () => {
            ctx.clearRect(0, 0, this.dustCanvas.width, this.dustCanvas.height);
            this.dustParticles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x > this.dustCanvas.width + 5) p.x = -5;
                if (p.x < -5) p.x = this.dustCanvas.width + 5;
                if (p.y > this.dustCanvas.height + 5) p.y = -5;
                if (p.y < -5) p.y = this.dustCanvas.height + 5;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(200,220,255,${p.alpha})`;
                ctx.fill();
            });
            requestAnimationFrame(draw);
        };
        draw();
    }

    /* ========== INTRO → GAME ========== */
    launchGame() {
        if (!this.introActive) return;
        this.introActive = false;
        audioController.initCtx();
        this.introSection.classList.add('exit');

        setTimeout(() => {
            this.introSection.style.display = 'none';
            this.gameSection.classList.remove('hidden-game');
            void this.gameSection.offsetWidth;
            this.gameSection.classList.add('visible-game');
        }, 800);
    }

    /* ========== AUDIO ICON ========== */
    updateAudioIcon() {
        document.getElementById('icon-audio-on').style.display = this.audioEnabled ? 'block' : 'none';
        document.getElementById('icon-audio-off').style.display = this.audioEnabled ? 'none' : 'block';
    }

    /* ========== SCORING ========== */
    animateScoreTo(target) {
        if (this.scoreAnimFrame) cancelAnimationFrame(this.scoreAnimFrame);
        const start = this.displayedScore;
        const diff = target - start;
        const duration = Math.min(600, Math.max(200, Math.abs(diff) * 2));
        const t0 = performance.now();

        const step = (now) => {
            const elapsed = now - t0;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(start + diff * eased);
            this.displayedScore = current;
            this.currentScoreEl.innerText = current.toLocaleString();
            if (progress < 1) {
                this.scoreAnimFrame = requestAnimationFrame(step);
            } else {
                this.displayedScore = target;
                this.currentScoreEl.innerText = target.toLocaleString();
            }
        };
        this.scoreAnimFrame = requestAnimationFrame(step);

        /* Bump animation */
        this.currentScoreEl.classList.remove('bump');
        void this.currentScoreEl.offsetWidth;
        this.currentScoreEl.classList.add('bump');

        /* Light pulse on big gains */
        if (diff > 300) {
            this.scoreChip.classList.add('pulse-glow');
            setTimeout(() => this.scoreChip.classList.remove('pulse-glow'), 400);
        }
    }

    updateStatsUI() {
        this.animateScoreTo(this.currentScore);
        this.streakEl.innerText = `${this.streak}x`;
        this.roundEl.innerText = this.round;

        /* Fire glow on streak >= 3 */
        if (this.streak >= 3) {
            this.streakFire.classList.add('lit');
        } else {
            this.streakFire.classList.remove('lit');
        }

        /* Hot chip at 5+ */
        if (this.streak >= 5) {
            this.streakChip.classList.add('hot');
        } else {
            this.streakChip.classList.remove('hot');
        }

        /* Atmospheric intensity */
        this.updateIntensity();
    }

    /* ========== ATMOSPHERIC INTENSITY ========== */
    updateIntensity() {
        const level = Math.min(this.streak, 15);
        const bright = 1 + level * 0.008;
        const glow = 1 + level * 0.06;
        const speed = 1 + level * 0.03;

        document.body.setAttribute('data-intensity', level);
        document.body.style.setProperty('--i-bright', bright);
        document.body.style.setProperty('--i-glow', glow);
        document.body.style.setProperty('--i-speed', speed);

        /* Grid intensity */
        if (this.gridPlane) {
            this.gridPlane.style.opacity = 0.4 + level * 0.04;
        }
    }

    /* ========== MODAL ========== */
    openModal() {
        this.updateModalUI();
        this.modal.classList.remove('hidden');
    }

    closeModal() {
        this.modal.classList.add('hidden');
    }

    updateModalUI() {
        const avg = this.totalRoundsAllTime > 0
            ? Math.round(this.totalLatencyAllTime / this.totalRoundsAllTime) : 0;

        /* Animated count-up */
        this.animateCounter(this.statAvgEl, avg, 'ms');
        this.animateCounter(this.statRoundsEl, this.totalRoundsAllTime, '');
        this.animateCounter(this.statBestEl, this.topScores.length > 0 ? this.topScores[0] : 0, '');

        /* Leaderboard */
        this.leaderboardEl.innerHTML = '';
        if (this.topScores.length === 0) {
            this.leaderboardEl.innerHTML = '<li><span class="rank-score">Play a round to see scores</span></li>';
        } else {
            const medals = ['🥇', '🥈', '🥉'];
            this.topScores.forEach((score, i) => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span class="rank-icon">${medals[i] || ''}</span>
                    <span class="rank-number">#${i + 1}</span>
                    <span class="rank-score">${score.toLocaleString()} pts</span>
                `;
                li.style.animation = `fb-in 0.4s ${i * 0.07}s var(--ease-back) both`;
                this.leaderboardEl.appendChild(li);
            });
        }
    }

    /* Counter animation for stats modal */
    animateCounter(el, target, suffix) {
        const dur = 600;
        const t0 = performance.now();
        const tick = (now) => {
            const p = Math.min((now - t0) / dur, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            el.innerText = Math.round(target * eased).toLocaleString() + suffix;
            if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }

    /* ========== LEADERBOARD ========== */
    saveRunToLeaderboard() {
        if (this.currentScore <= 0) return;
        if (this.topScores.length < 5 || this.currentScore > this.topScores[this.topScores.length - 1]) {
            this.topScores = this.topScores.filter(s => s !== this.currentScore);
            this.topScores.push(this.currentScore);
            this.topScores.sort((a, b) => b - a);
            this.topScores = this.topScores.slice(0, 5);
            localStorage.setItem('top_scores', JSON.stringify(this.topScores));
        }
    }

    /* ========== STATE MACHINE ========== */
    setStateClass(state) {
        Object.values(GameState).forEach(s => this.arena.classList.remove(s));
        for (let i = 1; i <= 5; i++) this.arena.classList.remove(`level-${i}`);
        this.arena.classList.add(state);

        const level = Math.min(5, Math.floor(this.streak / 5) + 1);
        if (level > 1) this.arena.classList.add(`level-${level}`);
        this.currentState = state;

        /* Spotlight color shift */
        const colors = {
            idle: 'rgba(0,229,255,.06)',
            waiting: 'rgba(255,34,85,.1)',
            active: 'rgba(0,230,118,.12)',
            bonus: 'rgba(192,96,255,.1)',
            penalty: 'rgba(255,140,0,.08)',
        };
        this.spotlight.style.background = `radial-gradient(circle,${colors[state] || colors.idle} 0%,transparent 65%)`;
    }

    setIdle() {
        this.setStateClass(GameState.IDLE);
        this.arena.style.backgroundColor = '';
        this.arena.style.boxShadow = '';
        this.title.innerText = 'Reaction Rush';
        this.subtitle.innerText = 'Click anywhere to start';
    }

    setWaiting() {
        this.setStateClass(GameState.WAITING);
        this.title.innerText = 'Wait...';
        this.subtitle.innerText = 'Don\'t click yet!';

        const baseDelay = Math.max(800, 2500 - this.streak * 80);
        const randomExtra = Math.random() * 1500;
        const totalDelay = baseDelay + randomExtra;

        /* Deception flashes */
        this.deceptionCount = 0;
        const maxDeceptions = Math.min(3, Math.floor(this.streak / 3));
        if (maxDeceptions > 0 && Math.random() < 0.4 + this.streak * 0.03) {
            this.scheduleDeceptions(maxDeceptions, totalDelay);
        }

        /* Bonus chance */
        const isBonus = Math.random() < 0.12 + this.streak * 0.01;

        this.waitingTimeout = setTimeout(() => {
            if (isBonus) this.setBonus();
            else this.setActive();
        }, totalDelay);
    }

    scheduleDeceptions(count, maxTime) {
        for (let i = 0; i < count; i++) {
            const flashTime = Math.random() * (maxTime * 0.7) + 200;
            setTimeout(() => {
                if (this.currentState !== GameState.WAITING) return;
                this.arena.style.backgroundColor = 'rgba(255,80,0,0.15)';
                this.arena.style.boxShadow = '0 0 40px rgba(255,80,0,0.2)';
                setTimeout(() => {
                    if (this.currentState !== GameState.WAITING) return;
                    this.arena.style.backgroundColor = '';
                    this.arena.style.boxShadow = '';
                }, 120 + Math.random() * 80);
            }, flashTime);
        }
    }

    setActive() {
        this.setStateClass(GameState.ACTIVE);
        this.activationTime = performance.now();
        this.title.innerText = 'NOW!';
        this.subtitle.innerText = 'Click!';
        audioController.playActive();
    }

    setBonus() {
        this.setStateClass(GameState.BONUS);
        this.activationTime = performance.now();
        this.title.innerText = 'BONUS!';
        this.subtitle.innerText = '2x Score!';
        audioController.playBonus();
    }

    setPenalty() {
        this.setStateClass(GameState.PENALTY);
        this.arena.style.backgroundColor = '';
        this.arena.style.boxShadow = '';

        this.title.innerText = 'Too Early!';
        this.subtitle.innerText = 'Focus and wait...';
        audioController.playPenalty();
        this.triggerHaptic([100, 50, 100]);

        /* Vignette pulse */
        this.triggerVignettePulse();

        /* Save run score */
        this.saveRunToLeaderboard();

        this.currentScore = 0;
        this.displayedScore = 0;
        this.streak = 1;
        this.round = 1;
        this.updateStatsUI();

        this.showFeedback('False Start!', 'Score & Streak Reset', true);
        setTimeout(() => this.setIdle(), 1500);
    }

    /* ========== ACTION HANDLER ========== */
    handleAction(event = null) {
        audioController.initCtx();

        switch (this.currentState) {
            case GameState.IDLE:
                this.setWaiting();
                break;
            case GameState.WAITING:
                clearTimeout(this.waitingTimeout);
                this.setPenalty();
                break;
            case GameState.ACTIVE:
            case GameState.BONUS:
                const latency = Math.floor(performance.now() - this.activationTime);
                this.handleSuccess(latency, this.currentState === GameState.BONUS, event);
                break;
            case GameState.PENALTY:
                break;
        }
    }

    handleSuccess(latency, isBonus, event) {
        audioController.playSuccess();
        this.triggerHaptic(30);

        let baseScore = Math.max(0, 1000 - latency);
        if (isBonus) baseScore *= 2;

        const scoreGained = Math.floor(baseScore * this.streak);
        this.currentScore += scoreGained;

        this.totalRoundsAllTime++;
        this.totalLatencyAllTime += latency;
        localStorage.setItem('total_rounds_all', this.totalRoundsAllTime);
        localStorage.setItem('total_latency_all', this.totalLatencyAllTime);

        let tier = '';
        if (latency < 150) { tier = 'Godlike!'; this.triggerGodlikeImpact(event); }
        else if (latency < 200) { tier = 'Incredible!'; this.triggerVignettePulse(); }
        else if (latency < 250) tier = 'Great!';
        else if (latency < 320) tier = 'Nice';
        else if (latency < 400) tier = 'Okay';
        else tier = 'Sluggish...';

        this.showFeedback(tier, `${latency}ms  (+${scoreGained.toLocaleString()})`);
        this.showFloatingScore(event, scoreGained, isBonus);

        /* Particles */
        if (typeof particleSystem !== 'undefined') {
            const x = event ? event.clientX : window.innerWidth / 2;
            const y = event ? event.clientY : window.innerHeight / 2;
            const count = latency < 200 ? 25 : latency < 300 ? 15 : 8;
            const color = isBonus ? 'gold' : 'random';
            particleSystem.emit(x, y, count, color);
        }

        this.streak++;
        this.round++;

        /* Camera micro-shake at streak thresholds */
        if (this.streak % 5 === 0 && this.streak >= 5) {
            document.body.classList.add('micro-shake');
            setTimeout(() => document.body.classList.remove('micro-shake'), 200);
        }

        this.updateStatsUI();

        /* Immediately go to idle to prevent double-clicks, then auto-start next round */
        this.setIdle();
        this.title.innerText = tier;
        this.subtitle.innerText = `${latency}ms`;

        setTimeout(() => this.setWaiting(), 1200);
    }

    /* ========== FEEDBACK ========== */
    showFeedback(text, subtext, isNeg = false) {
        this.feedbackEl.classList.remove('hidden', 'negative');
        if (isNeg) this.feedbackEl.classList.add('negative');
        this.feedbackText.innerText = text;
        this.feedbackSub.innerText = subtext;
        clearTimeout(this.feedbackTimeout);
        this.feedbackTimeout = setTimeout(() => this.feedbackEl.classList.add('hidden'), 1000);
    }

    showFloatingScore(event, score, isBonus) {
        if (!event) return;
        const el = document.createElement('div');
        el.className = `floating-score${isBonus ? ' bonus-score' : ''}`;
        el.innerText = `+${score.toLocaleString()}`;
        el.style.left = event.clientX + 'px';
        el.style.top = event.clientY + 'px';
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 1300);
    }

    /* ========== EFFECTS ========== */
    triggerGodlikeImpact(event) {
        /* Screen shake */
        document.body.classList.add('godlike-impact');
        setTimeout(() => document.body.classList.remove('godlike-impact'), 500);

        /* Shockwave */
        this.shockwave.classList.remove('active');
        void this.shockwave.offsetWidth;
        this.shockwave.classList.add('active');
        setTimeout(() => this.shockwave.classList.remove('active'), 700);

        /* Vignette pulse */
        this.triggerVignettePulse();

        /* Impact burst particles */
        if (typeof particleSystem !== 'undefined') {
            const x = event ? event.clientX : window.innerWidth / 2;
            const y = event ? event.clientY : window.innerHeight / 2;
            particleSystem.impactBurst(x, y);
        }
    }

    triggerVignettePulse() {
        this.vigPulse.classList.remove('flash');
        void this.vigPulse.offsetWidth;
        this.vigPulse.classList.add('flash');
        setTimeout(() => this.vigPulse.classList.remove('flash'), 500);
    }

    triggerHaptic(pattern) {
        if (navigator.vibrate && this.audioEnabled) {
            navigator.vibrate(pattern);
        }
    }
}

/* ========== INIT ========== */
window.addEventListener('DOMContentLoaded', () => {
    new ReactionRush();
});
