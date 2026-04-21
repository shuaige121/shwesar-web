export type PlayerState = 'idle' | 'loading' | 'playing' | 'paused' | 'ended' | 'error';

export const initialPlayerState: PlayerState = 'idle';

export * from './audio-player';
