import { Math as Vector, Scene } from "phaser";

import Equipment from "../../../objects/actors/Equipment";
import ItemData from "./ItemData";

export default class PointerItemData extends ItemData {

    public aimVector: Vector.Vector2;
    public yOffset: number = 0;

    public static getMousePosition( scene: Scene ): Vector.Vector2 {
        const mousePos = new Vector.Vector2( scene.input.activePointer.x, scene.input.activePointer.y );
        const screenPos = new Vector.Vector2( scene.cameras.main.worldView.x, scene.cameras.main.worldView.y );

        return screenPos.add(mousePos);
    }

    public faceTo( equip: Equipment, to: Vector.Vector2, distance: number, angleOffset: number ) {
        this.pointTo( equip, to, distance );
        equip.setAngle( this.aimVector.angle() * ( 180 / Math.PI ) + angleOffset);
    }

    public pointTo( equip: Equipment, to: Vector.Vector2, distance: number ) {
        const userPosition = new Vector.Vector2( equip.user.x, equip.user.y );
        this.aimVector = to.subtract(userPosition);
        const targetPosition = userPosition.add( this.aimVector.setLength( distance ) );
        equip.setPosition(targetPosition.x, targetPosition.y + this.yOffset);

        if (this.aimVector.y > 0 && distance > 8) {
            equip.setDepth( equip.user.depth + 1 );
        } else {
            equip.setDepth( equip.user.depth - 1 );
        }
    }

    public setToAngle( equip: Equipment, angle: number, distance: number ) {
        const userPosition = new Vector.Vector2( equip.user.x, equip.user.y );
        this.aimVector = new Vector.Vector2( Math.cos( angle ), Math.sin( angle ) );
        const targetPosition = userPosition.add( this.aimVector.setLength( distance ) );
        equip.setPosition(targetPosition.x, targetPosition.y + this.yOffset);

        if (this.aimVector.y > 0 && distance > 12) {
            equip.setDepth( equip.user.depth + 1 );
        } else {
            equip.setDepth( equip.user.depth - 1 );
        }
    }

}