class BGMController {
    constructor() {
        console.log('Initializing BGMController...');
        
        // 修正路徑處理邏輯
        const isGitHubPages = window.location.pathname.includes('student-portfolio');
        const basePath = isGitHubPages ? '/student-portfolio' : '';
        
        // 使用不帶空格的文件名
        const audioPath1 = `${basePath}/assets/audio/background_music1.mp3`;
        const audioPath2 = `${basePath}/assets/audio/background_music2.mp3`;
        
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
        this.isPlaying = false;
        
        // 設置事件監聽器
        this.setupEventListeners();
    }

    setupEventListeners() {
        // 錯誤處理
        [this.music1, this.music2].forEach((audio, index) => {
            audio.addEventListener('error', (e) => {
                console.error(`Error loading music${index + 1}:`, e);
                console.error(`Music${index + 1} error details:`, audio.error);
                console.log(`Music${index + 1} source:`, audio.src);
            });

            audio.addEventListener('loadeddata', () => {
                console.log(`Music${index + 1} loaded successfully`);
                console.log(`Music${index + 1} duration:`, audio.duration);
            });
        });

        // 設置循環播放
        this.music1.addEventListener('ended', () => this.handleTrackEnd());
        this.music2.addEventListener('ended', () => this.handleTrackEnd());
    }

    async startPlayback() {
        if (this.isPlaying) return;
        
        try {
            // 確保音樂從頭開始播放
            this.music1.currentTime = 0;
            // 先設置較低的音量
            this.music1.volume = 0.1;
            await this.music1.play();
            this.currentTrack = this.music1;
            this.isPlaying = true;
            
            // 逐漸增加音量
            this.fadeInVolume(this.music1);
            
            console.log('Music started successfully');
        } catch (error) {
            console.error('Failed to start playback:', error);
            this.isPlaying = false; // 確保在錯誤時重置狀態
            throw error;
        }
    }

    fadeInVolume(track) {
        let volume = track.volume;
        const fadeInterval = setInterval(() => {
            if (volume < 1) {
                volume = Math.min(volume + 0.1, 1);
                track.volume = volume;
            } else {
                clearInterval(fadeInterval);
            }
        }, 200);
    }

    async handleTrackEnd() {
        console.log('Track ended, switching to next track');
        const nextTrack = this.currentTrack === this.music1 ? this.music2 : this.music1;
        
        try {
            // 準備下一個音軌
            nextTrack.currentTime = 0;
            nextTrack.volume = 0;
            
            // 開始播放下一個音軌
            await nextTrack.play();
            this.currentTrack = nextTrack;
            this.fadeInVolume(nextTrack);
            
            console.log('Successfully switched to next track');
        } catch (error) {
            console.error('Error switching tracks:', error);
            this.isPlaying = false; // 確保在錯誤時重置狀態
        }
    }

    async stopPlayback() {
        try {
            // 停止當前播放
            if (this.currentTrack) {
                await this.currentTrack.pause();
                this.currentTrack.currentTime = 0;
            }
            // 停止所有音樂並重置
            this.music1.pause();
            this.music2.pause();
            this.music1.currentTime = 0;
            this.music2.currentTime = 0;
            this.isPlaying = false;
            this.currentTrack = null;
        } catch (error) {
            console.error('Error stopping audio:', error);
            throw error;
        }
    }
} 