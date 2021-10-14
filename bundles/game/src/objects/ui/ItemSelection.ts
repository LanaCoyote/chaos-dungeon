import { GameObjects, Scene } from "phaser";


export default class ItemSelection extends GameObjects.Sprite {

    constructor( scene: Scene ) {
        super( scene, 0, 0, "ui/selection" );
    }

}