import { GameObjects } from "phaser";

import { DEPTH_ALWAYSFRONT, DEPTH_OVERHEAD } from "../constants";

export default class SpawnCloud {

    private sprites: GameObjects.Sprite[];

    constructor(target: GameObjects.Sprite, callback?: () => any, showSkull?: boolean) {
        const scene = target.scene;

        const pos = target.getCenter();
        this.sprites = [
            new GameObjects.Sprite(target.scene, pos.x, pos.y, 'vfx/dustcloud', 0),
            new GameObjects.Sprite(target.scene, pos.x, pos.y, 'vfx/dustcloud', 4),
            new GameObjects.Sprite(target.scene, pos.x, pos.y, 'vfx/dustcloud', 3),
            new GameObjects.Sprite(target.scene, pos.x, pos.y, 'vfx/dustcloud', 3)
        ];

        this.sprites.forEach(spr => {
            spr.addToDisplayList();
            spr.setVisible( false );
            spr.setDepth( DEPTH_OVERHEAD + pos.y );
        });

        this.sprites[0].setVisible( true );
        if (showSkull) this.sprites[1].setVisible( true );

        scene.time.delayedCall(70, () => {
            this.sprites[0].setFrame(1);
            scene.time.delayedCall(70, () => {
                this.sprites[0].setFrame(2).setY(pos.y + 12);
                this.sprites[1].setFrame(2).setVisible(true).setFlipX(true).setY(pos.y + 12);
                this.sprites[2].setVisible(true);
                this.sprites[3].setVisible(true).setFlipX(true);

                if (callback) callback();

                scene.tweens.add({
                    targets: this.sprites[0],
                    x: pos.x - 24,
                    duration: 250,
                    ease: 'Quad'
                });

                scene.tweens.add({
                    targets: this.sprites[1],
                    x: pos.x + 24,
                    duration: 250,
                    ease: 'Quad'
                });

                scene.tweens.add({
                    targets: this.sprites[2],
                    x: pos.x - 24,
                    y: pos.y - 24,
                    duration: 250,
                    ease: 'Quad'
                });

                scene.tweens.add({
                    targets: this.sprites[3],
                    x: pos.x + 24,
                    y: pos.y - 24,
                    duration: 250,
                    ease: 'Quad',
                    onComplete: () => {
                        this.sprites.forEach(spr => spr.destroy());
                    }
                });
            });
        });

    }

}