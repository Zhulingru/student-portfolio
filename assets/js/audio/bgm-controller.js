class BGMController {
    constructor() {
        console.log('Initializing BGMController...');
        // 使用完整的相對路徑
        const basePath = window.location.pathname.includes('github.io') ? '/student-portfolio' : '';
        this.music1 = new Audio(`${basePath}/assets/audio/background music1.mp3`);
        this.music2 = new Audio(`${basePath}/assets/audio/background music2.mp3`);
        
        this.currentTrack = null;
        this.fadeOutDuration = 3000;
        this.waitDuration = 3000;
        this.isPlaying = false;

        // 添加詳細的錯誤處理
        this.music1.addEventListener('error', (e) => {
            console.error('Error loading music1:', e);
            console.error('Music1 error details:', this.music1.error);
            console.log('Music1 source:', this.music1.src);
        });

        this.music2.addEventListener('error', (e) => {
            console.error('Error loading music2:', e);
            console.error('Music2 error details:', this.music2.error);
            console.log('Music2 source:', this.music2.src);
        });

        // 添加加載成功的回調
        this.music1.addEventListener('loadeddata', () => {
            console.log('Music1 loaded successfully');
        });

        this.music2.addEventListener('loadeddata', () => {
            console.log('Music2 loaded successfully');
        });

        // 設置循環播放
        this.music1.addEventListener('ended', () => this.handleTrackEnd());
        this.music2.addEventListener('ended', () => this.handleTrackEnd());

        // 設置音量
        this.music1.volume = 1;
        this.music2.volume = 1;

        console.log('BGMController initialized');
    }

    async start() {
        console.log('Attempting to start playback...');
        if (this.isPlaying) {
            console.log('Already playing, skipping start');
            return;
        }
        
        try {
            this.isPlaying = true;
            this.currentTrack = this.music1;
            console.log('Starting playback with music1');
            await this.playTrack(this.music1);
        } catch (error) {
            console.error('Error starting playback:', error);
        }
    }

    async handleTrackEnd() {
        const nextTrack = this.currentTrack === this.music1 ? this.music2 : this.music1;
        await this.fadeOut(this.currentTrack);
        await this.wait(this.waitDuration);
        this.currentTrack = nextTrack;
        await this.playTrack(nextTrack);
    }

    async playTrack(track) {
        console.log('Attempting to play track:', track.src);
        track.currentTime = 0;
        track.volume = 1;
        
        try {
            const playPromise = track.play();
            if (playPromise !== undefined) {
                await playPromise;
                console.log('Track started playing successfully');
            }
        } catch (error) {
            console.error('Error playing track:', error);
            // 如果自動播放被阻止，嘗試靜音播放
            if (error.name === 'NotAllowedError') {
                console.log('Attempting to play muted...');
                track.muted = true;
                await track.play();
                // 漸漸取消靜音
                this.fadeInVolume(track);
            }
        }
    }

    fadeInVolume(track) {
        track.volume = 0;
        track.muted = false;
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
            const startVolume = track.volume;
            const steps = 50;
            const stepDuration = this.fadeOutDuration / steps;
            const volumeStep = startVolume / steps;
            
            const fadeInterval = setInterval(() => {
                if (track.volume > volumeStep) {
                    track.volume -= volumeStep;
                } else {
                    track.pause();
                    track.volume = startVolume;
                    clearInterval(fadeInterval);
                    resolve();
                }
            }, stepDuration);
        });
    }

    async wait(duration) {
        return new Promise(resolve => setTimeout(resolve, duration));
    }

    stop() {
        this.isPlaying = false;
        this.music1.pause();
        this.music2.pause();
        this.music1.currentTime = 0;
        this.music2.currentTime = 0;
    }
} 