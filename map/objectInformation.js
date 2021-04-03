class ObjectInformation extends HTMLElement {
    constructor() {
        super();
        this.collapseElems = [];
        this.innerHTML = `
            <div id="object-information">
                <div class="pole">&nbsp;</div>
                <div class="accordion accordion-flush" id="object-information-list"></div>
                <div class="traffic-light">
                <div class="light-casing">
                    <button id="go-back-home" class="light"></button>
                </div>
                    <hr />
                <div class="light-casing">
                    <a id="go-to-street" class="light" target="_blank"></a>
                </div>
                </div>
            </div>
        `;
        this.$objectInformation = this.querySelector('#object-information');
        this.$objectInformationList = this.querySelector('#object-information-list');
        this.$streetLink = this.querySelector('#go-to-street');
        document.getElementById("go-back-home").addEventListener("click", () => {
            location.hash = '';
        });
    }

    set object(value){
        this._object = value;
        this.collapseElems.forEach(elem => elem.hide());
        const otherObjectDisplayed = this.$objectInformation.classList.contains('unfolded');
        this.$objectInformation.classList.remove('unfolded');
        // hide mapbox controls when screen too small
        if (window.innerWidth <= 600) {
            document.querySelector('.mapboxgl-ctrl-top-left').style.display = this._object ? 'none' : 'block';
        }
        // if an object is already displayed, wait for animation to finish
        setTimeout(() => this._renderObjectInformation(), otherObjectDisplayed ? 1000 : 0);
    }

    get object() {
        return this._object;
    }

    _renderObjectInformation() {
        this.collapseElems = [];
        this.$objectInformationList.innerHTML = '';

        if (this._object) {
            this.$streetLink.href = this._object.link;
            let infoItems = this.createInfoArray(this._object);

            infoItems.forEach((info, index) => {
                let $infoItem = this._renderItem(info, index)
                let $infoItemCollapse = $infoItem.querySelector(`#target-${index}`);
                let bsCollapse = new bootstrap.Collapse($infoItemCollapse, {
                    toggle: false,
                    parent: this.$objectInformationList
                });
                this.collapseElems.push(bsCollapse);
                if (index === 0) setTimeout(() => bsCollapse.show(), 1200);
            });
            // setTimeout to enable animations
            setTimeout(() => {
                this.$objectInformation.classList.add('visible');
                this.$objectInformation.classList.add('unfolded');
            }, 10);
        } else {
            this.$objectInformation.classList.remove('visible');
        }
    }

    createInfoArray(obj) {
        return [
            {
                heading: `<div class="street-heading"><h2>${obj.name}</h2><h3>${obj.quarter}</h3></div>`,
                text: `${obj.longDesc ? obj.longDesc : obj.shortDesc}<p class="text-end">${obj.author[0]}</p>`
            },
            ... obj.currentSituation ? [{
                heading: `<div class="street-heading"><h2>Aktueller Stand</h2></div>`,
                text: `${obj.currentSituation}`,
            }] : [],
            ... obj.recommendation ? [{
                heading: `<div class="street-heading"><h2>Unsere Empfehlung</h2></div>`,
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
