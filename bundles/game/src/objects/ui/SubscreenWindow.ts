import { GameObjects, Geom, Scene } from "phaser";
import { SCREEN_HEIGHT, SCREEN_HEIGHT_ABS, SCREEN_WIDTH_ABS } from "../../constants";
import UICamera from "./UICamera";



export default class SubscreenWindow extends GameObjects.Rectangle {

    public strokeColor: number;
    public displayArea: Geom.Rectangle;
    public title: string;

    constructor( scene: Scene, camera: UICamera, title: string, strokeColor: number ) {
        const w = SCREEN_WIDTH_ABS * 0.9;
        const h = SCREEN_HEIGHT_ABS * 0.625;

        const bounds = new Geom.Rectangle( camera.worldView.left + w/2, camera.worldView.top + h/2, w, h );
        super( scene, SCREEN_WIDTH_ABS / 2, SCREEN_HEIGHT_ABS * 0.6, w, h, 0, 1 );

        this.setStrokeStyle( 4, strokeColor, 1 );
        // this.setPosition( bounds.left, bounds.right );
    }


}