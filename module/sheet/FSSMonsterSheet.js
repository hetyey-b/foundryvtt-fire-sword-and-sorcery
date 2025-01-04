export default class FSSMonsterSheet extends ActorSheet {
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            template: "systems/foundryvtt-fire-sword-and-sorcery/template/sheet/monster-sheet.html"
        });
    }
}
