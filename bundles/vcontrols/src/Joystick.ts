import { Game, GameObjects, Geom, Input, Scene } from "phaser";

export default class Joystick extends GameObjects.Container {

    private center: Geom.Point;
    private stick: GameObjects.Ellipse;

    private vbinds: {
        up: Input.Keyboard.Key,
        down: Input.Keyboard.Key,
        left: Input.Keyboard.Key,
        right: Input.Keyboard.Key
    };

    constructor( scene: Scene, position: Geom.Point ) {
        const bgYOffset = 50;

        const circleBackground = scene.add.ellipse( 0, bgYOffset, 400, 250, 0, 0 );
        circleBackground.setStrokeStyle( 4, 0xffffff, 1 );

        const circleStick = scene.add.ellipse( 0, 0, 400, 250, 0, 1 );
        circleStick.setStrokeStyle( 4, 0xffffff, 1 );
        circleStick.setInteractive( );

        super( scene, position.x, position.y, [circleBackground, circleStick] )

        this.stick = circleStick;
        this.center = position;

        this.scene.input.setDraggable( this.stick );
        this.scene.input.on( Input.Events.GAMEOBJECT_DRAG, this.onPress, this );
        this.scene.input.on( Input.Events.POINTER_UP, this.onRelease, this );
    }

    public onPress( pointer: Input.Pointer, object: GameObjects.GameObject ) {
        if (object === this.stick) {
            this.stick.setPosition( pointer.x - this.x, pointer.y - this.y );

            const xInput = this.stick.x / 25;
            const yInput = this.stick.y / 25;

            (window as any).virtualControls = {joystick: {x: xInput, y: yInput}};
        }
    }

    public onRelease() {
        this.stick.setPosition( 0, 0 );
        (window as any).virtualControls = {joystick: {x: 0, y: 0}};
    }

}