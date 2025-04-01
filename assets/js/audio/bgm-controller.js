class BGMController {
    constructor() {
        console.log('Initializing BGMController...');
        
        // 修正路徑處理邏輯
        const isGitHubPages = window.location.hostname.includes('github.io');
        const basePath = isGitHubPages ? 'https://zhulingru.github.io/student-portfolio' : '';
        const audioPath1 = `${basePath}/assets/audio/background music1.mp3`;
        const audioPath2 = `${basePath}/assets/audio/background music2.mp3`;
        
        console.log('Current hostname:', window.location.hostname);
        console.log('Is GitHub Pages:', isGitHubPages);
        console.log('Base path:', basePath);
        console.log('Loading audio from:', audioPath1, audioPath2);
        
        this.music1 = new Audio(audioPath1);
        this.music2 = new Audio(audioPath2);
        
        this.currentTrack = null;
        this.fadeOutDuration = 3000;
        this.waitDuration = 3000;
        this.isPlaying = false;

        // 添加詳細的錯誤處理
        this.music1.addEventListener('error', (e) => {
            console.error('Error loading music1:', e);
            console.error('Music1 error details:', this.music1.error);
            console.log('Music1 source:', this.music1.src);
            console.log('Music1 ready state:', this.music1.readyState);
        });

        this.music2.addEventListener('error', (e) => {
            console.error('Error loading music2:', e);
            console.error('Music2 error details:', this.music2.error);
            console.log('Music2 source:', this.music2.src);
            console.log('Music2 ready state:', this.music2.readyState);
        });

        // 添加加載成功的回調
        this.music1.addEventListener('loadeddata', () => {
            console.log('Music1 loaded successfully');
            console.log('Music1 duration:', this.music1.duration);
        });

        this.music2.addEventListener('loadeddata', () => {
            console.log('Music2 loaded successfully');
            console.log('Music2 duration:', this.music2.duration);
        });

        // 添加可以播放的回調
        this.music1.addEventListener('canplay', () => {
            console.log('Music1 can play');
        });

        this.music2.addEventListener('canplay', () => {
            console.log('Music2 can play');
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
            // 先加載音頻
            await new Promise((resolve, reject) => {
                track.addEventListener('canplaythrough', resolve, { once: true });
                track.addEventListener('error', reject, { once: true });
                track.load();
            });
            
            // 然後播放
            const playPromise = track.play();
            if (playPromise !== undefined) {
                await playPromise;
                console.log('Track started playing successfully');
            }
        } catch (error) {
            console.error('Error playing track:', error);
            if (error.name === 'NotAllowedError') {
                console.log('Attempting to play muted...');
                track.muted = true;
                await track.play();
                this.fadeInVolume(track);
            } else {
                console.error('Playback failed:', error.message);
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