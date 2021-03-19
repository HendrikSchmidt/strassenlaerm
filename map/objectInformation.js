class ObjectInformation extends HTMLElement {
    constructor() {
        super();
        this.innerHTML = `
            <div id="object-information">
                <div class="accordion accordion-flush" id="object-information-list"></div>
                <button id="goBackHome"><img src="Coat_of_arms_of_Berlin.svg" class="baer" /></button>
                <div class="pole">&nbsp;</div>
            </div>
        `;
        this.$objectInformation = this.querySelector('#object-information');
        this.$objectInformationList = this.querySelector('#object-information-list');
        this.collapseElems = [];
        document.getElementById("goBackHome").addEventListener("click", () => {
            location.hash = '';
        });
    }

    set object(value){
        this._object = value;
        if(this._object) {
            if (this.$objectInformation.classList.contains('unfolded')) {
                this.collapseElems.forEach(elem => elem.hide());
                this.$objectInformation.classList.remove('unfolded');
                setTimeout(() => this._renderObjectInformation(), 1000);
            } else {
                this._renderObjectInformation();
            }
        } else if (this.$objectInformation.classList.contains('unfolded')) {
            this.collapseElems.forEach(elem => elem.hide());
            this.$objectInformation.classList.remove('unfolded');
            setTimeout(() => this.$objectInformation.classList.remove('visible'), 1000);
        }
    }

    get object() {
        return this._object;
    }

    _renderObjectInformation() {
        this.collapseElems = [];
        this.$objectInformationList.innerHTML = '';

        let infoItems = this.createInfoArray(this._object);

        infoItems.forEach((info, index) => {
            let $infoItem = this._renderItem(info, index)
            let $infoItemCollapse = $infoItem.querySelector(`#target-${index}`);
            let bsCollapse = new bootstrap.Collapse($infoItemCollapse, {toggle: false, parent: this.$objectInformationList});
            this.collapseElems.push(bsCollapse);
            if (index === 0) setTimeout(() => bsCollapse.show(), 1200);
        });

        setTimeout(() => this.$objectInformation.classList.add('unfolded'), 10);
        if (!this.$objectInformation.classList.contains('visible')) {
            setTimeout(() => this.$objectInformation.classList.add('visible'), 10);
        }
    }

    createInfoArray(obj) {
        return [
            {
                heading: `<h2>${obj.name}</h2><h3>${obj.quarter}</h3>`,
                text: `${obj.longDesc ? obj.longDesc : obj.shortDesc}<p>${obj.author[0]}</p>`
            },
            ... obj.currentSituation ? [{
                heading: `<h2>Aktueller Stand</h2>`,
                text: `${obj.currentSituation}`,
            }] : [],
            ... obj.recommendation ? [{
                heading: `<h2>Unsere Empfehlung</h2>`,
                text: `${obj.recommendation}`,
            }] : [],
        ]
    }

    _renderItem(info, index) {
        let $infoItem = document.createElement('div');
        $infoItem.classList.add('accordion-item');
        this.$objectInformationList.appendChild($infoItem);
        $infoItem.innerHTML = `
            <div class="streetsign attached">
                <h2 class="accordion-header" id="item-${index}">
                    <button
                        class="accordion-button collapsed"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#target-${index}"
                        aria-expanded="false"
                        aria-controls="target-${index}">
                        ${info.heading}
                    </button>
                </h2>
                <div
                    id="target-${index}"
                    class="accordion-collapse collapse"
                    aria-labelledby="item-${index}">
                    <div class="accordion-body">${info.text}</div>
                </div>
            </div>
            <div class="handle"><div class="handle-inner">&nbsp;</div></div>
        `;
        return $infoItem;
    }

}

window.customElements.define('object-information', ObjectInformation);
