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
        }).sort((a,b) => {
            return a.name.localeCompare(b.name);
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
        data.actor.system.load.style = data.actor.system.load.value > data.actor.system.maxLoad ? "color: red" : "";
        data.actor.system.load.warning = data.actor.system.load.value > data.actor.system.maxLoad ? "OVER CAPACITY!" : "";

        return data;
    }

    activateListeners(html) {
        html.find(".item-delete").click(this._onItemDelete.bind(this));
        html.find(".inline-edit").change(this._onInlineEdit.bind(this));

        super.activateListeners(html);
    }

    async _onItemDelete(event) {
        const element = $(event.currentTarget).parents(".item");
        await this.actor.deleteEmbeddedDocuments("Item", [element.data("itemId")]);
        element.slideUp(200, () => this.render(false));
    }

    async _onInlineEdit(event) {
        event.preventDefault();
        const element = $(event.currentTarget).parents(".item");

        if (!element.data("itemId")) {
            return;
        }

        const item = this.actor.items.get(element.data("itemId"));
        const field = event.currentTarget.dataset.field;

        let newValue = parseInt(event.currentTarget.value);
        if (item.system.maxStackSize < parseInt(event.currentTarget.value)) {
            newValue = item.system.maxStackSize;                
            event.currentTarget.value = item.system.maxStackSize;
        }
        if (parseInt(event.currentTarget.value) <= 0) {
            newValue = 1;
            event.currentTarget.value = 1;
        }

        return item.update({[field]: newValue});
    }
}
