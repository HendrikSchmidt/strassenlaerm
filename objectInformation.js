const infoElement = document.createElement('template');
infoElement.innerHTML = `
<div class="accordion-item">
    <div class="streetsign attached">
        <h2 class="accordion-header" id="need-id">
            <button
                class="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#need-target"
                aria-expanded="false"
                aria-controls="need-target">
            </button>
        </h2>
        <div
            id="need-target"
            class="accordion-collapse collapse"
            aria-labelledby="need-id">
            <div class="accordion-body"></div>
        </div>
    </div>
    <div class="handle"><div class="handle-inner">&nbsp;</div></div>
</div>
`;

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

    _renderObjectInformation() {
        this.collapseElems = [];
        this.$objectInformationList.innerHTML = '';

        this._infos.forEach((info, index) => {
            let $infoItem = infoElement.content.cloneNode(true);
            let $infoItemHeader = $infoItem.querySelector('.accordion-header');
            $infoItemHeader.id = `item-${index}`;
            let $infoItemButton = $infoItem.querySelector('.accordion-button');
            $infoItemButton.setAttribute('data-bs-target', `#target-${index}`);
            $infoItemButton.setAttribute('aria-controls', `target-${index}`);
            $infoItemButton.innerHTML = info.heading;
            let $infoItemCollapse = $infoItem.querySelector('.accordion-collapse');
            let bsCollapse = new bootstrap.Collapse($infoItemCollapse, {toggle: false, parent: this.$objectInformationList});
            this.collapseElems.push(bsCollapse);
            $infoItemCollapse.id = `target-${index}`;
            $infoItemCollapse.setAttribute('aria-labelledby', `item-${index}`);
            let $infoItemText = $infoItem.querySelector('.accordion-body');
            $infoItemText.innerHTML = info.text;
            this.$objectInformationList.appendChild($infoItem);
            if (index === 0) setTimeout(() => bsCollapse.show(), 1000);
        });

        setTimeout(() => this.$objectInformation.classList.add('unfolded'), 10);
        if (!this.$objectInformation.classList.contains('visible')) {
            setTimeout(() => this.$objectInformation.classList.add('visible'), 10);
        }
    }

    set infos(value) {
        this._infos = value;
        if(this._infos) {
            if (this.$objectInformation.classList.contains('unfolded')) {
                this.collapseElems.forEach(elem => elem.hide());
                this.$objectInformation.classList.remove('unfolded');
                setTimeout(() => this._renderObjectInformation(), 1000);
            } else {
                this._renderObjectInformation();
            }
        } else {
            if (this.$objectInformation.classList.contains('unfolded')) {
                this.collapseElems.forEach(elem => elem.hide());
                this.$objectInformation.classList.remove('unfolded');
                setTimeout(() => this.$objectInformation.classList.remove('visible'), 1000);
            }
        }
    }

    get infos() {
        return this._infos;
    }
}

window.customElements.define('object-information', ObjectInformation);
