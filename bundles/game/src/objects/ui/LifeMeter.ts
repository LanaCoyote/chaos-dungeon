import { GameObjects, Geom, Scene } from "phaser";

import Meter from "./Meter";

export default class LifeMeter extends Meter {

    constructor( scene: Scene, pos: Geom.Rectangle ) {
        super( scene, pos, 16, 0, 1 );
        this.setValue( 16 );
    }

}