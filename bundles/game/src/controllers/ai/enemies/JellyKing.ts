
import Jelly from "./Jelly";

export default class JellyKing extends Jelly {

    public texture = "enemy/jelly_king";

    timeBeforeJump: number = 300;     // how long to wait before jumping when deciding to jump
    jumpHeight: number = 96;         // how high the enemy jumps, in pixels
    jumpDistance: number = 144;       // how far the enemy jumps, in pixels
    jumpDuration: number = 1500;       // how long the enemy jumps for
    searchDistance: number = 120;     // how far away the enemy will pursue the player from
    aggression: number = 0.75;         // 0-1, how likely they are to jump at the player if they're within search distance
    shortHopDistance: number = 0;   // how far the enemy will attempt to "short hop" at the player. set to 0 to disable
    sleepChance: number = 0.25;        // 0-1, how likely they are to do nothing instead of jumping
    canLandOnWalls: boolean = false;

    squishHeight = 32;
    stretchHeight = 48;

} 