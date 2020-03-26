const classFieldError = 'field_error';

class FormManager {
    constructor (form, url) {
        this.form = form;
        this.dropzone = this._initDropzone;
        this.formType = form.dataset.type || 'defalut-form';
        this.validateFields = this._getRequireFields;
        this.url = url || '/api/...';
    }

    /**
     * @description получение обязательных полей формы
     */
    get _getRequireFields () {
        return Array.prototype.filter.call(this.form.elements, field => field.classList.contains('js--required'));
    }

    /**
     * @description инициализация дропзоны
     */
    get _initDropzone () {
        const dropzoneElement = this.form.querySelector('.js-dropzone');

        if (!dropzoneElement) { return null; }

        const buttonSubmit = this.form.querySelector('.js-form-submit');
        const onFileError = event => {
            event.preventDefault();

            this.dropzone.previewsContainer.classList.remove('dropzone__wrap_blink');
            void this.dropzone.previewsContainer.offsetWidth;
            this.dropzone.previewsContainer.classList.add('dropzone__wrap_blink');
        };
        const onSuccess = () => {
            buttonSubmit.removeEventListener('click', onFileError);
        };
        const onError = () => {
            buttonSubmit.addEventListener('click', onFileError);
        };

        return createDropzone(dropzoneElement, onSuccess, onError);
    }

    /**
     * @description получение файла в дропзоне
     */
    get _getFile () {
        return this.dropzone.files[0] || null;
    }

    /**
     * @description создание и заполнение formData
     * @returns {FormData: object} готовый объект
     */
    get _createDefaultFormData () {
        const formData = new FormData(this.form);

        formData.append('id', this.form.id);
        formData.append('first-point', window['first-entry-point']);
        formData.append('session-point', window['session-entry-point']);
        this.dropzone && formData.append('file', this._getFile);

        return formData;
    }

    /**
     * @description валидация отдельно взятого поля
     */
    _checkField (checks, value) {
        for (let i = 0; i < checks.length; i++) {
            const validator = FormManager.getValidator( checks[i] );
            const result = validator(value);

            if (result) {
                return true;
            }
        }

        return false;
    }

    /**
     * @description валидация обычной формы
     */
    _defaultValidation (arrFields) {
        const validateFields = arrFields || this.validateFields;
        let isValid = true;

        validateFields.forEach(field => {
            const checks = field.name.split(' ');
            const result = this._checkField(checks, field.value);

            if (!result) {
                isValid = false;
            }

            field.parentElement.classList.toggle(classFieldError, !isValid);
        });

        return isValid;
    }

    /**
     * @description валидация полей для контактов. Необходимо для валидации корпоративной формы
     */
    _contactFieldsValidation (fields) {
        for (let i = 0; i < fields.length; i++) {
            const field = fields[i];
            const checks = field.name.split(' ');
            const result = this._checkField(checks, field.value);

            if (result) {
                return true;
            }
        }

        fields.forEach(item => item.parentElement.classList.add(classFieldError));

        return false;
    }

    /**
     * @description распределение типов полей на поля контактов - phone/email
     * и остальные. Необходимо для валидации корпоративной формы
     */
    _filterFields () {
        const fields = {
            contacts : [],
            other : []
        };

        this.validateFields.forEach(field => {
            if (field.name === 'phone' || field.name === 'email') {
                fields.contacts.push(field);

            } else {
                fields.other.push(field);
            }
        });

        return fields;
    }

    /**
     * @description валидация корпоративной формы
     */
    _corporateValidation () {
        const fields = this._filterFields();
        const otherFieldValid = this._defaultValidation(fields.other);
        const contactFieldsVaild = otherFieldValid ?
            this._contactFieldsValidation(fields.contacts) :
            this._defaultValidation(fields.contacts);

        return otherFieldValid && contactFieldsVaild;
    }

    /**
     * @description включение необходимой валидации
     */
    formValidation () {
        switch (this.formType) {
            case 'email-phone-separation' :
                return this._corporateValidation();

            default :
                return this._defaultValidation();
        }
    }

    /**
     * @description сброс данных полей формы
     */
    _formReset() {
        const textAreaActive = this.form.querySelector('.control__field_focus');

        if ( this.dropzone && this.dropzone.element.classList.contains('dz-started') ) {
            this.dropzone.element.classList.remove('dz-started');
            this.dropzone.element.querySelector('.dz-file-preview').style.display = 'none';
            this.dropzone.removeAllFiles(true);
        }

        if (textAreaActive) {
            const buttonClose = textAreaActive.querySelectorAll('.js-close-textarea, .control__button-close');

            textAreaActive.classList.remove('control__field_focus');
            buttonClose.forEach(button => {
                button.style.display = 'none';
            });
        }

        this.form.reset();
    }

    /**
     * @description проверка наличия файла в форме
     */
    _checkFile () {
        return this.dropzone && this.dropzone.files[0];
    }

    /**
     * @description проверка типа формы для триггеров аналитики
     */

    _checkFormType () {
        if (this.formType === 'email-phone-separation') {
            window.dataLayer.push({
                'event': 'form-footer'
            });
        }
    }

    /**
     * @description логика отправки давнных
     * @returns {boolean} успешная/безуспешная отправка
     */
    onSubmit () {
        return new Promise((resolve, reject) => {
            const fastSending = this._checkFile();
            const formData = this._createDefaultFormData;
            const xhr = new XMLHttpRequest();

            xhr.open('POST', this.url);
            xhr.addEventListener('loadstart', () => {

                if (fastSending) {
                    this._formReset();
                    FormManager.sendSuccess();

                    return;
                }

                FormManager.formStateToggle(this.form);
            });
            xhr.addEventListener('readystatechange', () => {
                if ( fastSending || xhr.readyState !== 4 ) { return; }

                if (xhr.status >= 200 && xhr.status < 300) {
                    this._formReset();
                    FormManager.sendSuccess();
                    resolve(true);

                } else {
                    reject();
                }
            });
            xhr.send(formData);
        });
    }

    /**
     * @description обработчик отправки данных
     */
    submitFormHandler = async event => {
        event.preventDefault();
        const isValid = this.formValidation();

        if (!isValid) { return; }
        try {
            const response = await this.onSubmit();
            response && this._checkFormType();
            !response && FormManager.sendFail();

        } catch (err) {
            FormManager.sendFail();
        }

        FormManager.formStateToggle(this.form, false);
    }

    /**
     * @description переключение состояния формы active/disable
     * @param {node} form форма
     * @param {boolean} value значение переключения состояния формы
     */
    static formStateToggle (form, value = true) {
        const htmlElement = document.querySelector('html');
        const popupDisable = document.querySelector('.js-popup-disable');

        Array.prototype.forEach.call(form.elements, element => element.disabled = value);

        htmlElement.classList.toggle('js-disable-lock', value);
        popupDisable.classList.toggle('popup-disable_active', value);

        value ? $(popupDisable).fadeIn() : $(popupDisable).fadeOut();
    }

    /**
     * @description коллбэк успешной отправки
     * @param {boolean} disable блокатор отображения дефолтного попапа
     */
    static sendSuccess (disable) {
        document.dispatchEvent(formSendEvent);

        if (!disable) {
            popupControl.saveWidthFixedElements();
            popupControl.showPopup($('#popup-success'));
        }
    }

    /**
     * @description коллбэк безуспешной отправки
     */
    static sendFail () {
        popupControl.saveWidthFixedElements();
        popupControl.showPopup($('#popup-error'));
    }

    /**
     * @description получение необходимого валиидатора
     * @param {string} name имя валидатора
     */
    static getValidator (name) {
        switch (name) {
            case 'email' :
                return FormManager.checkEmail;

            case 'phone' :
                return FormManager.checkPhone;

            case 'url' :
                return FormManager.checkUrl;

            case 'file' :
                return FormManager.checkFile;

            default: return null;
        }
    }

    /**
     * @description валидатор поля ввода email
     * @param {string} value данные поля
     */
    static checkEmail (value) {
        const expName = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@/;
        const expHost = /((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-z]{2,6}))$/;
        const regExp = new RegExp(expName.source + expHost.source);

        return regExp.test(value);
    }

    /**
     * @description валидатор поля ввода phone
     * @param {string} value данные поля
     */
    static checkPhone (value) {
        const regExp = /^(\+{0,1})([0-9]{5,15})$/;

        return regExp.test(value);
    }

    /**
     * @description валидатор поля ввода url
     * @param {string} value данные поля
     */
    static checkUrl (value) {
        const regExp = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/gm;

        return regExp.test(value);
    }

    /**
     * @description валидатор поля для файлов
     */
    static checkFile () {
        return false;
    }
}

window.formList = {};

document.addEventListener('DOMContentLoaded', () => {
    Array.prototype.forEach.call(document.forms, form => {
        if (!form.id || window.formList[form.id]) { return; }

        const formObject = new FormManager(form);

        window.formList[form.id] = formObject;

        form.addEventListener('submit', formObject.submitFormHandler);
    } );
});
