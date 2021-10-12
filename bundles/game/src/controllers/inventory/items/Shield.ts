import PointerItemData from "./PointerItemData";
import { WeaponData } from "./ItemData"
import { EVENTS, ITEMCLASS } from "../constants";
import Actor from "../../../objects/actors/Actor";
import Equipment from "../../../objects/actors/Equipment";
import { EVENTS as MOVEMENT_EVENTS } from "../../physics/MovementController";
import { DAMAGETYPES } from "../../damage/constants";
import Flash from "../../../effects/Flash";

export default class Shield extends PointerItemData implements WeaponData {

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

    public getDamage( equip: Equipment ): number {
        return 1;
    }

    public getDamageType( equip: Equipment ): DAMAGETYPES {
        if (this.parryTime <= 0) return DAMAGETYPES.NONE;

        this.parried( equip );
        return DAMAGETYPES.STUN;
    }

    public putAway( equip: Equipment ) {
        equip.setVisible( false );
        equip.user.emit( MOVEMENT_EVENTS.UNSLOW );
    }

    public onDamage( equip: Equipment, other: Actor ) {
        
    }

    public onShoot( equip: Equipment ) {
        this.parryTime = 200;
        equip.setVisible( true );
        equip.user.emit( MOVEMENT_EVENTS.SLOW, 48 );

        equip.scene.tweens.add({
            targets: this,
            shoveDistance: 16,
            duration: 50,
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

    public parried( equip: Equipment ) {
        new Flash( equip, 100 );
        new Flash( equip.user, 100 );
    }

}