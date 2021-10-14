import LifeController from "./LifeController";
import Actor from "../../objects/actors/Actor";
import Hero from "../../objects/actors/Hero";

import {DAMAGETYPES} from "../damage/constants";

export default class DamageablePlayerController extends LifeController {

    public attached: Hero;

    constructor( attached: Hero ) {
        super( attached, 16 );
        this.repulsionLength = 1000;
    }

}