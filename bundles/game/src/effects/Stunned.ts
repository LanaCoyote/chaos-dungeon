import { BlendModes, Game, GameObjects } from 'phaser';

export default class Stunned {

    public target: GameObjects.Sprite;
    public overlay: GameObjects.Sprite;

    private active: boolean;
    private stopCb: NodeJS.Timer;

    constructor(target?: GameObjects.Sprite, duration?: number) {
        this.target = target;
        this.active = true;

        const baseAlpha = 0.75;
        const minAlpha = 0.25;

        this.overlay = target.scene.add.sprite( target.x, target.y, target.texture, target.frame.name );
        this.overlay.setOrigin( target.originX, target.originY );
        this.overlay.setDepth( target.depth );
        this.overlay.setAlpha( baseAlpha );

        if ((window as any).isRunningCanvas) {
            this.overlay.setBlendMode(BlendModes.ADD);
        } else {
            this.overlay.setTintFill(0x6666ff);
        }

        let displayTimeLeft = duration;
        (this.overlay as any).preUpdate = (time: number, delta: number) => {
            if (displayTimeLeft > 0) {
                this.overlay.setPosition( target.x, target.y );
                this.overlay.setDepth( target.depth );
                this.overlay.setAlpha( ( displayTimeLeft / duration ) * ( baseAlpha - minAlpha ) + minAlpha );
                this.overlay.displayHeight = this.target.displayHeight;
                this.overlay.displayWidth = this.target.displayWidth;

                displayTimeLeft -= delta;
            }
        }
        
        this.overlay.addToUpdateList();
        this.stopCb = setTimeout(() => this.stop(), duration || 2000);
    }

    public stop() {
        if (!this.active) return;

        this.overlay.destroy();

        // if ((window as any).isRunningCanvas) {
        //     this.target.setBlendMode(BlendModes.NORMAL);
        // } else {
        //     this.target.clearTint();
        // }

        clearTimeout( this.stopCb );
        this.active = false;
    }

}