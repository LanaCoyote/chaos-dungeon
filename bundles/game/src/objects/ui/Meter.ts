import { GameObjects, Geom, Scene } from "phaser";

export default abstract class Meter extends GameObjects.Group {

    public max: number;
    public current: number;

    public width: number;
    public background: GameObjects.TileSprite;
    public foreground: GameObjects.TileSprite;

    constructor( scene: Scene, pos: Geom.Rectangle, max: number, fillFrame: number|string, emptyFrame: number|string ) {       
        const bgSprite = new GameObjects.TileSprite( scene, pos.x, pos.y, pos.width, pos.height, 'ui/icons', emptyFrame );
        const fgSprite = new GameObjects.TileSprite( scene, pos.x, pos.y, pos.width, pos.height, 'ui/icons', fillFrame );

        super( scene, [fgSprite, bgSprite] );

        this.max = max;
        this.current = max;

        this.width = pos.width;
        this.background = bgSprite;
        this.foreground = fgSprite;

        bgSprite.setOrigin(0,0);
        bgSprite.addToDisplayList();
        fgSprite.setOrigin(0,0);
        fgSprite.addToDisplayList();
    }

    public setValue( newValue: number ) {
        this.current = newValue;
        this.foreground.width = ( this.current / this.max ) * this.width;
    }

}