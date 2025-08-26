/**
 * Audio Mini-Player Component
 * 
 * Features:
 * - Resume position persistence
 * - Playback rate persistence 
 * - Media Session API integration for OS-level controls
 * - Show/hide functionality
 * - Responsive design
 * 
 * Usage:
 * Include this script after the DOM is loaded, or call setupAudioPlayer() manually
 * Requires HTML structure with IDs: 'narration', 'audioClose', 'audioReopen', 'audioReopenBtn'
 */

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    setupAudioPlayer();
});

/**
 * Initialize the audio player with all enhancements
 */
function setupAudioPlayer() {
    const audio = document.getElementById('narration');
    if (!audio) return;
    
    // Storage keys for persistence
    const STORAGE_KEY_TIME = 'tm:narration:time:v1';
    const STORAGE_KEY_RATE = 'tm:narration:rate:v2';
    const STORAGE_KEY_HIDDEN = 'tm:narration:hidden:v1';

    // Restore last position
    const savedTime = parseFloat(localStorage.getItem(STORAGE_KEY_TIME) || '0');
    if (!Number.isNaN(savedTime) && savedTime > 0) {
        audio.currentTime = savedTime;
    }

    // Restore playback rate
    const savedRate = parseFloat(localStorage.getItem(STORAGE_KEY_RATE) || '1');
    if (!Number.isNaN(savedRate) && savedRate > 0) {
        audio.playbackRate = savedRate;
    }

    // Persist position periodically
    audio.addEventListener('timeupdate', () => {
        if (Number.isFinite(audio.currentTime)) {
            localStorage.setItem(STORAGE_KEY_TIME, String(audio.currentTime));
        }
    });

    // Clear saved position when finished
    audio.addEventListener('ended', () => {
        localStorage.removeItem(STORAGE_KEY_TIME);
    });

    // Dismiss / Reopen handling
    const bar = document.querySelector('.audio-player');
    const reopen = document.getElementById('audioReopen');
    const reopenBtn = document.getElementById('audioReopenBtn');
    const closeBtn = document.getElementById('audioClose');

    function setBarVisible(visible) {
        if (!bar || !reopen) return;
        
        const container = document.querySelector('.container');
        if (visible) {
            bar.style.display = 'flex';
            reopen.style.display = 'none';
            if (container) {
                container.style.paddingBottom = 'calc(var(--audio-bar-height) + 12px)';
                document.body.classList.add('audiobar-active');
            }
            localStorage.setItem(STORAGE_KEY_HIDDEN, '0');
        } else {
            bar.style.display = 'none';
            reopen.style.display = 'block';
            if (container) {
                container.style.paddingBottom = '16px';
                document.body.classList.remove('audiobar-active');
            }
            localStorage.setItem(STORAGE_KEY_HIDDEN, '1');
        }
    }

    if (closeBtn) closeBtn.addEventListener('click', () => setBarVisible(false));
    if (reopenBtn) reopenBtn.addEventListener('click', () => setBarVisible(true));

    // Restore hidden state
    // Default hidden unless user has explicitly shown before
    const hiddenStored = localStorage.getItem(STORAGE_KEY_HIDDEN);
    const hidden = hiddenStored === null ? true : hiddenStored === '1';
    setBarVisible(!hidden);

    // Media Session API for OS-level controls
    if ('mediaSession' in navigator) {
        try {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: 'Two Minds | Recovered Correspondence',
                artist: 'Narration',
                album: 'Two Minds',
                artwork: [
                    { src: 'favicon.png', sizes: '256x256', type: 'image/png' }
                ]
            });

            navigator.mediaSession.setActionHandler('play', () => audio.play());
            navigator.mediaSession.setActionHandler('pause', () => audio.pause());
            navigator.mediaSession.setActionHandler('seekbackward', (details) => {
                const offset = (details && details.seekOffset) || 10;
                audio.currentTime = Math.max(0, audio.currentTime - offset);
            });
            navigator.mediaSession.setActionHandler('seekforward', (details) => {
                const offset = (details && details.seekOffset) || 10;
                const duration = Number.isFinite(audio.duration) ? audio.duration : Infinity;
                audio.currentTime = Math.min(duration, audio.currentTime + offset);
            });
            navigator.mediaSession.setActionHandler('seekto', (details) => {
                if (details && typeof details.seekTime === 'number') {
                    audio.currentTime = details.seekTime;
                }
            });
        } catch (e) {
            // Ignore Media Session errors silently
        }
    }
}

/**
 * Manual controls for the audiobar (useful for external scripts)
 */
window.AudioBar = {
    show: () => {
        const event = new CustomEvent('audiobar:show');
        document.dispatchEvent(event);
        const reopenBtn = document.getElementById('audioReopenBtn');
        if (reopenBtn) reopenBtn.click();
    },
    
    hide: () => {
        const event = new CustomEvent('audiobar:hide');
        document.dispatchEvent(event);
        const closeBtn = document.getElementById('audioClose');
        if (closeBtn) closeBtn.click();
    },
    
    toggle: () => {
        const bar = document.querySelector('.audio-player');
        const isVisible = bar && bar.style.display === 'flex';
        if (isVisible) {
            window.AudioBar.hide();
        } else {
            window.AudioBar.show();
        }
    }
};
