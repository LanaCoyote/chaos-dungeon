export const EVENTS = {
    // Item Events
    // Items are stored in the inventory
    ADD_ITEM: Symbol("[Event AddItem]"),        // Try to add an item to the inventory (class, itemdata)
    USE_ITEM: Symbol("[Event UseItem]"),        // Called when an item is "used up" (class)
    DROP_ITEM: Symbol("[Event DropItem]"),      // Try to throw an item out of the inventory (class)
    DESTROY_ITEM: Symbol("[Event DestroyItem]"),// Forcibly remove an item from the inventory (class)
    EQUIP_ITEM: Symbol("[Event EquipItem]"),    // Try to equip an item from the inventory (class, slot)

    // Resource Events
    // Resources add to and take from a pool, like arrows or coins
    ADD_RESOURCE: Symbol("[Event AddResource]"),    // Try to add a resource to the pool (type, amount)
    SUB_RESOURCE: Symbol("[Event SubResource]"),  // Try to subtract from a pool (type, amount)

    // Control Events
    // For resetting the inventory after a dungeon and setting it up before a new game
    RESET_INVENTORY: Symbol("[Event ResetInventory]"),      // Resets the inventory to empty (no params)
    CHANGE_INVENTORY: Symbol("[Event ChangeInventory]"),    // Resets the inventory and adds the given items to it (items)

    // Equipment Events
    // For using currently equipped items
    SHOOT_EQUIP: Symbol("[Event ShootEquip]"),      // Start using equipment (slot)
    RELEASE_EQUIP: Symbol("[Event ReleaseEquip]"),  // Stop using equipment (slot)
}

// Item classes refer to "sets" of items
// For example, there might be different levels of bow & arrow
// You can only carry one of each item class
export enum ITEMCLASS {
    NULL,
    // Shield
    SHIELD,
    // Maybe other weapons eventually
    SWORD,
    // Bow types
    BOW = 10,
    FIRE_ARROW,
    ICE_ARROW,
    ELEC_ARROW,
    GOLD_ARROW,
    // Magic rods
    FIRE_ROD = 20,
    ICE_ROD,
    ELEC_ROD,
    EARTH_ROD,
    TELEPORT_ROD,
    // Miscellaneous
    BOMB_BAG = 100,
    BOOMERANG,
    GRAPPLE_HOOK,
    HAMMER,
    LANTERN,
    MAGIC_BOOTS,
    SPRING_BOOTS,
    // Stretch items
    // MAGIC_LENS,
    // MAGIC_CAPE,
    MAX_EQUIPPABLE = 1000,  // All classes below this line are passive and can't be equipped
    // Basic Equipment
    ARMOR,
    WALLET,
    BOMB_UPGRADE,
    QUIVER,
    // Other passive items
    AMULET = 1100,
    FLIPPERS,
    BRACELET,
    MAX_CHARACTER = 2000,   // Classes below this line are dungeon items and are shown on the map screen
    MAP,
    COMPASS,
    BIG_KEY,
}

export enum RESCLASS {
    NULL,
    HEALTH,
    MAGIC,
    MAX_METERS = 10,
    COINS,
    KEYS,
    BOMBS,
    ARROWS,
}