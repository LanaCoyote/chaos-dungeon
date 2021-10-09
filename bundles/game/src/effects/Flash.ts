import { BlendModes, GameObjects } from 'phaser';

export default class Flicker {

    public target: GameObjects.Sprite;

    private active: boolean;
    private stopCb: NodeJS.Timer;

    constructor(target?: GameObjects.Sprite, duration?: number) {
        this.target = target;
        this.active = true;

        if ((window as any).isRunningCanvas) {
            this.target.setBlendMode(BlendModes.MULTIPLY);
        } else {
            this.target.setTintFill(0xdddddd);
        }
        
        this.stopCb = setTimeout(() => this.stop(), duration || 15);
    }

    public stop() {
        if (!this.active) return;

        if ((window as any).isRunningCanvas) {
            this.target.setBlendMode(BlendModes.NORMAL);
        } else {
            this.target.clearTint();
        }

        clearTimeout( this.stopCb );
        this.active = false;
    }

}