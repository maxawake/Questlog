import { createAudioPlayer } from 'expo-audio';

// Short synthesized tones (see questlog repo history for how these were
// generated) played as feedback when a quest is checked off or reopened.
const sources = {
  complete: require('@/assets/sounds/complete.wav'),
  reopen: require('@/assets/sounds/reopen.wav'),
} as const;

/** Plays a short UI tone and releases the player once it finishes. */
export function playTone(name: keyof typeof sources) {
  try {
    const player = createAudioPlayer(sources[name]);
    let released = false;
    const release = () => {
      if (released) return;
      released = true;
      try {
        player.remove();
      } catch {
        // Already released; nothing to do.
      }
    };
    player.addListener('playbackStatusUpdate', (status) => {
      if (status.didJustFinish) release();
    });
    player.play();
    // Safety net in case the platform never reports a finish event.
    setTimeout(release, 2000);
  } catch {
    // Never let audio failures (e.g. unsupported platform) break the UI.
  }
}
