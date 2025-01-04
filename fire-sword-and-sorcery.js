import { fss } from "./module/config.js";
import FSSItemSheet from "./module/sheet/FSSItemSheet.js";
import FSSPCSheet from "./module/sheet/FSSPCSheet.js";
import FSSMonsterSheet from "./module/sheet/FSSMonsterSheet.js";

Hooks.once("init", function() {
    console.log("FSS | Initializing the Fire, Sword and Sorcery system...");

    console.log("FSS | Loading config...");
    CONFIG.fss = fss;

    console.log("FSS | Registering sheets...");
    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("fire-sword-and-sorcery", FSSItemSheet, { makeDefault:true });

    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("fire-sword-and-sorcery", FSSPCSheet, { types: ["pc"], makeDefault:true });
    Actors.registerSheet("fire-sword-and-sorcery", FSSMonsterSheet, { types: ["monster"], makeDefault:true });


});
