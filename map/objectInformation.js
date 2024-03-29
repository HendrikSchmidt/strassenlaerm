import { removeInformation } from './mapbox.js';

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
                        <button id="go-back-home" class="light" data-bs-toggle="tooltip" data-bs-placement="left" title="${i18n.close}"></button>
                    </div>
                    <div class="light-casing">
                        <a id="go-to-street" class="light" data-bs-toggle="tooltip" data-bs-placement="left" title="${i18n.toSite}"></a>
                    </div>
                </div>
            </div>
        `;
        this.$objectInformation = this.querySelector('#object-information');
        this.$objectInformationList = this.querySelector('#object-information-list');
        this.$streetLink = this.querySelector('#go-to-street');
        const tooltipTriggerList = [].slice.call(this.querySelectorAll('[data-bs-toggle="tooltip"]'));
        this.tooltipList = tooltipTriggerList.map((tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl));
        this.querySelector('#go-back-home').addEventListener("click", () => {
            removeInformation(true);
            // disable to prevent buggy display
            this.tooltipList.forEach(tooltip => {tooltip.hide(); tooltip.disable()});
        });
    }

    showHintOnFirstLoad() {
        if (window.sessionStorage.getItem('wasLoadedBefore') !== 'true') {
            this.tooltipList.forEach(tooltip => tooltip.show());
            setTimeout(() => this.tooltipList.forEach(tooltip => tooltip.hide()), 3000);
            window.sessionStorage.setItem('wasLoadedBefore', 'true');
        }
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
        if (otherObjectDisplayed) {
            const lastSign = this.querySelector('#object-information .accordion-item:last-child .sign')
            lastSign.addEventListener('transitionend', () => this._renderObjectInformation());
        } else {
            this._renderObjectInformation();
        }
        // tooltips might have been disabled before
        this.tooltipList.forEach(tooltip => tooltip.enable() );
    }

    get object() {
        return this._object;
    }

    _renderObjectInformation() {
        this.collapseElems = [];
        this.$objectInformationList.innerHTML = '';

        if (this._object) {
            this.$streetLink.href = this._object.permalink;
            let infoItems = this._createInfoArray(this._object);

            infoItems.forEach((info, index) => {
                let $infoItem = this._renderItem(info, index, this._object.className)
                let $infoItemCollapse = $infoItem.querySelector(`#target-${index}`);
                let bsCollapse = new bootstrap.Collapse($infoItemCollapse, {
                    toggle: false,
                    parent: this.$objectInformationList
                });
                this.collapseElems.push(bsCollapse);
            });
            // setTimeout to enable animations
            setTimeout(() => {
                this.$objectInformation.classList.add('visible');
                this.$objectInformation.classList.add('unfolded');
            }, 1);
            this.$objectInformation.addEventListener('transitionend', (e) => {
                // don't fire for child transitions
                if (e.propertyName === 'bottom') {
                    this.showHintOnFirstLoad();
                    this.collapseElems[0]?.show();
                }
            });
        } else {
            this.$objectInformation.classList.remove('visible');
        }
    }

    _createInfoArray(obj) {
        return [
            {
                heading: `<div class="street-heading"><h2>${obj.name}</h2><h3>${obj.quarter}</h3></div>`,
                text: `${obj.longDesc ? obj.longDesc : obj.shortDesc}<p class="text-end">${obj.author}</p>`
            },
            ... obj.currentSituation ? [{
                heading: `<div class="street-heading"><h2>${i18n.currentSituation}</h2></div>`,
                text: `${obj.currentSituation}`,
            }] : [],
            ... obj.recommendation ? [{
                heading: `<div class="street-heading"><h2>${i18n.recommendation}</h2></div>`,
                text: `${obj.recommendation}`,
            }] : [],
        ]
    }

    _renderItem(info, index, className) {
        let $infoItem = document.createElement('div');
        $infoItem.classList.add('accordion-item');
        this.$objectInformationList.appendChild($infoItem);
        $infoItem.innerHTML = `
            <div class="${className} attached">
                <div class="sign-content">
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
            </div>
            <div class="handle"><div class="handle-inner">&nbsp;</div></div>
        `;
        return $infoItem;
    }

}

window.customElements.define('object-information', ObjectInformation);
