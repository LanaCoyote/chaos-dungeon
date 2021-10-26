export const EPSILON = 0.0001;

export const TILE_WIDTH = 24;
export const TILE_HEIGHT = 24;

export const SCREEN_ZOOM = 2;
export const SCREEN_WIDTH = 21;
export const SCREEN_WIDTH_ABS = TILE_WIDTH * SCREEN_WIDTH;
export const SCREEN_HEIGHT = 15;
export const SCREEN_HEIGHT_ABS = TILE_HEIGHT * SCREEN_HEIGHT;

export const DEPTH_BURIED = -2 * TILE_HEIGHT;
export const DEPTH_TILE = 0;
export const DEPTH_FLOOR = 2 * TILE_HEIGHT;
export const DEPTH_OVERHEAD = 4 * TILE_HEIGHT;
export const DEPTH_PLATFORM = 6 * TILE_HEIGHT;
export const DEPTH_FLYING = 8 * TILE_HEIGHT;
export const DEPTH_ALWAYSFRONT = 10 * TILE_HEIGHT;

export const LAYER_LOWER = "LOWER";
export const LAYER_FLOOR = 0;
export const LAYER_OBSTACLE = "OBSTACLE";
export const LAYER_WATER = "WATER";
export const LAYER_OVERHEAD = "OVERHEAD";

export enum MOVESTATE {
    STOPPING,
    WALKING,
    RUNNING,
    IMPULSE,
    FROZEN
};

export const IMPORTANT_TILES = {
    WALL: [-1,20,21,22,23,24,25,26,27,30,31,32,33,34,35,36,37,40,41,42,43,44,45,46,47,48,49,52,53,54,55,56,57,58,59,60,61,64,65,66,67,68,69,70,71,
            72,73,74,75,76,77,78,79,80,81,82,83,100,101,102],
    OBSTACLE: [10,11,12],
    LOWER_WALL: [84,85,86,87,88,89,90,91],
    OVERHEAD: [26,28,30,36,38,40,49,51,53,61,63,65],
    STAIRCASE: [2,3],
};