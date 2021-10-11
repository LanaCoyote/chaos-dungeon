import { BlendModes, GameObjects } from 'phaser';

export default class Flicker {

    public target: GameObjects.Sprite;

    private active: boolean;
    private flashTimer: number = 50;
    private flashCb: NodeJS.Timer;
    private stopCb: NodeJS.Timer;
    private mode: boolean;

    constructor(target?: GameObjects.Sprite, duration?: number) {
        this.target = target;
        this.active = true;

        this.flashCb = setInterval(() => this.setNextTint(), this.flashTimer);
        this.stopCb = setTimeout(() => this.stop(), duration || 1000);
        this.setNextTint();
    }

    public setNextTint() {
        if ((window as any).isRunningCanvas) {
            if (this.mode) {
                this.target.setBlendMode(BlendModes.ADD);
            } else {
                this.target.setBlendMode(BlendModes.MULTIPLY);
            }

            this.mode = !this.mode;
        } else {
            const color = Math.random() * 0x00ffff + 0xff0000;
            this.target.setTintFill(color);
        }
    }

    public stop() {
        if (!this.active) return;

        if ((window as any).isRunningCanvas) {
            this.target.setBlendMode(BlendModes.NORMAL);
        } else {
            this.target.clearTint();
        }

        clearInterval( this.flashCb );
        clearTimeout( this.stopCb );
        this.active = false;
    }

}