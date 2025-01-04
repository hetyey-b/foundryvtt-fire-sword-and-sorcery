export default class FSSPCSheet extends ActorSheet {
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            template: "systems/foundryvtt-fire-sword-and-sorcery/template/sheet/pc-sheet.html",
            tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "inventory"}]
        });
    }

    async getData() {
        const data = super.getData();

        data.config = CONFIG.fss;

        data.actor.system.notes = await TextEditor.enrichHTML(data.data.system.notes, {secrets: data.data.owner, async: true});

        data.actor.system.equipment = data.items.filter(item => item.type === "equipment");
        data.actor.system.facets = data.items.filter(item => item.type === "facet");
        data.actor.system.heritageAbility = data.items.find(item => item.type === "heritageAbility");

        data.actor.system.load = {};
        data.actor.system.load.value = data.actor.system.equipment.reduce((accumulator, currentValue) => {
            return accumulator + currentValue.system.size;
        }, 0);
        data.actor.system.load.style = data.actor.system.load.value > 10 ? "color: red" : "";
        data.actor.system.load.warning = data.actor.system.load.value > 10 ? "OVER CAPACITY!" : "";

        return data;
    }

    activateListeners(html) {
        html.find(".item-delete").click(this._onItemDelete.bind(this));
        html.find(".item-roll").click(this._onItemRoll.bind(this));
        html.find(".show-item").click(this._onShowItem.bind(this));


        super.activateListeners(html);
    }

    async _onShowItem(event) {
        const element = $(event.currentTarget).parents(".item");
        const item = this.actor.items.get(element.data("itemId"));
        let speaker = ChatMessage.getSpeaker();
        let template = "systems/foundryvtt-fire-sword-and-sorcery/template/chat/item-chat.html";
        let resultData = {
            name: item.name, 
            description: item.system.description,
            type: item.type
        };

        if (item.type === "facet") {
            template = "systems/foundryvtt-fire-sword-and-sorcery/template/chat/facet-chat.html";
            resultData.tier = item.system.tier;
        }

        let result = await renderTemplate(template, resultData);

        let messageData = {
            speaker: speaker,
            content: result,
            type: CONST.CHAT_MESSAGE_TYPES.ROLL,
        }
        CONFIG.ChatMessage.documentClass.create(messageData, {})
    }

    async _onItemDelete(event) {
        const element = $(event.currentTarget).parents(".item");
        await this.actor.deleteEmbeddedDocuments("Item", [element.data("itemId")]);
        element.slideUp(200, () => this.render(false));
    }

    async _onItemRoll(event)  {
        const target = event.currentTarget;
        const rollAttribute = target && target.dataset && target.dataset.rollattribute;

        if (!rollAttribute) {
            console.error("FSS | No roll attribute on target");
            return;
        }
        const attributeValue = this.actor.system.attributes[rollAttribute];
        if (attributeValue === undefined) {
            console.error(`FSS | No attribute key ${rollAttribute} on actor ${this.actor.name}`);
            return;
        }
        
        this.rollPopUp(rollAttribute, attributeValue);
    }

    rollPopUp(rollAttribute, attributeValue) {
        const attributeDict = {
            "str": "Strength",
            "ref": "Reflex",
            "int": "Intelligence",
            "wis": "Wisdom"
        };

        let content = `<form>
            <h1>${attributeDict[rollAttribute]} (+${attributeValue})</h1>
            <select name="facet" id="facet">
            <option value="0">-- No Facet --</option>
            ${this.actor.system.facets.map(facet => {
                return `<option value="${facet.system.tier}">
                    ${facet.name} (${facet.system.tier}): ${facet.system.description}
                    </option>`
            }).join('')}
            </select>
            </form>`;

        new Dialog({
            title: "Roll",
            content: content,
            buttons: {
                yes: {
                    label: "Roll",
                    callback: async (html) => {
                        const facetValue = html.find('[name=facet]')[0].value;
                        const rollFormula = `1d20 + @facetValue + @attributeValue`;

                        const rollData = {
                            facetValue: facetValue,
                            attributeValue: attributeValue
                        };
                        const messageData = {
                            speaker: ChatMessage.getSpeaker()
                        };

                        let r = await new Roll(rollFormula, rollData).roll();
                        r.toMessage(messageData);
                    }
                },
                no: {
                    label: "Close",
                }
            },
            default: "yes",
        }).render(true);
    }

}
