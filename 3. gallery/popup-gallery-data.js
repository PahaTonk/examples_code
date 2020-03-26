/* eslint-disable no-unused-vars */
const popupGalleryData = (function () {
    const CSS_CLASS_OPTION = {
        'slide-prev-scroll-dot' : 'js-slide-prev-scroll-image',
        'acive-popup-spinner' : 'lds-ring-active',
        'full-image' : 'photo-gallery_full_image',
        'loaded-full-image' : 'photo-gallery__full-image_loaded',
        'active-track-element' : 'js-active-wrapper',
        'loaded-track-image' : 'photo-gallery__image_loaded',
        'default-wrapper-image' : [
            'photo-gallery__secondary-slide',
            'photo-gallery__wrapper',
            'track__wrapper-image',
            'js-wrapper-image'
        ],
        'default-track-image' : ['photo-gallery__image', 'track__image', 'js-track-image'],
        'interactive-dot' : 'js-next-track',
        'last-interactive-dot' : 'js-end-track',
        'button-arrow-right' : 'js-right',
        'button-arrow-left' : 'js-left'
    };
    const GALLERY_POPUP = document.querySelector('.js-popup-gallery');
    const GALLERY_ACTIVE_ZONE = GALLERY_POPUP.querySelector('.js-active-zone');
    const GALLERY_PAGINATION = GALLERY_POPUP.querySelector('.js-gallery-pagination');

    return {
        //начальные опции
        QUANTITY_VISIBLE_IMAGE : 8,
        MIN_WIDTH_IMAGE : 80,
        CSS_CLASS_OPTION : CSS_CLASS_OPTION,
        NAME_TYPE_GALLERY : {
            'event' : 'event',
            'business' : 'business',
            'office' : 'office'
        },

         // элементы галереи
        GALLERY_POPUP : GALLERY_POPUP,
        GALLERY_TITLE : GALLERY_POPUP.querySelector('.js-gallery-title'),
        GALLERY_ACTIVE_ZONE : GALLERY_ACTIVE_ZONE,
        GALLERY_FULL_IMAGE_WRAPPER : GALLERY_POPUP.querySelector('.js-gallery-full-image-wrapper'),
        GALLERY_PAGINATION : GALLERY_PAGINATION,
        GALLERY_PAGINATION_START : GALLERY_PAGINATION.querySelector('.js-start-number'),
        GALLERY_PAGINATION_END : GALLERY_PAGINATION.querySelector('.js-end-number'),
        GALLERY_BUTTON_LEFT : GALLERY_POPUP.querySelector( `.${CSS_CLASS_OPTION['button-arrow-left']}` ),
        GALLERY_BUTTON_RIGHT : GALLERY_POPUP.querySelector( `.${CSS_CLASS_OPTION['button-arrow-right']}` ),

         // изменяемые элементы галереи
        galleryFullImage : GALLERY_POPUP.querySelector( `.${CSS_CLASS_OPTION['full-image']}` ),
        galleryTrack : GALLERY_POPUP.querySelector('.js-gallery-track'),

         // общие данные
        arrPopupGalleries : [],
        countPrecentWidth : 0,
        windowWidth : window.innerWidth,
        currentPopupGallery : '',
        trackVisibleWidth : +GALLERY_ACTIVE_ZONE.offsetWidth
    };
})();



