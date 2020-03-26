/* eslint-disable no-unused-vars */
const popupGalleryLogic = (function () {
    const {
        CSS_CLASS_OPTION,
        GALLERY_ACTIVE_ZONE,
        QUANTITY_VISIBLE_IMAGE,
        MIN_WIDTH_IMAGE
    } = popupGalleryData;

    /** @description Экземляр класса строит логику перелистывания и активации элементов */
    class SliderLogic {
        constructor () {
            this._quantityVisibleImage = QUANTITY_VISIBLE_IMAGE;
            this._cloneTrackElement = popupGalleryData.galleryTrack.cloneNode();

            this._trackWidth = 500;
            this._coordTrackX = 0;
            this._coordTouchX = 0;
            this._translateX = 0;
            this._order = true;
            this._quantityAllImage = 0;
            this._widthImage = 100;
            this._imageMargin = 0;
            this._indexPrevImage = -1;
            this._quantityRemainingImage = 0;
            this._arrInteractiveDots = [];
        }

        /**
         * @param {string} variable необходимая для проверкаи перменная
         * @param {string} type тип проверки условия
         * @description метод проверки длинных условий с целью повышения удобочитаемости кода
         * @returns {object} возвращает объект результатов проверок
         */
        checkСondition (type) {
            switch (type) {
                case 'check-slide-prev-image' :
                        const cloneChildrenList = this._cloneTrackElement.children[this._dataPosition].classList;
                        const validateActive = cloneChildrenList.contains( CSS_CLASS_OPTION['active-track-element'] );
                        const validateInteractive = cloneChildrenList.contains( CSS_CLASS_OPTION['interactive-dot'] );

                    return validateActive && validateInteractive;

                default :
                    return false;
            }
        }

        /** @description добавление стилей оберткам картинок на дорожке */
        addStylesTrackImage () {
            [ ...this._cloneTrackElement.children ].forEach( element => {
                element.setAttribute('style', `width: ${this._widthImage}px; margin-right: ${this._imageMargin}px;`);
            } );
        }

        /** @description метод рассчета количества картинок видимой части дорожки
         * на экранах меньше 544px и общей ширины дорожки */
        countVisibleImageSM () {
            const newTrackVisibleWidth = +GALLERY_ACTIVE_ZONE.offsetWidth;

            this._widthImage = newTrackVisibleWidth;
            this._translateX = newTrackVisibleWidth;
            this._quantityVisibleImage = 1;
            this._imageMargin = 0;
            this._trackWidth = this._widthImage * this._quantityAllImage;

            this.addStylesTrackImage();
        }

        /**
         * @param {boolean} recursion проверяет метод на рекурсивный вызов
         * @description метод рассчета количества картинок видимой части дорожки и общей ширины дорожки
         */
        countVisibleImage (recursion) {
            let trackFullWidth = 0;
            popupGalleryData.trackVisibleWidth = +GALLERY_ACTIVE_ZONE.offsetWidth;
            popupGalleryData.countPrecentWidth = +Math.floor(100 / this._quantityVisibleImage);
            this._widthImage = popupGalleryData.trackVisibleWidth * popupGalleryData.countPrecentWidth;
            this._widthImage = +Math.floor(this._widthImage / 100);

            if (this._widthImage < MIN_WIDTH_IMAGE) {
                --this._quantityVisibleImage;

                this.countVisibleImage(true);
            }

            trackFullWidth = popupGalleryData.trackVisibleWidth - this._widthImage * this._quantityVisibleImage;
            this._imageMargin = trackFullWidth / this._quantityVisibleImage;
            this._trackWidth = (this._widthImage + this._imageMargin) * this._quantityAllImage;
            this._translateX = popupGalleryData.trackVisibleWidth - this._widthImage - this._imageMargin;
            if (recursion) {return;}

            this.addStylesTrackImage();
        }

        /** @description метод для рассчета скролла дорожки до текщего активного элемента */
        countTranslateInActiveImageSM () {
            return this._dataPosition * this._translateX;
        }

        /** @description метод для рассчета скролла дорожки до текщего активного элемента */
        countTranslateInActiveImage () {
            const length = this._arrInteractiveDots.length;
            for ( let i = 0; i < length; i++ ) {
                if (this._dataPosition < this._arrInteractiveDots[i] - 1) {
                    return i * this._translateX;
                }
            }
            this.changeOrderTrack();

            return this._trackWidth - this._quantityVisibleImage * (this._widthImage + this._imageMargin);
        }

        /**
         * @description проверка на установку кнопки для активации скролла при уходе
         * активной кнопки за границу видимой области при ресайзе экрана
         */
        checkPrevScrollDotResize () {
            const trackElements = this._cloneTrackElement.children;
            if (this.checkСondition('check-slide-prev-image')) {
                trackElements[this._dataPosition - 1].classList.add( CSS_CLASS_OPTION['slide-prev-scroll-dot'] );
            }
        }

        /**
         * @param {number} translate сдвиг дорожки по оси Х
         * @description проверка на установку кнопки для активации скролла при уходе
         * активной кнопки за границу видимой области
         */
        checkPrevScrollDot (translate) {
            const trackElements = this._cloneTrackElement.children;
            if (Math.abs(translate) === this._translateX && translate < 0) {
                trackElements[this._dataPosition - 1].classList.add( CSS_CLASS_OPTION['slide-prev-scroll-dot']);
            } else if (Math.abs(translate) === this._translateX && translate > 0) {
                trackElements[this._dataPosition + 1].classList.add( CSS_CLASS_OPTION['slide-prev-scroll-dot']);
            }
        }

        /** @description центровка элементов в случае если кол-во по факту, меньше заданных видимых элементов */
        alignmentTrackElements () {
            if (this._quantityVisibleImage >= this._quantityAllImage) {
                this._cloneTrackElement.setAttribute('style', 'justify-content: center');
                return true;
            }
            return false;
        }

        /**
         * @param {number} translate сдвиг дорожки по оси Х
         * @description управление скроллингом дорожки
         */
        scrollVisibleImages (translate) {
            this._coordTrackX += translate;
            this.removeCSSClassSelectedElements( CSS_CLASS_OPTION['slide-prev-scroll-dot'] );

            if (this._coordTrackX > 0) {
                this._coordTrackX = 0;
            }

            if (Math.abs(this._coordTrackX - this._widthImage - this._imageMargin) <= this._trackWidth) {
                this._cloneTrackElement.setAttribute('style', `transform: translate3d(${this._coordTrackX}px, 0, 0);`);

                this.alignmentTrackElements();
                this.checkPrevScrollDot(translate);
            } else {
                this._coordTrackX -= translate;
            }
        }

        /**
         * @param {number} number начальное значение отсчета интерактивных точек
         * @description Подсчитывает количество интерактивных точек и расставляет соответствующие css-классы на дороке
         */
        createInteractiveDots (number = this._quantityVisibleImage) {
            let index = number;
            const trackElements = this._cloneTrackElement.children;

            if ( this.alignmentTrackElements() ) { return; }

            this._arrInteractiveDots = [];

            this.removeCSSClassSelectedElements( CSS_CLASS_OPTION['interactive-dot'] );
            this.removeCSSClassSelectedElements( CSS_CLASS_OPTION['last-interactive-dot'] );

            this._arrInteractiveDots.push(index);

            while (index <= this._quantityAllImage) {
                index += this._quantityVisibleImage - 1;

                if (index >= this._quantityAllImage) {
                    const indexLastElement = this._order ?
                                                this._arrInteractiveDots[this._arrInteractiveDots.length - 1] :
                                                this._arrInteractiveDots[0];

                    trackElements[indexLastElement - 1].classList.add( CSS_CLASS_OPTION['last-interactive-dot'] );
                    break;
                }

                this._arrInteractiveDots.push(index);
            }

            // присваивание интерактивных классов
            this._arrInteractiveDots.forEach( item => {
                const trackIndex = item - 1;

                trackElements[trackIndex].classList.add( CSS_CLASS_OPTION['interactive-dot'] );
            });
        }

        /** @description изменяет направление дорожки */
        changeOrderTrack () {
            this._order = !this._order;

            if (this._order) {
                this.createInteractiveDots(this._quantityVisibleImage);
            } else {
                this.createInteractiveDots(this._quantityRemainingImage + 1);
            }
        }

        /**
         * @param {number} position позиция активного элемента дорожки
         * @param {number} translate сдвиг дорожки по оси Х
         * @description проверка на отрицательный/положительный скролл по оси Х
         */
        checkOrderScroll(position, translate) {
            if (position > this._indexPrevImage) {
                this.scrollVisibleImages(-translate);
            } else {
                this.scrollVisibleImages(translate);
            }
        }

        /**
         * @param {node} target активный элемент дорожки
         * @param {number} position позиция активного элемента дорожки
         * @description логика проверки на активацию интерактивных точек для перелистывания дорожки
         */
        checkActivateInteractiveDot(target, position) {
            if (target.classList.contains( CSS_CLASS_OPTION['last-interactive-dot'] )) {
                const retentionWidth = this._quantityRemainingImage * (this._widthImage + this._imageMargin);

                this.changeOrderTrack();
                this.checkOrderScroll(position, retentionWidth);
            } else if (target.classList.contains( CSS_CLASS_OPTION['interactive-dot'] )) {
                this.checkOrderScroll(position, this._translateX);
            }
        }

        /** @description подсчитывает остаток картинок в конце */
        countRetentionImage() {
            const index = this._arrInteractiveDots.length - 1;
            this._quantityRemainingImage = this._quantityAllImage - this._arrInteractiveDots[index];
        }

        /**
         * @param {number} number номер активного элемента
         * @description активирует картинку в дорожке
         */
        activateSelectedImage (number) {
            this._cloneTrackElement.children[number].click();
        }

        /**
         * @param {string} selector css-класс элемента
         * @description метод очистки выбранных css-классов
         */
        removeCSSClassSelectedElements (selector) {
            const arrActiveElements = GALLERY_ACTIVE_ZONE.querySelectorAll(`.${selector}`);

            if (!arrActiveElements.length) {return;}

            [ ...arrActiveElements ].forEach( element => element.classList.remove(selector) );
        }
    }

    return {
        SliderLogic
    };
})();
