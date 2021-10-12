import { Cameras, GameObjects } from "phaser";

import { SCREEN_WIDTH_ABS, SCREEN_HEIGHT_ABS } from "../../constants";

export default class UICamera extends Cameras.Scene2D.Camera {

    public static main: UICamera;

    constructor( ignored?: GameObjects.GameObject[] ) {
        super( 0, 0, SCREEN_WIDTH_ABS, SCREEN_HEIGHT_ABS );

        UICamera.main = this;
        if (ignored) this.ignore( ignored );
    }

}