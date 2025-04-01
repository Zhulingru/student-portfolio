class BGMController {
    constructor() {
        console.log('Initializing BGMController...');
        
        // 修正路徑處理邏輯
        const isGitHubPages = window.location.hostname.includes('github.io');
        const basePath = isGitHubPages ? '/student-portfolio' : '';
        
        // 使用不帶空格的文件名
        const audioPath1 = `${basePath}/assets/audio/background_music1.mp3`;
        const audioPath2 = `${basePath}/assets/audio/background_music2.mp3`;
        
        console.log('Current hostname:', window.location.hostname);
        console.log('Is GitHub Pages:', isGitHubPages);
        console.log('Base path:', basePath);
        console.log('Loading audio from:', audioPath1, audioPath2);
        
        // 創建音頻元素
        this.music1 = new Audio();
        this.music2 = new Audio();
        
        // 設置音頻屬性
        [this.music1, this.music2].forEach(audio => {
            audio.preload = 'auto';
            audio.loop = false;
            audio.volume = 0;
        });
        
        // 設置音源
        this.music1.src = audioPath1;
        this.music2.src = audioPath2;
        
        // 初始化其他屬性
        this.currentTrack = null;
        this.fadeOutDuration = 3000;
        this.waitDuration = 3000;
        this.isPlaying = false;
        
        // 設置事件監聽器
        this.setupEventListeners();
    }

    setupEventListeners() {
        [this.music1, this.music2].forEach(audio => {
            audio.addEventListener('ended', () => this.handleTrackEnd());
            audio.addEventListener('error', (e) => {
                console.error('Audio error:', e);
                console.error('Error details:', audio.error);
                console.error('Audio source:', audio.src);
            });
            audio.addEventListener('canplaythrough', () => {
                console.log('Audio can play through:', audio.src);
            });
        });
    }

    async start() {
        if (this.isPlaying) return;
        
        try {
            // 確保音頻已經加載
            await new Promise((resolve, reject) => {
                if (this.music1.readyState >= 3) {
                    resolve();
                } else {
                    this.music1.addEventListener('canplaythrough', resolve, { once: true });
                    this.music1.addEventListener('error', reject, { once: true });
                }
            });

            this.currentTrack = this.music1;
            await this.music1.play();
            this.isPlaying = true;
            this.fadeIn(this.currentTrack);
            console.log('Music started successfully');
        } catch (error) {
            console.error('Failed to start music:', error);
        }
    }

    fadeIn(track) {
        track.volume = 0;
        const fadeInterval = setInterval(() => {
            if (track.volume < 1) {
                track.volume = Math.min(track.volume + 0.1, 1);
            } else {
                clearInterval(fadeInterval);
            }
        }, 200);
    }

    async fadeOut(track) {
        return new Promise(resolve => {
            const fadeInterval = setInterval(() => {
                if (track.volume > 0) {
                    track.volume = Math.max(track.volume - 0.1, 0);
                } else {
                    clearInterval(fadeInterval);
                    track.pause();
                    resolve();
                }
            }, 200);
        });
    }

    async handleTrackEnd() {
        if (!this.isPlaying) return;
        
        const nextTrack = this.currentTrack === this.music1 ? this.music2 : this.music1;
        
        try {
            nextTrack.currentTime = 0;
            nextTrack.volume = 0;
            await nextTrack.play();
            this.fadeIn(nextTrack);
            this.currentTrack = nextTrack;
        } catch (error) {
            console.error('Error switching tracks:', error);
        }
    }
} 