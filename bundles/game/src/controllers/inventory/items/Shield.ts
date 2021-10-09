import PointerItemData from "./PointerItemData";
import { EVENTS, ITEMCLASS } from "../constants";
import Equipment from "../../../objects/actors/Equipment";
import { EVENTS as MOVEMENT_EVENTS } from "../../physics/MovementController";

export default class Shield extends PointerItemData {

    public class = ITEMCLASS.SHIELD;
    public texture = "item/shield";
    public parryTime = 0;
    public shoveDistance = 12;

    public yOffset = 4;

    public canUseAnotherItem( equip: Equipment ) {
        if ( equip.holding ) {
            return false;
        } else if ( this.parryTime > 0 ) {
            return false;
        } else {
            return true;
        }
    }

    public putAway( equip: Equipment ) {
        equip.setVisible( false );
        equip.user.emit( MOVEMENT_EVENTS.UNSLOW );
    }

    public onShoot( equip: Equipment ) {
        this.parryTime = 200;
        equip.setVisible( true );
        equip.user.emit( MOVEMENT_EVENTS.SLOW, 48 );

        equip.scene.tweens.add({
            targets: this,
            shoveDistance: 16,
            duration: 50,
            ease: "Bounce",
            yoyo: true
        });
    }

    public onUpdate( equip: Equipment, delta: number ) {
        if ( equip.holding || this.parryTime > 0 ) {
            this.pointTo( equip, PointerItemData.getMousePosition( equip.scene ), this.shoveDistance );
        } else if ( equip.visible ) {
            this.putAway( equip );
        }

        if (this.parryTime > 0) {
            this.parryTime -= delta;
        }
    }

}