import * as Phaser from "phaser";

import Joystick from "./Joystick";

class VirtualControlScene extends Phaser.Scene {

    public preload() {

    }

    public create() {
        const joystick = new Joystick( this, new Phaser.Geom.Point( 300, 250 ) );
        joystick.addToDisplayList();
    }

}

window.addEventListener("load", () => {
    console.log("loaded vcontrols bundle");
    let VirtualControls = new Phaser.Game({
        scale: {
            width: "100%",
            height: "100%",
            mode: Phaser.Scale.RESIZE,
            zoom: Phaser.Scale.NO_ZOOM,
        },
    
        parent: "virtual-controls",
        type: Phaser.CANVAS,
        scene: VirtualControlScene
    });
});