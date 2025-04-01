class BGMController {
    constructor() {
        this.music1 = new Audio('/assets/audio/background music1.mp3');
        this.music2 = new Audio('/assets/audio/background music2.mp3');
        this.currentTrack = null;
        this.fadeOutDuration = 3000; // 3秒淡出
        this.waitDuration = 3000; // 3秒等待
        this.isPlaying = false;

        // 設置循環播放
        this.music1.addEventListener('ended', () => this.handleTrackEnd());
        this.music2.addEventListener('ended', () => this.handleTrackEnd());

        // 設置音量
        this.music1.volume = 1;
        this.music2.volume = 1;
    }

    async start() {
        if (this.isPlaying) return;
        this.isPlaying = true;
        this.currentTrack = this.music1;
        await this.playTrack(this.music1);
    }

    async handleTrackEnd() {
        const nextTrack = this.currentTrack === this.music1 ? this.music2 : this.music1;
        await this.fadeOut(this.currentTrack);
        await this.wait(this.waitDuration);
        this.currentTrack = nextTrack;
        await this.playTrack(nextTrack);
    }

    async playTrack(track) {
        track.currentTime = 0;
        track.volume = 1;
        try {
            await track.play();
        } catch (error) {
            console.error('Error playing audio:', error);
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