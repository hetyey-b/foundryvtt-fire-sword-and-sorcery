export default class FSSHirelingSheet extends ActorSheet {
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            template: "systems/foundryvtt-fire-sword-and-sorcery/template/sheet/hireling-sheet.html",
            tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "inventory"}]
        });
    }

    async getData() {
        const data = super.getData();

        data.config = CONFIG.fss;

        data.actor.system.inventory = data.items.filter(item => {
            return item.type === "equipment";
        });

        data.actor.system.totalCoin = data.items.filter(item => {
            return item.name === "Coin";
        }).reduce((accumulator, currentValue) => {
            return accumulator + currentValue.system.number;
        }, 0);

        data.actor.system.load = {};
        data.actor.system.load.value = data.items.filter(item => item.type === "equipment").reduce((accumulator, currentValue) => {
            return accumulator + currentValue.system.size;
        }, 0);
        data.actor.system.load.style = data.actor.system.load.value > 10 ? "color: red" : "";
        data.actor.system.load.warning = data.actor.system.load.value > 10 ? "OVER CAPACITY!" : "";

        return data;
    }
}
