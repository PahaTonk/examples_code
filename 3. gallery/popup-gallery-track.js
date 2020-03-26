/* eslint-disable no-unused-vars */
const popupGalleryTrack = (function () {

    const { SliderLogic } = popupGalleryLogic;
    const {
        CSS_CLASS_OPTION,
        NAME_TYPE_GALLERY
    } = popupGalleryData;

    /** @description Экземляр класса картинок на дорожке */
    class ItemTrackElement {
        /**
         * @param {string} src путь к картинке
         * @param {array} classListWrapper массив css классов у элемента обертки img
         * @param {array} classListImage массив css классов элемента img
         * @param {number} number порядковый номер
         */
        constructor ( [ classListWrapper = [], classListImage = [] ], src = '', number = 0) {
            this.src = src;
            this.classListWrapper = classListWrapper;
            this.classListImage = classListImage;
            this.number = number;
        }

        /**
         * @description создает обертку картинки с картинкой и спиннером для загрузки внутри
         * @returns {node} готовый узел
         */
        createNodes () {
            const image = new Image();
            const wrapper = document.createElement('div');

            image.src = this.src;
            image.classList.add( ...this.classListImage );
            image.addEventListener('load', () => {
                wrapper.classList.add( CSS_CLASS_OPTION['loaded-track-image'] );
            });

            wrapper.classList.add( ...this.classListWrapper );
            wrapper.setAttribute('data-number', this.number);
            wrapper.appendChild(image);
            wrapper.innerHTML += utils.createSpinner();

            return wrapper;
        }

    }

    /**
     * @extends SliderLogic
     * @description Экземпляр класса дорожки картинок
     */
    class TrackSlider extends SliderLogic {
        /**
         * @param {string} location локация для галереи
         * @param {string} typeGallery вид галереи office/event/business
         */
        constructor (location = '', typeGallery = '') {
            super();

            this.location = location;
            this.typeGallery = typeGallery;

            this._postfixSrcImage = '';
            this._arrGalleryImg = [];
            this._arrTrackImg = [];
        }

        /**
         * @param {string} string в которой производим изменения
         * @param {string} substring подстрока которую вставить
         * @description вставка подстроки в строку
         */
        changeSrcImage (string, substring) {
            const delimiter = string.lastIndexOf('.');
            const arrSubstr = [string.slice(0, delimiter), string.slice(delimiter)];

            return `${arrSubstr[0]}${substring}${arrSubstr[1]}`;
        }

        /**
         * @param {string} substring подстрока на которую заменить
         * @description замена часть пути на подстроку
         */
        changeSrcImageTracking (substring = '') {
            [].map.call(this._cloneTrackElement.children, item => {
                const elem = item.querySelector('img');
                let src = elem.getAttribute('src');

                src = src.replace(this._postfixSrcImage , '');
                src = this.changeSrcImage(src, substring);

                elem.setAttribute('src', src);
            });
        }

        /** @description конкатенация путей картинок на дорожке с постфиксом минификации */
        addImageTracking () {
            this._arrTrackImg = this._arrGalleryImg.map( item => this.changeSrcImage(item, this._postfixSrcImage) );
        }

        /**
         * @param {array} arrSrcImg массив путей к картинкам
         * @param {string} title заголовок слайдера
         * @param {string} postfix постфикс для минифицированных картинок
         * @description преобразует данные с сервера/глобальных переменных(event_data/trip_data) к единому виду
         * @returns {object} преобразованный объект
         */
        changeDataSlider (arrSrcImg = [], title = '', postfix = '') {
            return {
                'gallery' : arrSrcImg,
                'postfix' : postfix,
                'titlePopup' : title
            };
        }

        /**
         * @description получение данных с сервера/глобальных переменных(event_data/trip_data)
         * @returns {promise} промис с данными
         */
        addDataSlider () {
            switch (this.typeGallery) {
                case NAME_TYPE_GALLERY['event'] :
                    return Promise.resolve()
                        .then( () => this.changeDataSlider(event_data.photo_links, event_data.subjects) )
                        .catch ( err => {
                            throw new Error(err);
                        } );

                case NAME_TYPE_GALLERY['business'] :
                    return Promise.resolve()
                            .then( () => this.changeDataSlider(trip_data.photo_links, trip_data.subjects) )
                            .catch ( err => {
                                throw new Error(err);
                            } );

                case NAME_TYPE_GALLERY['office'] :
                    return fetch('/gallery.json')
                            .then( data => data.json() )
                            .then( data => data[this.location] )
                            .catch ( err => {
                                throw new Error(err);
                            } );

                default :
                    return Promise.reject(new Error('Unknown gallery type'));
            }
        }

        /** @description фабричный метод. Создаёт экземпляры оберток с картинками и добавляет их в дорожку */
        createTemplateImage () {
            for (let i = 0; i < this._quantityAllImage; i++) {
                const classLists = [
                    CSS_CLASS_OPTION['default-wrapper-image'],
                    CSS_CLASS_OPTION['default-track-image']
                ];
                const item = new ItemTrackElement( classLists, this._arrTrackImg[i], i );

                this._cloneTrackElement.appendChild( item.createNodes() );
            }
        }

        /**
         * @description заполняет внутренние свойства, загружает асинхронно картинки
         * @returns {promise} промис с данными
         */
        loadedImage () {
            return this.addDataSlider()
                    .then( data => {
                        this._arrGalleryImg = [ ...data.gallery ];
                        this._quantityAllImage = this._arrGalleryImg.length;
                        this._postfixSrcImage = data.postfix;
                        this._title = data.titlePopup;

                        this.addImageTracking();
                        this.createTemplateImage();

                        return data;
                    })
                    .catch ( err => {
                        throw new Error(err);
                    } );
        }

        /** @description рендерит готовые узлы заменяя текущую дорожку, дорожкой готового объекта */
        appendTrackNodes () {
            const track = popupGalleryData.galleryTrack;

            popupGalleryData.galleryTrack.parentElement.replaceChild(this._cloneTrackElement, track);

            popupGalleryData.galleryTrack = this._cloneTrackElement;
        }
    }

    return {
        TrackSlider
    };
})();
