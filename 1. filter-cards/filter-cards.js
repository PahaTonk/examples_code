const API = '/api/...';
const FILTER_CSS = {
    filter_wrapper: 'js-filters',
    filtered_tags_wrapper : 'js-active-tags-wrapper',
    filtered_tags_list : 'js-list-active-tags',
    cases_wrapper : 'js-list-cases',
    popup_tag : 'js-popup-tags',

    tag_button : 'js-tag',
    filtered_tag_button : 'js-active-tag',
    other_tags_button : 'js-hidden-tags',
    close_popup_button : 'js-close-popup',
    clear_active_tags_button : 'js-clear-tags-list',

    show_popup_tag : 'tag-popup_active',
    show_filtered_tags : 'technologies-filter__wrapper_active'
};

/**
 * @description класс предназначен для управления логикой
 * фильтрации карточек проектов
 * @param {Node} casesWrapper контейнер в который рендерятся карточки
 * @param {Node} activeTagsList список включенных фильтров
 * @param {String} templateButton шаблон кнопки фильтра
 */
class FilterCards {
    constructor (casesWrapper, activeTagsWrapper, templateButton) {
        this._casesWrapper = casesWrapper;
        this._activeTagsWrapper = activeTagsWrapper;
        this._activeTagsList = activeTagsWrapper.querySelector(`.${FILTER_CSS.filtered_tags_list}`);
        this._templateButton = templateButton;

        this._activeFilters = new Map();
        this._savedTemplates = new Map();
    }

    /**
     * @description проверка наличия выбранных тегов
     * @returns {Boolean} теги выбраны/не выбраны
     */
    get _isActiveFilter() {
        return !!this._activeFilters.size;
    }

    /**
     * @description получить список выбранных тегов
     * (сортировка для приведения к единому виду ключей при сохранении шаблона)
     * @returns {Array} список актуальных фильтров
     */
    get _tagsList() {
        const isEmptyList = !this._isActiveFilter;

        return isEmptyList ? ['default'] : [ ...this._activeFilters.keys() ].sort();
    }

    /**
     * @description отправляет запрос на сервер, получает шаблон и сохраняет его
     * @param {JSON} filters выбранные фильтры
     * @param {String} url адрес запроса за разметкой
     * @returns {String} готовая разметка для рендера
     */
    _getTemplate = async (filters, url) => {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: filters
        });

        if (!response.ok) {return false;}
        const template = await response.text();

        this._savedTemplates.set(filters, template);
        return template;
    }

    /**
     * @description проверяет сохранен ли уже шаблон по данному ключу
     * @param {JSON} key ключ к шаблону
     * @returns {JSON||Boolean} шаблон или false
     */
    _checkSavedTemplate(key) {
        const isSaved = this._savedTemplates.has(key);

        return isSaved ? this._savedTemplates.get(key) : false;
    }

    /**
     * @description рендерит готоый шаблон с карточками
     */
    _renderTemplate = async () => {
        const activeFilters = JSON.stringify({filters: this._tagsList});
        const template = this._checkSavedTemplate(activeFilters) || await this._getTemplate(activeFilters, API);

        if (!template) {return;}

        this._casesWrapper.innerHTML = template;
        /**Включение lazy loading (init.js)*/
        lazyFallback();
    }

    /**
     * @description проверка состояния блока с выбранными фильтрами (активно/не активно)
     */
    _checkStateFilterWrapper() {
        const isActive = this._isActiveFilter;

        this._activeTagsWrapper.classList.toggle(FILTER_CSS.show_filtered_tags, isActive);
    }

    /**
     * @description добавляет новый фильтр в список выбранных и запоминает
     * ссылку на элемент в DOM (генератор)
     * @param {String} filter выбранный фильтр
     */
    * _addFilterToList(filter) {
        const templateButton = utils.compileTemplate(this._templateButton, { filter });
        const buttonElement = utils.convertToDOMElement(templateButton);

        this._activeFilters.set(filter, buttonElement);
        yield this._activeTagsList.appendChild(buttonElement);
        this._checkStateFilterWrapper();
    }

    /**
     * @description удаляет фильтр из списка выбранных и удаляет
     * ссылку на элемент в DOM (генератор)
     * @param {String} filter выбранный фильтр
     */
    * _deleteFilterFromList(filter) {
        const buttonElement = this._activeFilters.get(filter);

        this._activeFilters.delete(filter);
        yield this._checkStateFilterWrapper();
        this._activeTagsList.removeChild(buttonElement);
    }

    /**
     * @description добавление одного фильтра
     */
    _addedFilterHandler = async ({ target }) => {
        const tag = target.closest(`.${FILTER_CSS.tag_button}`);

        if (!tag) {return;}
        const filter = tag.dataset.filter.trim();

        if (this._activeFilters.has(filter)) {return;}
        const generator = this._addFilterToList(filter);

        generator.next();
        await this._renderTemplate();
        generator.next();
    }

    /**
     * @description удаление одного фильтра
     */
    _removeFilterHandler = async ({ target }) => {
        const activeTag = target.closest(`.${FILTER_CSS.filtered_tag_button}`);

        if (!activeTag) {return;}

        const filter = activeTag.dataset.filter.trim();
        const generator = this._deleteFilterFromList(filter);

        generator.next();
        await this._renderTemplate();
        generator.next();
    }

    /**
     * @description сброс всех фильтров
     */
    _resetFiltersHandler = async ({ target }) => {
        const clearAllButton = target.closest(`.${FILTER_CSS.clear_active_tags_button}`);

        if (!clearAllButton) {return;}

        this._activeFilters.clear();
        this._activeTagsList.innerHTML = '';
        await this._renderTemplate();
        this._checkStateFilterWrapper();
    }

    /**
     * @description показывает попап оставшихся фильтров
     */
    _showPopupFiltersHandler = ({ target }) => {
        if (!target.classList.contains(FILTER_CSS.other_tags_button)) {return;}
        const popup = target.querySelector(`.${FILTER_CSS.popup_tag}`);

        popup.classList.add(FILTER_CSS.show_popup_tag);
    }

    /**
     * @description скрывает попап оставшихся фильтров
     */
    _hidePopupFiltersHandler = ({ target }) => {
        if (!target.classList.contains(FILTER_CSS.close_popup_button)) {return;}
        const popup = target.closest(`.${FILTER_CSS.popup_tag}`);

        popup.classList.remove(FILTER_CSS.show_popup_tag);
    }

    /**
     * @description навешивает обработчики на элементы для управления фильтром
     */
    _filterManagement() {
        this._casesWrapper.addEventListener('click', this._showPopupFiltersHandler);
        this._casesWrapper.addEventListener('click', this._hidePopupFiltersHandler);
        this._casesWrapper.addEventListener('click', this._addedFilterHandler);
        this._activeTagsList.addEventListener('click', this._removeFilterHandler);
        this._activeTagsWrapper.addEventListener('click', this._resetFiltersHandler);
    }

    /**
     * @description инициализация работы фильра
     */
    async initFilter() {
        await this._renderTemplate();
        this._filterManagement();
    }
}

(async function() {
    const casesWrapper = document.querySelector(`.${FILTER_CSS.cases_wrapper}`);
    const activeTagsWrapper = document.querySelector(`.${FILTER_CSS.filtered_tags_wrapper}`);
    const response = await fetch('/cards.htm');
    const templateButton = await response.text();

    const ourProjectFilter = new FilterCards(casesWrapper, activeTagsWrapper, templateButton);
    ourProjectFilter.initFilter();
})();
