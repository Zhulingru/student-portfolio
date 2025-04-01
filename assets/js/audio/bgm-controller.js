class BGMController {
    constructor() {
        console.log('Initializing BGMController...');
        
        // 修正路徑處理邏輯
        const isGitHubPages = window.location.hostname.includes('github.io');
        const basePath = isGitHubPages ? 'https://zhulingru.github.io/student-portfolio' : '';
        
        // 使用不帶空格的文件名，並添加時間戳防止快取
        const timestamp = new Date().getTime();
        const audioPath1 = `${basePath}/assets/audio/background_music1.mp3?t=${timestamp}`;
        const audioPath2 = `${basePath}/assets/audio/background_music2.mp3?t=${timestamp}`;
        
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
            audio.muted = false; // 不要初始靜音
        });
        
        // 設置音源
        this.music1.src = audioPath1;
        this.music2.src = audioPath2;
        
        // 初始化其他屬性
        this.currentTrack = null;
        this.fadeOutDuration = 3000;
        this.waitDuration = 3000;
        this.isPlaying = false;
        this.hasInteracted = false;
        
        // 設置事件監聽器
        this.setupEventListeners();
        
        // 在所有可能的用戶交互事件上嘗試播放
        this.setupPlayTriggers();
    }

    setupEventListeners() {
        // 添加錯誤處理
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

        // 加載成功回調
        this.music1.addEventListener('loadeddata', () => {
            console.log('Music1 loaded successfully');
            console.log('Music1 duration:', this.music1.duration);
        });

        this.music2.addEventListener('loadeddata', () => {
            console.log('Music2 loaded successfully');
            console.log('Music2 duration:', this.music2.duration);
        });

        // 設置循環播放
        this.music1.addEventListener('ended', () => this.handleTrackEnd());
        this.music2.addEventListener('ended', () => this.handleTrackEnd());
    }

    setupPlayTriggers() {
        const startPlayback = async () => {
            if (this.hasInteracted) return;
            this.hasInteracted = true;
            
            try {
                // 先設置較低的音量
                this.music1.volume = 0.1;
                await this.music1.play();
                this.currentTrack = this.music1;
                this.isPlaying = true;
                
                // 逐漸增加音量
                this.fadeInVolume(this.music1);
                
                // 移除所有事件監聽器
                ['click', 'touchstart', 'keydown', 'scroll', 'mousemove'].forEach(event => {
                    document.removeEventListener(event, startPlayback);
                });
                
                console.log('Music started successfully');
            } catch (error) {
                console.error('Failed to start playback:', error);
            }
        };

        // 添加所有可能的交互事件監聽器
        ['click', 'touchstart', 'keydown', 'scroll', 'mousemove'].forEach(event => {
            document.addEventListener(event, startPlayback, { once: true });
        });

        // 也在 DOMContentLoaded 時嘗試播放
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', startPlayback, { once: true });
        } else {
            startPlayback();
        }
    }

    fadeInVolume(track) {
        let volume = 0;
        const fadeInterval = setInterval(() => {
            if (volume < 1) {
                volume = Math.min(volume + 0.1, 1);
                if (!track.muted) {
                    track.volume = volume;
                }
            } else {
                clearInterval(fadeInterval);
            }
        }, 200);
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