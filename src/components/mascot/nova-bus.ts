/**
 * A 20-line event bus between the chat panel and every Nova canvas on the
 * page (the companion in its dock and the small stage in the chat header).
 *
 * React props can't do this: the canvases live behind a dynamic import and in
 * two separate subtrees, and per-stream-delta traffic would re-render both
 * parents on every token. Cues and voice energy are fire-and-forget pulses,
 * so an outside-React channel is the honest shape. Message CONTENT never
 * travels here — only reaction kinds and a 0..1 energy number.
 */

import type { MascotCue } from "./character";

export type { MascotCue };

type CueListener = (cue: MascotCue) => void;
type VoiceListener = (energy: number) => void;

const cueListeners = new Set<CueListener>();
const voiceListeners = new Set<VoiceListener>();

export function emitCue(cue: MascotCue) {
  for (const listener of cueListeners) listener(cue);
}

/** One pulse per stream delta; canvases collapse bursts to the latest value. */
export function emitVoice(energy: number) {
  for (const listener of voiceListeners) listener(energy);
}

export function onCue(listener: CueListener) {
  cueListeners.add(listener);
  return () => cueListeners.delete(listener);
}

export function onVoice(listener: VoiceListener) {
  voiceListeners.add(listener);
  return () => voiceListeners.delete(listener);
}
