/**
 * Robust audio helper for Thai text-to-speech.
 * Combines browser-native Web Speech API with a high-fidelity Google TTS fallback
 * to guarantee that audio plays perfectly on all devices (iOS, Safari, Android, Chrome).
 */

let activeAudio: HTMLAudioElement | null = null;

export const speakThai = (
  text: string,
  rate: number = 0.8, // 0.8 is ideal for learning clear Thai pronunciation & tones
  onEnd?: () => void
): boolean => {
  if (typeof window === 'undefined') {
    if (onEnd) onEnd();
    return false;
  }

  // Stop any currently playing HTML5 fallback audio
  if (activeAudio) {
    activeAudio.pause();
    activeAudio = null;
  }

  // Define fallback to high-quality Google TTS Stream API
  // This is extremely reliable, sounds gorgeous, and works on all mobiles & Safari frames!
  const playFallbackAudio = () => {
    try {
      const encodedText = encodeURIComponent(text);
      // If we are hosted on a static provider like GitHub Pages (github.io), we use the direct Google TTS URL
      // Otherwise, we use the local /api/tts proxy of our Node/Express server.
      const isStaticGitHubPages = window.location.hostname.includes('github.io');
      const ttsUrl = isStaticGitHubPages
        ? `https://translate.google.com/translate_tts?ie=UTF-8&tl=th&client=tw-ob&q=${encodedText}`
        : `/api/tts?text=${encodedText}`;
      
      const audio = new Audio(ttsUrl);
      activeAudio = audio;
      
      // Adjust playback rate to match user selection
      audio.defaultPlaybackRate = rate;
      audio.playbackRate = rate;

      if (onEnd) {
        audio.onended = () => {
          if (activeAudio === audio) activeAudio = null;
          onEnd();
        };
        audio.onerror = () => {
          if (activeAudio === audio) activeAudio = null;
          onEnd();
        };
      }
      
      audio.play().catch((err) => {
        console.warn('Google TTS HTML5 audio play block:', err);
        // If even HTML5 play fails (due to gesture policy), we execute callback
        if (onEnd) onEnd();
      });
    } catch (e) {
      console.error('Fallback audio error:', e);
      if (onEnd) onEnd();
    }
  };

  // Check Web Speech API support
  if (!('speechSynthesis' in window)) {
    console.log('Web Speech API not supported. Falling back to Google TTS stream.');
    playFallbackAudio();
    return true;
  }

  try {
    // On iOS Safari, the speech queue can get locked. Resume helps unlock it.
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
    
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'th-TH';
    utterance.rate = rate;
    utterance.pitch = 1.0;

    // Retrieve voices
    const voices = window.speechSynthesis.getVoices();
    const thVoice = voices.find(
      (v) => v.lang.startsWith('th') || v.lang.includes('TH')
    );

    // If a Thai voice is found, use it
    if (thVoice) {
      utterance.voice = thVoice;
    }

    let hasPlayed = false;
    
    utterance.onstart = () => {
      hasPlayed = true;
    };

    // Timeout fallback: if the Web Speech API fails to trigger onstart/onend within 250ms
    // (e.g. if the system lacks Thai TTS engine assets), we switch to Google TTS stream immediately.
    const fallbackTimeout = setTimeout(() => {
      if (!hasPlayed) {
        console.log('Web Speech API silent or inactive. Switching to Google TTS fallback.');
        window.speechSynthesis.cancel();
        playFallbackAudio();
      }
    }, 250);

    utterance.onend = () => {
      clearTimeout(fallbackTimeout);
      if (onEnd) onEnd();
    };

    utterance.onerror = (event) => {
      clearTimeout(fallbackTimeout);
      console.warn('Web Speech API error, trying fallback:', event.error);
      if (event.error !== 'interrupted') {
        playFallbackAudio();
      } else if (onEnd) {
        onEnd();
      }
    };

    window.speechSynthesis.speak(utterance);
    
    // Explicitly resume in case of browser-specific bugs (especially Chrome on some devices)
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
    
    return true;
  } catch (err) {
    console.error('Error with Web Speech API:', err);
    playFallbackAudio();
    return true;
  }
};
