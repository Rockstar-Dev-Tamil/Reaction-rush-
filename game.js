const GameState = {
    IDLE: 'idle',
    WAITING: 'waiting',
    ACTIVE: 'active',
    PENALTY: 'penalty',
    BONUS: 'bonus'
};

class ReactionRush {
    constructor() {
        this.currentState = GameState.IDLE;
        this.introActive = true;

        // Intro
        this.introSection = document.getElementById('intro-section');
        this.gameSection = document.getElementById('game-section');
        this.startBtn = document.getElementById('start-btn');

        // Arena
        this.arena = document.getElementById('game-arena');
        this.title = document.getElementById('arena-title');
        this.subtitle = document.getElementById('arena-subtitle');
        this.feedback = document.getElementById('feedback-overlay');
        this.feedbackText = document.getElementById('feedback-text');
        this.feedbackSubtext = document.getElementById('feedback-subtext');

        // HUD
        this.currentScoreEl = document.getElementById('current-score');
        this.streakEl = document.getElementById('streak-multiplier');
        this.highScoreEl = document.getElementById('high-score');
        this.roundEl = document.getElementById('round-number');
        this.streakFire = document.getElementById('streak-fire');
        this.audioToggle = document.getElementById('audio-toggle');
        this.audioOnIcon = document.getElementById('icon-audio-on');
        this.audioOffIcon = document.getElementById('icon-audio-off');

        // Theme / Stats
        this.themeSelect = document.getElementById('theme-select');
        this.statsBtn = document.getElementById('stats-button');
        this.statsModal = document.getElementById('stats-modal');
        this.closeStatsBtn = document.getElementById('close-stats');
        this.statAvgEl = document.getElementById('stat-avg');
        this.statRoundsEl = document.getElementById('stat-rounds');
        this.statBestEl = document.getElementById('stat-best');
        this.leaderboardListEl = document.getElementById('leaderboard-list');

        // Persisted data
        this.topScores = JSON.parse(localStorage.getItem('top_scores')) || [];
        if (this.topScores.length === 0 && localStorage.getItem('high_score')) {
            this.topScores.push(parseInt(localStorage.getItem('high_score')));
        }
        this.totalRoundsAllTime = parseInt(localStorage.getItem('total_rounds_all')) || 0;
        this.totalLatencyAllTime = parseInt(localStorage.getItem('total_latency_all')) || 0;

        // Game state
        this.currentScore = 0;
        this.streak = 1;
        this.round = 1;
        this.displayedScore = 0;
        this.scoreAnimFrame = null;
        this.waitingTimeout = null;
        this.activationTime = 0;

        this.init();
    }

    init() {
        this.updateStatsUI();
        this.updateAudioIcon();

        // === Intro interactions ===
        this.startBtn.addEventListener('click', () => this.launchGame());

        // Shine effect on btn hover
        this.startBtn.addEventListener('mouseenter', () => {
            this.startBtn.querySelector('.btn-shine').style.animation = 'none';
            void this.startBtn.querySelector('.btn-shine').offsetWidth;
        });

        // === Keyboard ===
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                if (this.introActive) { this.launchGame(); return; }
                if (!e.repeat) this.handleAction();
            }
        });

        // === Arena ===
        this.arena.addEventListener('mousedown', (e) => this.handleAction(e));
        this.arena.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleAction(e.touches[0]);
        });

        // === Audio ===
        this.audioToggle.addEventListener('click', () => {
            audioController.toggle();
            this.updateAudioIcon();
        });

        // === Theme ===
        this.currentTheme = localStorage.getItem('theme') || 'dark';
        this.applyTheme(this.currentTheme);
        this.themeSelect.value = this.currentTheme;

        this.themeSelect.addEventListener('change', (e) => {
            this.applyTheme(e.target.value);
            this.themeSelect.blur();
        });

        // === Stats modal ===
        this.statsBtn.addEventListener('click', () => {
            this.updateModalUI();
            this.statsModal.classList.remove('hidden');
        });

        this.closeStatsBtn.addEventListener('click', () => {
            this.statsModal.classList.add('hidden');
        });

        this.statsModal.querySelector('.modal-backdrop').addEventListener('click', () => {
            this.statsModal.classList.add('hidden');
        });

        // === Cursor glow ===
        this.cursorGlow = document.getElementById('cursor-glow');
        let cursorRaf = null;
        document.addEventListener('mousemove', (e) => {
            if (cursorRaf) return;
            cursorRaf = requestAnimationFrame(() => {
                this.cursorGlow.style.left = `${e.clientX}px`;
                this.cursorGlow.style.top = `${e.clientY}px`;
                cursorRaf = null;
            });
        });

        this.setIdle();
    }

    launchGame() {
        if (!this.introActive) return;
        this.introActive = false;
        audioController.initCtx();

        this.introSection.classList.add('exit');

        setTimeout(() => {
            this.introSection.style.display = 'none';
            this.gameSection.classList.remove('hidden-game');
            // Trigger reflow, then animate in
            void this.gameSection.offsetWidth;
            this.gameSection.classList.add('visible-game');
        }, 700);
    }

    applyTheme(theme) {
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        this.currentTheme = theme;
    }

    triggerHaptic(pattern) {
        if ('vibrate' in navigator) navigator.vibrate(pattern);
    }

    updateAudioIcon() {
        this.audioOnIcon.style.display = audioController.enabled ? 'block' : 'none';
        this.audioOffIcon.style.display = audioController.enabled ? 'none' : 'block';
    }

    // Rolling score animation
    animateScoreTo(target) {
        if (this.scoreAnimFrame) cancelAnimationFrame(this.scoreAnimFrame);
        const start = this.displayedScore;
        const diff = target - start;
        if (diff === 0) return;

        const startTime = performance.now();
        const duration = Math.min(700, Math.abs(diff) * 2 + 150);

        const step = (now) => {
            const progress = Math.min(1, (now - startTime) / duration);
            const eased = 1 - Math.pow(1 - progress, 3);
            this.displayedScore = Math.round(start + diff * eased);
            this.currentScoreEl.innerText = this.displayedScore.toLocaleString();

            if (progress < 1) {
                this.scoreAnimFrame = requestAnimationFrame(step);
            } else {
                this.displayedScore = target;
                this.currentScoreEl.innerText = target.toLocaleString();
            }
        };

        this.scoreAnimFrame = requestAnimationFrame(step);

        // Bump animation
        this.currentScoreEl.classList.remove('bump');
        void this.currentScoreEl.offsetWidth;
        this.currentScoreEl.classList.add('bump');
    }

    updateStatsUI() {
        if (this.highScoreEl) this.highScoreEl.innerText = this.topScores.length > 0 ? this.topScores[0].toLocaleString() : '0';
        this.animateScoreTo(this.currentScore);
        this.streakEl.innerText = `${this.streak}x`;
        this.roundEl.innerText = this.round;

        // Fire glow on streak >= 3
        if (this.streak >= 3) {
            this.streakFire.classList.add('lit');
        } else {
            this.streakFire.classList.remove('lit');
        }
    }

    updateModalUI() {
        const avg = this.totalRoundsAllTime > 0
            ? Math.round(this.totalLatencyAllTime / this.totalRoundsAllTime) : 0;

        this.statAvgEl.innerText = `${avg}ms`;
        this.statRoundsEl.innerText = this.totalRoundsAllTime.toLocaleString();
        this.statBestEl.innerText = this.topScores.length > 0 ? this.topScores[0].toLocaleString() : '0';

        this.leaderboardListEl.innerHTML = '';
        if (this.topScores.length === 0) {
            this.leaderboardListEl.innerHTML = '<li><span class="rank-score">Play a round to see scores</span></li>';
        } else {
            const medals = ['🥇', '🥈', '🥉'];
            this.topScores.forEach((score, i) => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span class="rank-icon">${medals[i] || ''}</span>
                    <span class="rank-number">#${i + 1}</span>
                    <span class="rank-score">${score.toLocaleString()} pts</span>
                `;
                li.style.animation = `fb-in 0.4s ${i * 0.06}s cubic-bezier(0.34,1.56,0.64,1) both`;
                this.leaderboardListEl.appendChild(li);
            });
        }
    }

    saveRunToLeaderboard() {
        if (this.currentScore <= 0) return;
        // Only save if this score qualifies for the top 5
        if (this.topScores.length < 5 || this.currentScore > this.topScores[this.topScores.length - 1]) {
            // Remove duplicates if any
            this.topScores = this.topScores.filter(s => s !== this.currentScore);
            this.topScores.push(this.currentScore);
            this.topScores.sort((a, b) => b - a);
            this.topScores = this.topScores.slice(0, 5);
            localStorage.setItem('top_scores', JSON.stringify(this.topScores));
        }
    }

    setStateClass(state) {
        Object.values(GameState).forEach(s => this.arena.classList.remove(s));
        for (let i = 1; i <= 5; i++) this.arena.classList.remove(`level-${i}`);

        this.arena.classList.add(state);

        const level = Math.min(5, Math.floor(this.streak / 5) + 1);
        if (state === GameState.WAITING || state === GameState.ACTIVE || state === GameState.BONUS) {
            this.arena.classList.add(`level-${level}`);
        }

        this.currentState = state;
    }

    showFeedback(title, subtext, isNegative = false) {
        this.feedback.classList.remove('hidden', 'negative');
        if (isNegative) this.feedback.classList.add('negative');
        this.feedbackText.innerText = title;
        this.feedbackSubtext.innerText = subtext;

        setTimeout(() => {
            this.feedback.classList.add('hidden');
        }, 1500);
    }

    spawnFloatingScore(x, y, text, isBonus = false) {
        const el = document.createElement('div');
        el.className = 'floating-score' + (isBonus ? ' bonus-score' : '');
        el.innerText = text;
        el.style.left = `${x + (Math.random() - 0.5) * 30}px`;
        el.style.top = `${y - 15}px`;
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 1400);
    }

    // --- State Methods (unchanged mechanics) ---

    setIdle() {
        this.setStateClass(GameState.IDLE);
        this.title.innerText = 'Reaction Rush';
        this.subtitle.innerText = 'Click anywhere to start';
    }

    setWaiting() {
        this.setStateClass(GameState.WAITING);
        this.title.innerText = 'Wait for Green...';
        this.subtitle.innerText = 'Steady...';

        const difficultyLevel = Math.min(this.round, 20);
        const minDelay = Math.max(1000, 1500 - (25 * difficultyLevel));
        const variance = Math.max(1000, 3000 - (100 * difficultyLevel));
        const delay = Math.random() * variance + minDelay;

        const deceptionChance = Math.min(0.30, 0.02 * difficultyLevel);
        const willDeceive = Math.random() < deceptionChance;

        if (willDeceive) {
            const deceptiveDelay = delay * 0.4;
            this.waitingTimeout = setTimeout(() => {
                this.triggerDeception();
                this.waitingTimeout = setTimeout(() => {
                    this.activateRealSignal();
                }, delay - deceptiveDelay);
            }, deceptiveDelay);
        } else {
            this.waitingTimeout = setTimeout(() => {
                this.activateRealSignal();
            }, delay);
        }
    }

    triggerDeception() {
        this.arena.style.backgroundColor = 'var(--penalty)';
        this.arena.style.boxShadow = 'var(--glow-pen)';
        setTimeout(() => {
            if (this.currentState === GameState.WAITING) {
                this.arena.style.backgroundColor = '';
                this.arena.style.boxShadow = '';
            }
        }, 150);
    }

    activateRealSignal() {
        this.setActive(Math.random() < 0.1);
    }

    setActive(isBonus = false) {
        this.setStateClass(isBonus ? GameState.BONUS : GameState.ACTIVE);
        this.title.innerText = 'CLICK NOW!';
        this.subtitle.innerText = isBonus ? '⭐ 2x BONUS ⭐' : '';

        if (isBonus) {
            audioController.playBonus();
            this.triggerHaptic([50, 50, 50]);
        } else {
            audioController.playActive();
            this.triggerHaptic(50);
        }

        this.activationTime = performance.now();
    }

    setPenalty() {
        this.setStateClass(GameState.PENALTY);
        this.arena.style.backgroundColor = '';
        this.arena.style.boxShadow = '';

        this.title.innerText = 'Too Early!';
        this.subtitle.innerText = 'Focus and wait...';
        audioController.playPenalty();
        this.triggerHaptic([100, 50, 100]);

        // Save run score to leaderboard before resetting
        this.saveRunToLeaderboard();

        this.currentScore = 0;
        this.displayedScore = 0;
        this.streak = 1;
        this.round = 1;
        this.updateStatsUI();

        this.showFeedback('False Start!', 'Score & Streak Reset', true);

        setTimeout(() => this.setIdle(), 1500);
    }

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
        else if (latency < 200) tier = 'Incredible!';
        else if (latency < 250) tier = 'Great!';
        else if (latency < 320) tier = 'Nice';
        else if (latency < 400) tier = 'Okay';
        else tier = 'Sluggish...';

        this.showFeedback(tier, `${latency}ms  (+${scoreGained.toLocaleString()})`);

        // Floating score
        let fx, fy;
        if (event && event.clientX) { fx = event.clientX; fy = event.clientY; }
        else {
            const r = this.arena.getBoundingClientRect();
            fx = r.left + r.width / 2; fy = r.top + r.height / 2;
        }
        this.spawnFloatingScore(fx, fy, `+${scoreGained.toLocaleString()}`, isBonus);

        this.triggerParticles(event, isBonus);

        this.streak++;
        this.round++;
        this.updateStatsUI();
        this.setIdle();
    }

    triggerParticles(event, isBonus) {
        if (!window.particleSystem) return;
        let x, y;
        if (event && event.clientX) { x = event.clientX; y = event.clientY; }
        else {
            const r = this.arena.getBoundingClientRect();
            x = r.left + r.width / 2; y = r.top + r.height / 2;
        }
        const color = isBonus ? '#c060ff' : 'random';
        const count = isBonus ? 45 : 20 + Math.min(this.streak * 3, 35);
        window.particleSystem.spawn(x, y, count, color);
    }

    triggerGodlikeImpact(event) {
        document.body.classList.add('godlike-impact');
        setTimeout(() => document.body.classList.remove('godlike-impact'), 400);

        if (window.particleSystem) {
            let x, y;
            if (event && event.clientX) { x = event.clientX; y = event.clientY; }
            else {
                const r = this.arena.getBoundingClientRect();
                x = r.left + r.width / 2; y = r.top + r.height / 2;
            }
            window.particleSystem.impactBurst(x, y);
        }
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new ReactionRush();
});
