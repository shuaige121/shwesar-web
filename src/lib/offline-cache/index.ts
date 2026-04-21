export type OfflineStatus = 'unknown' | 'available' | 'downloading' | 'ready' | 'failed';

export const initialOfflineStatus: OfflineStatus = 'unknown';

export * from './db';
export { seedFromStatic, seedAudioFromStatic } from './seed';
