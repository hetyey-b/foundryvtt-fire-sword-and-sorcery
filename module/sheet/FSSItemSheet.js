export default class FSSItemSheet extends ItemSheet {
    get template() {
        return `systems/foundryvtt-fire-sword-and-sorcery/template/sheet/${this.item.type}-sheet.html`;
    }

    getData() {
        const data = super.getData();

        data.config = CONFIG.fss;

        return data;
    }
}
