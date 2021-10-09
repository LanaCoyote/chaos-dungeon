export const EPSILON = 0.0001;

export const TILE_WIDTH = 24;
export const TILE_HEIGHT = 24;

export const SCREEN_ZOOM = 2;
export const SCREEN_WIDTH = 20;
export const SCREEN_WIDTH_ABS = TILE_WIDTH * SCREEN_WIDTH;
export const SCREEN_HEIGHT = 13;
export const SCREEN_HEIGHT_ABS = TILE_HEIGHT * SCREEN_HEIGHT;

export const DEPTH_BURIED = -2 * TILE_HEIGHT;
export const DEPTH_TILE = 0;
export const DEPTH_FLOOR = 2 * TILE_HEIGHT;
export const DEPTH_OVERHEAD = 4 * TILE_HEIGHT;
export const DEPTH_PLATFORM = 6 * TILE_HEIGHT;
export const DEPTH_FLYING = 8 * TILE_HEIGHT;
export const DEPTH_ALWAYSFRONT = 10 * TILE_HEIGHT;

export enum MOVESTATE {
    STOPPING,
    WALKING,
    RUNNING,
    IMPULSE,
    FROZEN
};