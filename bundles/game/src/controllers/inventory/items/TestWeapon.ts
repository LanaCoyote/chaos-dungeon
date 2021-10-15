import { Physics } from "phaser";
import { DEPTH_ALWAYSFRONT } from "../../../constants";
import Equipment from "../../../objects/actors/Equipment";
import { ITEMCLASS } from "../constants";
import Sword from "./Sword";


export default class TestWeapon extends Sword {

    class = ITEMCLASS.FIRE_ARROW;
    texture = "item/joint";
    maxSlashDistance = 14;
    useAngledIcon = false;

    public startPowerAttack( equip: Equipment ) {

        this.powerAttacking = true;

        for (let i = 0; i < 250; ++i) {
            equip.scene.time.delayedCall(i * 5, () => {
                const color = Math.random() * 0x006666 + 0xff9999;
                const randomAngle = equip.angle + 15 - Math.random() * 30;
                
                const smoke = equip.scene.add.circle( equip.user.x, equip.user.y, Math.random() * 6, 0xffffff, 0.75);
                smoke.setDepth( DEPTH_ALWAYSFRONT + equip.user.y );
                equip.scene.physics.add.existing( smoke );
                (smoke.body as Physics.Arcade.Body).setVelocity( Math.sin( randomAngle * Math.PI / 180 ) * 150, -Math.cos( randomAngle * Math.PI / 180 ) * 150);
                equip.scene.tweens.add({
                    targets: smoke,
                    alpha: 0,
                    displayWidth: 24,
                    displayHeight: 24,
                    duration: 1000,
                    onComplete: () => smoke.destroy()
                });
            });
        }

        equip.scene.time.delayedCall(1250, ()=>this.donePowerAttak(equip));
        equip.setPosition(equip.user.x, equip.y);
        equip.setVisible(false);

    }

}