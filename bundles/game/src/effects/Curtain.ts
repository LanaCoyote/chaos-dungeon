import { Cameras, GameObjects, Math as Vector, Scene } from "phaser";

import { SCREEN_WIDTH_ABS } from "../constants";
import Actor from "../objects/actors/Actor";

// the fade effect that plays when the player voids out and resets the room
// starts the fade process immediately when created, but the fade in will only be
// triggered when the "fadeIn" method is called.
// make sure you call this method or the player will be stuck in darkness forever!!! 
export default class Curtain {

    public isFadingOut: boolean;
    public isFadingIn: boolean;

    public scene: Scene;
    public camera: Cameras.Scene2D.Camera;
    public circle: GameObjects.Graphics;
    public target: Actor;

    private apeture: number = 1;
    private duration: number;

    constructor( scene: Scene, center: Actor, camera?: Cameras.Scene2D.Camera, duration?: number, start?: boolean ) {

        this.isFadingOut = true;
        this.isFadingIn = false;

        this.scene = scene;
        this.camera = camera || scene.cameras.main;
        this.target = center;
        this.duration = duration || 1000;

        this.circle = this.scene.make.graphics({});
        this.circle.fillStyle(0xffffff);
        this.circle.fillRect(0,0,SCREEN_WIDTH_ABS,SCREEN_WIDTH_ABS);

        const mask = this.circle.createGeometryMask();
        this.camera.setMask( mask );
        if (start) {
            this.fadeOut();
        }

    }

    public fadeOut() {
        this.apeture = 1;
        this.scene.tweens.add({
            targets: this,
            apeture: 0,
            duration: this.duration,
            ease: 'Sine',
            onUpdate: () => this.updateMask( this.target.x - this.camera.worldView.x, this.target.y - this.camera.worldView.y, SCREEN_WIDTH_ABS * this.apeture, true ),
        });
    }

    public fadeIn() {
        this.circle.clear();
        this.apeture = 0;
        setTimeout( () => {
            this.scene.tweens.add({
                targets: this,
                apeture: 1,
                duration: this.duration,
                ease: 'Sine',
                onUpdate: () => this.updateMask( this.target.x - this.camera.worldView.x, this.target.y - this.camera.worldView.y, SCREEN_WIDTH_ABS * this.apeture, true ),
            })
        }, 100); // small delay
    }

    private updateMask( centerX: number, centerY: number, radius: number, blit: boolean ) {
        if (blit) {
            this.circle.clear();
        }

        // circle wipe
        this.circle.fillCircle( centerX, centerY, radius );
        
        // triangle wipe
        // const triangleLeg = new Vector.Vector2( 0, radius * -1 );
        // triangleLeg.rotate( this.apeture * Math.PI * 2 );
        // const point1 = triangleLeg.clone();
        // triangleLeg.rotate( Math.PI * (2 / 3) );
        // const point2 = triangleLeg.clone();
        // triangleLeg.rotate( Math.PI * (2 / 3) );
        // const point3 = triangleLeg.clone();
        // this.circle.fillTriangle( centerX + point1.x, centerY + point1.y, centerX + point2.x, centerY + point2.y, centerX + point3.x, centerY + point3.y);

        // star wipe
        // for (let i = 0; i < 5; ++i) {
        //     const starVector = new Vector.Vector2( 0, radius * -0.9 );
        //     starVector.rotate( i * (Math.PI * 2 / 5) + ( this.apeture * Math.PI * 4 ) );
        //     const point1 = starVector.clone();
        //     point1.setLength( 2 * radius );
        //     starVector.rotate( Math.PI * (2/3) );
        //     const point2 = starVector.clone();
        //     starVector.rotate( Math.PI * (2/3) );
        //     const point3 = starVector.clone();
        //     this.circle.fillTriangle( centerX + point1.x, centerY + point1.y, centerX + point2.x, centerY + point2.y, centerX + point3.x, centerY + point3.y);
        // }

        // whoa!!!
        // for (let i = 0; i < 5; ++i) {
        //     const starVector = new Vector.Vector2( 0, radius * -1 );
        //     starVector.rotate( i * (Math.PI * 2 / 5) );
        //     const point1 = starVector.clone();
        //     point1.setLength( 2 );
        //     starVector.rotate( Math.PI * (2/3) );
        //     const point2 = starVector.clone();
        //     starVector.rotate( Math.PI * (2/3) );
        //     const point3 = starVector.clone();
        //     this.circle.fillTriangle( centerX + point1.x, centerY + point1.y, centerX + point2.x, centerY + point2.y, centerX + point3.x, centerY + point3.y);
        // }
    }

}