// eslint-disable-next-line no-unused-vars
const ConstructorPopupGallery = (function() {

    const { TrackSlider } = popupGalleryTrack;
    const {
        CSS_CLASS_OPTION,
        GALLERY_ACTIVE_ZONE,
        QUANTITY_VISIBLE_IMAGE,
        GALLERY_POPUP,
        GALLERY_TITLE,
        GALLERY_FULL_IMAGE_WRAPPER,
        GALLERY_PAGINATION_START,
        GALLERY_PAGINATION_END,
        GALLERY_BUTTON_LEFT,
        GALLERY_BUTTON_RIGHT
    } = popupGalleryData;

    /**
     * @extends TrackSlider
     * @description Экземпляр класса полного слайдера
     */
    class Slider extends TrackSlider {
        /**
         * @param {string} location локация для галереи
         * @param {string} typeGallery вид галереи office/event/business
         * @param {number} dataPosition порядковый номер активной картинки (индекс массива)
         */
        constructor (location = '', typeGallery = '', dataPosition = 0) {
            super(location, typeGallery);

            this._dataPosition = dataPosition;

            this._title = '';
            this.requestId = null;
            this._clickTrackHandler = this.clickTrackHandler.bind(this);
            this._touchStart = this.touchStart.bind(this);
            this._touchEnd = this.touchEnd.bind(this);
            this._touchMove = this.touchMove.bind(this);
            this._touchClickStart = this.touchClickStart.bind(this);
            this._touchClickEnd = this.touchClickEnd.bind(this);
            this._clickMobileTrackHandler = this.clickMobileTrackHandler.bind(this);
            this._clickButtonArrow = this.clickButtonArrow.bind(this);
            this._clickButtonArrowSM = this.clickButtonArrowSM.bind(this);
            this._clickFullImageHandler = this.clickFullImageHandler.bind(this);
        }

        /** @description активирует спиннер попапа при постройке/перестройке галереи */
        activateSpinner() {
            GALLERY_POPUP.classList.add( CSS_CLASS_OPTION['acive-popup-spinner'] );
        }

        /** @description деактивирует спиннер попапа по готовности галереи */
        deactivateSpinner() {
            GALLERY_POPUP.classList.remove( CSS_CLASS_OPTION['acive-popup-spinner'] );
        }

        /**
         * @param {string} title заголовок попапа
         * @description создание/изменение заголовка попапа
         */
        addSliderTitle (title = '') {
            GALLERY_TITLE.textContent = utils.translate(title);
        }

        /**
         * @param {number} number конечная цифра пагинации
         * @description задает конечную цифру в пагинации
         */
        addEndNumberPagination (number) {
            GALLERY_PAGINATION_END.textContent = number;
        }

        /**
         * @param {number} number текущая цифра пагинации
         * @description изменяет текущую цифру в пагинации
         */
        changeCurrentNumberPagination (number) {
            GALLERY_PAGINATION_START.textContent = number + 1;
        }

        /**
         * @param {string} src путь к картинке
         * @description создает картинку в блоке gallery_full_image
         * @returns {node} возвращает готовую картинку
         */
        createFullImage (src) {
            const img = new Image();

            img.src = src;
            img.classList.add( CSS_CLASS_OPTION['full-image'] );
            img.addEventListener('load', () => {
                GALLERY_FULL_IMAGE_WRAPPER.classList.add( CSS_CLASS_OPTION['loaded-full-image'] );
            });

            popupGalleryData.galleryFullImage = img;

            return img;
        }

        /**
         * @param {string} index индекс активированной картинки
         * @description активирует большую картинку хорошего качества
         */
        activateFullImage (index) {
            const src = this._arrGalleryImg[index];

            if (popupGalleryData.galleryFullImage) {
                popupGalleryData.galleryFullImage.setAttribute('src', src);
            } else {
                GALLERY_FULL_IMAGE_WRAPPER.innerHTML += utils.createSpinner();
                GALLERY_FULL_IMAGE_WRAPPER.appendChild( this.createFullImage(src) );
            }
        }

        /**
         * @param {event} e объект события
         * @description обработчик клика по большой картинке
         */
        clickFullImageHandler (e) {
            if (!e.target.classList.contains( CSS_CLASS_OPTION['full-image'] )) {return;}

            GALLERY_BUTTON_RIGHT.click();
        }

        /**
         * @param {event} e объект события
         * @description обработчик клика по картинке на дорожке
         */
        clickTrackHandler (e) {
            const target = e.target.closest('.js-wrapper-image');
            if (!target ) { return; }

            this._dataPosition = +target.getAttribute('data-number');

            if (this._indexPrevImage === this._dataPosition) {return;}

            this.removeCSSClassSelectedElements( CSS_CLASS_OPTION['active-track-element'] );
            this.removeCSSClassSelectedElements( CSS_CLASS_OPTION['loaded-full-image'] );
            this.changeCurrentNumberPagination(this._dataPosition);

            target.classList.add( CSS_CLASS_OPTION['active-track-element'] );

            this.activateFullImage(this._dataPosition);
            this.checkActivateInteractiveDot(target, this._dataPosition);

            this._indexPrevImage = this._dataPosition;
        }

        /**
         * @param {event} e объект события
         * @description обработчик клика по картинке на дорожке
         */
        clickMobileTrackHandler (e) {
            const target = e.target.closest('.js-wrapper-image');
            if (!target) {return;}

            this._dataPosition = +target.getAttribute('data-number');
            this.changeCurrentNumberPagination(this._dataPosition);

            target.classList.add( CSS_CLASS_OPTION['active-track-element'] );

            this.activateFullImage(this._dataPosition);

            this._indexPrevImage = this._dataPosition;
        }

        touchClickStart (e) {
            const target = e.target.closest('.js-wrapper-image');

            if (window.innerWidth > 544 && target) {
                this._coordTouchX = e.touches[0].clientX;
            }

        }

        touchClickEnd (e) {
            const target = e.target.closest('.js-wrapper-image');

            if (window.innerWidth > 544 && target) {
                const currentChangedTouches = e.changedTouches[0].clientX - this._coordTouchX;

                if (currentChangedTouches < 5 && currentChangedTouches > -5) {
                    this._clickTrackHandler(e);
                }

                this._coordTouchX = 0;
            }
        }

        /**
         * @param {event} e объект события
         * @description обработчик помещения точки касания на сенсорную поверхность
         */
        touchStart (e) {
            e.preventDefault();

            const selector = window.innerWidth > 544 ? '.js-gallery-full-image-wrapper' : '.js-wrapper-image';
            const target = e.target.closest(selector);

            if (!target) { return; }

            this._coordTouchX = e.touches[0].clientX;
        }

        /**
         * @param {event} e объект события
         * @description обработчик перемещения точки касания по сенсорной поверхности
         */
        touchMove (e) {
            e.preventDefault();

            const screenWidthCheck = window.innerWidth > 544;
            const selector = screenWidthCheck ? '.js-gallery-full-image-wrapper' : '.js-wrapper-image';
            const target = e.target.closest(selector);

            if (!target) { return; }

            const touchElement = screenWidthCheck ? GALLERY_FULL_IMAGE_WRAPPER : this._cloneTrackElement;
            const coordTouchX = screenWidthCheck ?
                e.touches[0].clientX - this._coordTouchX :
                this._coordTrackX + (e.touches[0].clientX - this._coordTouchX);

            this.requestId = requestAnimationFrame(() => {
                touchElement.setAttribute('style', `transform: translate3d(${coordTouchX}px, 0, 0);`);
            });
        }

        /**
         * @description логика скроллинга основного фото
         * @param {number} currentChangedTouches число пикселей на которые сдвинули элемент
         * @param {node} touchElement передвигаемый элемент
         */
        scrollingFullPhoto (currentChangedTouches, touchElement) {

            if (currentChangedTouches < -10) {
                GALLERY_BUTTON_RIGHT.click();

            } else if (currentChangedTouches > 10) {
                GALLERY_BUTTON_LEFT.click();

            }

            touchElement.setAttribute('style', 'transform: translate3d(0, 0, 0);');
        }

        /**
         * @description логика скроллинга основного фото
         * @param {node} target активированный тачем элемент
         * @param {number} currentChangedTouches число пикселей на которые сдвинули элемент
         * @param {node} touchElement передвигаемый элемент
         */
        scrollingSmallPhotos (target, currentChangedTouches, touchElement) {
            this._dataPosition = +target.getAttribute('data-number');

            if (currentChangedTouches < -10) {
                GALLERY_BUTTON_RIGHT.click();

            } else if (currentChangedTouches > 10) {
                GALLERY_BUTTON_LEFT.click();

            } else {
                touchElement.setAttribute('style', `transform: translate3d(${this._coordTrackX}px, 0, 0);`);
            }
        }

        /**
         * @param {event} e объект события
         * @description обработчик удаления точки касания с сенсорной поверхности
         */
        touchEnd (e) {
            e.preventDefault();

            const screenWidthCheck = window.innerWidth > 544;
            const selector = screenWidthCheck ? '.js-gallery-full-image-wrapper' : '.js-wrapper-image';
            const target = e.target.closest(selector);

            if (!target) { return; }

            const touchElement = screenWidthCheck ? GALLERY_FULL_IMAGE_WRAPPER : this._cloneTrackElement;

            cancelAnimationFrame(this.requestId);
            setTimeout(() => {
                const currentChangedTouches = e.changedTouches[0].clientX - this._coordTouchX;

                if (screenWidthCheck) {
                    this.scrollingFullPhoto(currentChangedTouches, touchElement);

                } else {
                    this.scrollingSmallPhotos(target, currentChangedTouches, touchElement);
                }

                this._coordTouchX = 0;
            }, 100);
        }

        /**
         * @param {event} e объект события
         * @description Управление нажатими на кнопки вправо/влево на маленьких экранах < 544px
         */
        clickButtonArrowSM (e) {
            if ( e.target.classList.contains( CSS_CLASS_OPTION['button-arrow-left']) ) {
                --this._dataPosition;

                if (this._dataPosition < 0) {
                    this._dataPosition = this._quantityAllImage - 1;
                    const allHiddenImages = this._quantityAllImage - this._quantityVisibleImage;
                    const fullWidthItem = this._widthImage + this._imageMargin;
                    const translateX = allHiddenImages * fullWidthItem;

                    this.scrollVisibleImages(-translateX);

                } else {
                    this.scrollVisibleImages(this._translateX);
                }

                this.removeCSSClassSelectedElements( CSS_CLASS_OPTION['active-track-element'] );
                this.activateSelectedImage(this._dataPosition);
                this.changeCurrentNumberPagination(this._dataPosition);
            } else if (e.target.classList.contains( CSS_CLASS_OPTION['button-arrow-right']) ) {
                ++this._dataPosition;

                if (this._dataPosition > this._quantityAllImage - 1) {
                    this._dataPosition = 0;
                    this.scrollVisibleImages(Math.abs(this._coordTrackX));
                } else {
                    this.scrollVisibleImages(-this._translateX);
                }

            this.removeCSSClassSelectedElements( CSS_CLASS_OPTION['active-track-element'] );
                this.activateSelectedImage(this._dataPosition);
                this.changeCurrentNumberPagination(this._dataPosition);
            }
        }

        /**
         * @param {number} translate сдвиг дорожки по оси Х
         * @description проверка на активацию кнопки вызова обратного скролла
         */
        checkActivatePrevScrollDot (translate) {
            const trackElements = this._cloneTrackElement.children;
            if (trackElements[this._dataPosition].classList.contains( CSS_CLASS_OPTION['slide-prev-scroll-dot'] )) {
                this.scrollVisibleImages(translate);
                this.removeCSSClassSelectedElements( CSS_CLASS_OPTION['slide-prev-scroll-dot'] );
            }
        }

        /**
         * @param {event} e объект события
         * @description Управление нажатими на кнопки вправо/влево
         */
        clickButtonArrow (e) {
            if ( e.target.classList.contains( CSS_CLASS_OPTION['button-arrow-left']) ) {
                --this._dataPosition;

                if (this._dataPosition < 0) {
                    this._dataPosition = this._quantityAllImage - 1;
                    const allHiddenImages = this._quantityAllImage - this._quantityVisibleImage;
                    const fullWidthItem = this._widthImage + this._imageMargin;
                    const translateX = allHiddenImages * fullWidthItem;

                    this.scrollVisibleImages(-translateX);
                    this.changeOrderTrack();
                }

                this.checkActivatePrevScrollDot(this._translateX);
                this.activateSelectedImage(this._dataPosition);

            } else if (e.target.classList.contains( CSS_CLASS_OPTION['button-arrow-right']) ) {
                ++this._dataPosition;

                if (this._dataPosition > this._quantityAllImage - 1) {
                    this._dataPosition = 0;

                    this.scrollVisibleImages(Math.abs(this._coordTrackX));
                    this.changeOrderTrack();
                }

                this.checkActivatePrevScrollDot(-this._translateX);
                this.activateSelectedImage(this._dataPosition);
            }
        }

        /** @description удаление всех обработчиков */
        removeAllEventHandlers () {
            GALLERY_FULL_IMAGE_WRAPPER.removeEventListener('click', this._clickFullImageHandler);
            GALLERY_ACTIVE_ZONE.removeEventListener('click', this._clickButtonArrow);
            this._cloneTrackElement.removeEventListener('click', this._clickTrackHandler);
            this._cloneTrackElement.removeEventListener('click', this._clickMobileTrackHandler);
            GALLERY_ACTIVE_ZONE.removeEventListener('click', this._clickButtonArrowSM);
            GALLERY_ACTIVE_ZONE.removeEventListener('touchstart', this._touchStart);
            GALLERY_ACTIVE_ZONE.removeEventListener('touchmove', this._touchMove);
            GALLERY_ACTIVE_ZONE.removeEventListener('touchend', this._touchEnd);
            GALLERY_ACTIVE_ZONE.removeEventListener('touchend', this._clickButtonArrow);
            this._cloneTrackElement.removeEventListener('touchstart', this._touchClickStart);
            this._cloneTrackElement.removeEventListener('touchend', this._touchClickEnd);
        }

        /** @description проверка ширины экрана для подбора нужных обработчиков событий и картинок */
        checkWindowWidthToAddEventHandlers () {
            if (window.innerWidth > 544) {
                GALLERY_FULL_IMAGE_WRAPPER.addEventListener('click', this._clickFullImageHandler);
                GALLERY_ACTIVE_ZONE.addEventListener('click', this._clickButtonArrow);
                GALLERY_ACTIVE_ZONE.addEventListener('touchend', this._clickButtonArrow);
                this._cloneTrackElement.addEventListener('click', this._clickTrackHandler);
                this._cloneTrackElement.addEventListener('touchstart', this._touchClickStart);
                this._cloneTrackElement.addEventListener('touchend', this._touchClickEnd);

                this.changeSrcImageTracking(this._postfixSrcImage);
            } else {
                GALLERY_ACTIVE_ZONE.addEventListener('click', this._clickButtonArrowSM);
                this._cloneTrackElement.addEventListener('click', this._clickMobileTrackHandler);

                this.changeSrcImageTracking();
            }

            GALLERY_ACTIVE_ZONE.addEventListener('touchstart', this._touchStart);
            GALLERY_ACTIVE_ZONE.addEventListener('touchend', this._touchEnd);
            GALLERY_ACTIVE_ZONE.addEventListener('touchmove', this._touchMove);
        }

        /** @description сборка слайдера */
        projectAssembly () {
            this.loadedImage()
                .then( () => {

                    this.checkWindowWidthToAddEventHandlers();
                    this.addSliderTitle(this._title);
                    this.countVisibleImage();
                    this.appendTrackNodes();
                    this.activateSelectedImage(this._dataPosition);
                    this.createInteractiveDots();
                    this.countRetentionImage();
                    this.addEndNumberPagination(this._quantityAllImage);
                    this.deactivateSpinner();

                    if (window.innerWidth < 545) {
                        this.optionSliderSM();
                        this.resizeInSM();
                    }
                })
                .catch ( err => {
                    throw new Error(err);
                } );
        }

        /**
         * @param {number} numActiveTrackElement номер стартовой активной картнки в дорожке
         * @description перезапуск слайдера
         */
        reAssembly (numActiveTrackElement = 0) {
            Promise.resolve()
                .then( () => {
                    this.checkWindowWidthToAddEventHandlers();
                    this.addSliderTitle(this._title);
                    this.countVisibleImage();
                    this.appendTrackNodes();
                    this.activateSelectedImage(numActiveTrackElement);
                    this.createInteractiveDots();
                    this.countRetentionImage();
                    this.addEndNumberPagination(this._quantityAllImage);
                    this.deactivateSpinner();

                    if (window.innerWidth < 545) {
                        this.optionSliderSM();
                        this.resizeInSM();
                    }
                } )
                .catch ( err => {
                    throw new Error(err);
                } );
        }

        /** @description перезапуск слайдера при изменении ширины окна */
        reAssemblyInResize () {
            this.activateSpinner();

            Promise.resolve()
                .then(() => {
                    let scrollInActiveElement = 0;

                    this.optionSliderSM();

                    if (window.innerWidth > 544) {
                        this.removeCSSClassSelectedElements( CSS_CLASS_OPTION['slide-prev-scroll-dot'] );
                        this.countVisibleImage();
                        this.createInteractiveDots();
                        this.countRetentionImage();
                        scrollInActiveElement = this.countTranslateInActiveImage();
                        this.scrollVisibleImages(-scrollInActiveElement);
                        this.deactivateSpinner();
                        this.checkPrevScrollDotResize();

                    } else {
                        this.resizeInSM();
                    }
                });
        }

        /** @description выполняет методы для SM размеров экрана */
        resizeInSM () {
            let scrollInActiveElement = 0;

            this.removeCSSClassSelectedElements( CSS_CLASS_OPTION['slide-prev-scroll-dot'] );
            this.countVisibleImageSM();
            scrollInActiveElement = this.countTranslateInActiveImageSM();
            this.scrollVisibleImages(-scrollInActiveElement);
            this.deactivateSpinner();
        }

        /** @description обновляет данные попапа, убирает/добавляет обработчики при маленьком размере экрана */
        optionSliderSM() {
            this._quantityVisibleImage = QUANTITY_VISIBLE_IMAGE;
            this._coordTrackX = 0;
            this._order = true;

            this._cloneTrackElement.setAttribute('style', '');
            this.removeAllEventHandlers();
            this.checkWindowWidthToAddEventHandlers();
        }

        /** @description обновляет данны попапа, убирает обработчики */
        defaultOptions() {
            this._quantityVisibleImage = QUANTITY_VISIBLE_IMAGE;
            this._indexPrevImage = -1;
            this._coordTrackX = 0;
            this._order = true;

            this.activateSpinner();
            this.addSliderTitle();
            this.removeCSSClassSelectedElements( CSS_CLASS_OPTION['interactive-dot'] );
            this.removeCSSClassSelectedElements( CSS_CLASS_OPTION['last-interactive-dot'] );
            this.removeCSSClassSelectedElements( CSS_CLASS_OPTION['slide-prev-scroll-dot'] );

            this._cloneTrackElement.setAttribute('style', '');
            popupGalleryData.galleryFullImage.setAttribute('src', '');

            this.removeAllEventHandlers();
        }
    }

    /**
     * @param {string} location локация для галереи
     * @param {string} typeGallery вид галереи office/event/business
     * @param {number} numActiveTrackElement порядковый номер активной картинки (индекс массива)
     * @description функция инициализирующая попап
     */
    function initPopup (location = '', typeGallery = '', numActiveTrackElement = 0) {
        const arrGallery = popupGalleryData.arrPopupGalleries;
        const objPopup = arrGallery.filter(item => item.location === location && item.typeGallery === typeGallery);

        if (objPopup.length) {
            popupGalleryData.currentPopupGallery = objPopup[0];
            popupGalleryData.currentPopupGallery.reAssembly(numActiveTrackElement);
        } else {
            popupGalleryData.currentPopupGallery = new Slider(location, typeGallery, numActiveTrackElement);
            popupGalleryData.arrPopupGalleries.push(popupGalleryData.currentPopupGallery);
            popupGalleryData.currentPopupGallery.projectAssembly();
        }
    }

    /**
     * @param {event} event объект события
     * @description функция клика по элементу карты (файл init.js)
     */
    function clickFooterMapHandler (event) {
        const location = event.target.id;
        const typeGallery = event.target.dataset.type;

        initPopup(location, typeGallery);
    }

    /** @description Обработчик изменения ширины окна пользователя */
    window.addEventListener('resize', function () {
        if (popupGalleryData.windowWidth === window.innerWidth) {return;}

        setTimeout( () => {
            popupGalleryData.windowWidth = window.innerWidth;
            if (!popupGalleryData.currentPopupGallery) {return;}

            popupGalleryData.currentPopupGallery.reAssemblyInResize();
        }, 400);
    });

    /** @description Обработчик скрытия попапа */
    document.addEventListener('popup:hide', () => {
        if (!popupGalleryData.currentPopupGallery) {return;}

        popupGalleryData.currentPopupGallery.defaultOptions();
        popupGalleryData.currentPopupGallery = null;
    });

    return {
        Slider,
        clickFooterMapHandler,
        initPopup
    };
})();
