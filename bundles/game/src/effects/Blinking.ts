import { BlendModes, GameObjects } from 'phaser';

export default class Blink {

    public target: GameObjects.Sprite;

    public active: boolean;
    private blinking: boolean;
    private stopCb: NodeJS.Timer;
    private blinkCb: NodeJS.Timer;

    constructor(target?: GameObjects.Sprite, duration?: number, time?: number) {
        this.target = target;
        this.active = true;

        if (duration !== 0) this.stopCb = setTimeout(() => this.stop(), duration || 1000);
        this.blinkCb = setInterval(() => this.blink(), time || 50);
    }

    public blink() {
        this.blinking = !this.blinking;
        if ((window as any).isRunningCanvas) {
            this.target.setBlendMode(this.blinking ? BlendModes.ADD : BlendModes.NORMAL);
        } else {
            if (this.blinking) this.target.setTintFill(0xdddddd);
            else this.target.clearTint();
        }

        if (this.blinking) setTimeout(() => this.blink(), 25);
    }

    public stop() {
        if (!this.active) return;

        if ((window as any).isRunningCanvas) {
            this.target.setBlendMode(BlendModes.NORMAL);
        } else {
            this.target.clearTint();
        }

        clearTimeout( this.stopCb );
        clearInterval( this.blinkCb );
        this.active = false;
    }

}