import { Game, GameObjects, Geom, Math as Vector, Physics, Scene } from "phaser";

import { SCREEN_HEIGHT_ABS, SCREEN_WIDTH_ABS, TILE_HEIGHT, TILE_WIDTH } from "../../constants";
import EnemyData from "../../controllers/ai/enemies/EnemyData";
import Enemy from "../../objects/actors/Enemy";
import Equipment from "../../objects/actors/Equipment";
import Hero from "../../objects/actors/Hero";

const MINIMUM_EXPECTED_WIDTH = SCREEN_WIDTH_ABS;
const MINIMUM_EXPECTED_HEIGHT = SCREEN_HEIGHT_ABS;

export interface EnemyGroup {
    EnemyDataClass: new () => EnemyData;
    Schema?: (data: EnemyData) => EnemyData;

    count: number;
    defeated?: number;
    enemyData?: EnemyData;
    spawnArea?: Geom.Rectangle;
}

export default class Room {

    public rect: Geom.Rectangle;

    private active: Boolean;
    private scene: Scene;
    private key: string;

    private enemyGroups: EnemyGroup[];
    private enemies: GameObjects.Group;
    private enemyColliders: Physics.Arcade.Collider[] = [];

    constructor(scene: Scene, rect: Geom.Rectangle, key: string, enemyGroups: EnemyGroup[]) {
        this.active = false;

        this.scene = scene;
        this.rect = rect;
        this.key = key;

        this.enemyGroups = enemyGroups;

        if (rect.width < MINIMUM_EXPECTED_WIDTH || rect.height < MINIMUM_EXPECTED_HEIGHT) {
            console.error("Creating a room of size (%d x %d) smaller than minimum size (%d x %d)",
                this.rect.width, this.rect.height, MINIMUM_EXPECTED_WIDTH, MINIMUM_EXPECTED_HEIGHT);
        }
    }

    public preload() {
        this.enemies = this.createEnemies();
    }

    public unload() {
        this.enemyColliders.forEach(collider => {
            if (collider && collider.object1 && collider.object2) collider.destroy()
        });

        this.enemyColliders.length = 0;
        this.destroyEnemies();
    }

    public activate() {
        this.active = true;

        if (!this.enemies) this.enemies = this.createEnemies();
        this.spawnEnemies();
    }

    public addEnemyCollider( other: GameObjects.GameObject|GameObjects.GameObject[] ) {
        const collider = this.scene.physics.add.overlap( this.enemies, other );
        this.enemyColliders.push(collider);
    }

    public deactivate() {
        this.active = false;

        this.enemies.getChildren().forEach((enemy: Enemy) => {
            enemy.deactivateAllControllers();
        });
    }

    public isInsideRoom(bounds: Geom.Rectangle): boolean {
        return Geom.Rectangle.ContainsRect(this.rect, bounds);
    }

    public getEnemyGroup(): GameObjects.Group {
        return this.enemies;
    }

    public getExitVector(bounds: Geom.Rectangle): Vector.Vector2 {
        // this logic requires that the rectangles are partially overlapping
        // it would be smarter to use a perimeter point
        if (this.rect.contains(bounds.left, bounds.top)) {
            if (this.rect.contains(bounds.left, bounds.bottom)) {
                return Vector.Vector2.RIGHT;
            } else {
                return Vector.Vector2.DOWN;
            }
        } else {
            if (this.rect.contains(bounds.right, bounds.top)) {
                return Vector.Vector2.LEFT;
            } else {
                return Vector.Vector2.UP;
            }
        }
    }

    public toString(): string {
        return `[Room ${this.key}]`;
    }

    private createEnemies(): GameObjects.Group {
        const enemies: Enemy[] = [];
        const defaultSpawnArea = new Geom.Rectangle(
            this.rect.x + TILE_WIDTH * 3,
            this.rect.y + TILE_HEIGHT * 3,
            this.rect.width - TILE_WIDTH * 6,
            this.rect.height - TILE_HEIGHT * 6
        );

        this.enemyGroups.forEach(enemyGroup => {
            if (!enemyGroup.defeated) enemyGroup.defeated = 0;
            if (!enemyGroup.enemyData) {
                enemyGroup.enemyData = new enemyGroup.EnemyDataClass();

                if (enemyGroup.Schema !== undefined) {
                    enemyGroup.enemyData = enemyGroup.Schema( enemyGroup.enemyData );
                }
            }

            for (let i = enemyGroup.defeated; i < enemyGroup.count; ++i) {
                const spawnPos = defaultSpawnArea.getRandomPoint();
                const enemyActor = new Enemy( this.scene, new Vector.Vector2( spawnPos.x, spawnPos.y ), enemyGroup.enemyData );
                enemies.push( enemyActor );
            }
        });

        return this.scene.add.group(enemies, { classType: Enemy });
    }

    private destroyEnemies() {
        if (!this.enemies || !this.enemies.getLength()) return;

        this.enemies.destroy( true, true );
        delete this.enemies;
    }

    private spawnEnemies() {
        if (!this.enemies || !this.enemies.getLength()) return;

        this.enemies.getChildren().forEach((enemy: Enemy, i: number) => {
            this.scene.time.delayedCall(i, () => {
                enemy.spawn();
                enemy.addToDisplayList();
            });
        });

        this.addEnemyCollider( Hero.activeHero );
        this.addEnemyCollider( Equipment.living );
    }

}