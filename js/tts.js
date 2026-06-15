/**
 * HSK Spark 2.0 - Text to Speech Engine
 */
const HSKTTS = {
    voice: null,

    init: function() {
        if (!('speechSynthesis' in window)) {
            console.warn("Speech Synthesis is not supported in this browser.");
            return;
        }

        // Try to load Chinese voice
        const loadVoices = () => {
            const voices = window.speechSynthesis.getVoices();
            // Look for Mandarin voice (zh-CN, zh-TW, zh-HK)
            this.voice = voices.find(v => v.lang.startsWith('zh-CN')) || 
                         voices.find(v => v.lang.startsWith('zh')) || 
                         voices.find(v => v.lang.includes('Mandarin'));
        };

        loadVoices();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }
    },

    /**
     * Speak Chinese text aloud
     * @param {string} text 
     * @param {Function} onEnd Callback when speech completes or fails
     */
    speak: function(text, onEnd = null) {
        // Fallback helper to guarantee onEnd is called exactly once
        let callbackFired = false;
        const triggerCallback = () => {
            if (onEnd && !callbackFired) {
                callbackFired = true;
                try {
                    onEnd();
                } catch (e) {
                    console.error("Error in HSKTTS speak callback:", e);
                }
            }
        };

        if (!('speechSynthesis' in window)) {
            triggerCallback();
            return;
        }

        // Cancel current speaking
        try {
            window.speechSynthesis.cancel();
        } catch (e) {
            console.warn("Error calling speechSynthesis.cancel:", e);
        }

        if (!text || typeof text !== 'string') {
            triggerCallback();
            return;
        }

        // Remove pinyin bracket helpers before reading
        const cleanText = text.replace(/\[.*?\]/g, '').replace(/[a-zA-Z]/g, '').trim();
        if (!cleanText) {
            triggerCallback();
            return;
        }

        try {
            const utterance = new SpeechSynthesisUtterance(cleanText);
            
            if (this.voice) {
                utterance.voice = this.voice;
            } else {
                utterance.lang = 'zh-CN';
            }
            
            utterance.rate = 0.85; // Speak slightly slower for educational purposes
            utterance.pitch = 1.0;

            let safetyTimer = null;
            const clearSafetyTimer = () => {
                if (safetyTimer) {
                    clearTimeout(safetyTimer);
                    safetyTimer = null;
                }
            };

            const handleSpeechEnd = () => {
                clearSafetyTimer();
                triggerCallback();
            };

            utterance.onend = handleSpeechEnd;
            utterance.onerror = (e) => {
                console.warn("SpeechSynthesisUtterance error encountered:", e);
                handleSpeechEnd();
            };

            // Safety timeout: Chinese is typically read at ~2-3 characters per second.
            // We set the safety threshold to 350ms per character plus a generous 2.5s buffer.
            const safetyDuration = Math.max(2500, (cleanText.length * 350) + 2500);

            safetyTimer = setTimeout(() => {
                console.warn(`SpeechSynthesis safety timeout fired after ${safetyDuration}ms for text: ${cleanText}`);
                try {
                    window.speechSynthesis.cancel();
                } catch (e) {}
                handleSpeechEnd();
            }, safetyDuration);

            window.speechSynthesis.speak(utterance);
        } catch (err) {
            console.error("Critical error in window.speechSynthesis.speak:", err);
            triggerCallback();
        }
    }
};

// Initialize right away
HSKTTS.init();
window.HSKTTS = HSKTTS;

