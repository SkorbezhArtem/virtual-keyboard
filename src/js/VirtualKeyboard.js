import domNode from './domNode';
import localStorage from './LocalStorage';
import Key from './Key';
import lang from './languages/index';

const container = domNode('div', 'container', [
  domNode('h1', 'title', 'Virtual Keyboard'),
  domNode('p', 'subtitle', 'The keyboard was created in the Windows OS'),
  domNode('p', 'subtitle', 'Press Ctrl + Alt to change language'),
]);

const textarea = domNode('textarea', 'textarea', null, container, ['placeholder', 'Start type something...']);

export default class Keyboard {
  constructor(keyboardRows) {
    this.keyboardRows = keyboardRows;
    this.isCaps = false;
  }

  init(langCode) {
    this.keyBase = lang[langCode];
    this.textarea = textarea;
    this.container = domNode('div', 'keyboard', null, container, ['lang', langCode]);
    document.body.prepend(container);
    this.renderLayout();
    return this;
  }

  renderLayout() {
    this.keyButtons = [];
    this.keyboardRows.forEach((row, idx) => {
      const rowItem = domNode('div', 'keyboard__row', null, this.container, ['row', idx + 1]);
      row.forEach((code) => {
        const keyObj = this.keyBase.find((key) => key.code === code);
        if (keyObj) {
          const keyBtn = new Key(keyObj);
          this.keyButtons.push(keyBtn);
          rowItem.append(keyBtn.keyContainer);
        }
      });
    });
    document.addEventListener('keydown', this.handleEvent);
    document.addEventListener('keyup', this.handleEvent);
    this.container.addEventListener('mousedown', this.preHandleEvent);
    this.container.addEventListener('mouseup', this.preHandleEvent);
  }

  preHandleEvent = (event) => {
    event.stopPropagation();
    const keyDiv = event.target.closest('.keyboard__key');
    if (!keyDiv) return;
    const { dataset: { code } } = keyDiv;
    keyDiv.addEventListener('mouseleave', this.resetButtonState);
    this.handleEvent({ code, type: event.type });
  };

  resetButtonState = ({ target: { dataset: { code } } }) => {
    const keyObject = this.keyButtons.find((key) => key.code === code);
    if (!this.isCaps) keyObject.keyContainer.classList.remove('active');
    keyObject.keyContainer.removeEventListener('mouseleave', this.resetButtonState);
  };

  handleEvent = (event) => {
    if (event.stopPropagation) event.stopPropagation();

    const { code, type } = event;
    const keyObject = this.keyButtons.find((key) => key.code === code);

    if (!keyObject) return;

    this.textarea.focus();

    if (type.match(/keydown|mousedown/)) {
      if (type.includes('key')) event.preventDefault();

      keyObject.keyContainer.classList.add('active');

      if (code.includes('Shift')) this.shiftKey = true;
      if (this.shiftKey) this.switchToUpperCase(true);

      if (code.includes('Caps') && !this.isCaps) {
        this.isCaps = true;
        this.switchToUpperCase(true);
      } else if (code.includes('Caps') && this.isCaps) {
        this.isCaps = false;
        this.switchToUpperCase(false);
        keyObject.keyContainer.classList.remove('active');
      }

      if (['Control', 'Alt', 'Caps'].includes(code) && event.repeat) return;

      if (code.includes('Control')) this.ctrlKey = true;
      if (code.includes('Alt')) this.altKey = true;
      if (code.includes('ControlLeft') && this.altKey) this.changeLang();
      if (code.includes('AltLeft') && this.ctrlKey) this.changeLang();
      if (code.includes('ControlRight') && this.altKey) this.changeLang();
      if (code.includes('AltRight') && this.ctrlKey) this.changeLang();

      if (!this.isCaps) {
        this.printToTextarea(keyObject, this.shiftKey
          ? keyObject.shift
          : keyObject.key);
      } else if (this.isCaps) {
        if (this.shiftKey) {
          this.printToTextarea(keyObject, keyObject.keyShift.innerHTML
            ? keyObject.shift
            : keyObject.key);
        } else {
          this.printToTextarea(keyObject, !keyObject.keyShift.innerHTML
            ? keyObject.shift
            : keyObject.key);
        }
      }
    } else if (type.match(/keyup|mouseup/)) {
      if (code.includes('Shift')) {
        this.shiftKey = false;
        this.switchToUpperCase(false);
      }
      if (code.includes('Control')) this.ctrlKey = false;
      if (code.includes('Alt')) this.altKey = false;
      if (!code.includes('Caps')) keyObject.keyContainer.classList.remove('active');
    }
  };

  changeLang = () => {
    const langs = Object.keys(lang);
    let langIndex = langs.indexOf(this.container.dataset.lang);
    this.keyBase = langIndex + 1 < langs.length
      ? lang[langs[langIndex += 1]]
      : lang[langs[langIndex = 0]];
    this.container.dataset.lang = langs[langIndex];
    localStorage.set('lang', langs[langIndex]);

    this.keyButtons.forEach((item) => {
      const button = item;
      const keyObject = this.keyBase.find((key) => key.code === item.code);
      if (!keyObject) return;
      button.shift = keyObject.shift;
      button.key = keyObject.key;
      if (keyObject.shift && keyObject.shift.match(/[^0-9a-zA-Zа-яА-ЯёЁ]/)) {
        button.keyShift.innerHTML = keyObject.shift;
      } else {
        button.keyShift.innerHTML = '';
      }
      button.keyTitle.innerHTML = keyObject.key;
    });
    if (this.isCaps) this.switchToUpperCase(true);
  };

  switchToUpperCase(isTrue) {
    if (isTrue) {
      this.keyButtons.forEach((item) => {
        const button = item;
        if (button.keyShift && this.shiftKey) {
          button.keyShift.classList.add('key-shift_active');
          button.keyTitle.classList.add('key-shift_inactive');
        }
        if (!button.isFnKey && this.isCaps && !this.shiftKey && !button.keyShift.innerHTML) {
          button.keyTitle.innerHTML = button.shift;
        } else if (!button.isFnKey && this.isCaps && this.shiftKey) {
          button.keyTitle.innerHTML = button.key;
        } else if (!button.isFnKey && !button.keyShift.innerHTML) {
          button.keyTitle.innerHTML = button.shift;
        }
      });
    } else {
      this.keyButtons.forEach((item) => {
        const button = item;
        if (button.keyShift.innerHTML && !button.isFnKey) {
          button.keyShift.classList.remove('key-shift_active');
          button.keyTitle.classList.remove('key-shift_inactive');
          if (!this.isCaps) {
            button.keyTitle.innerHTML = button.key;
          }
        } else if (!button.isFnKey) {
          if (this.isCaps) {
            button.keyTitle.innerHTML = button.shift;
          } else {
            button.keyTitle.innerHTML = button.key;
          }
        }
      });
    }
  }

  printToTextarea(keyObject, symbol) {
    const cursorPosition = this.textarea.selectionStart;
    const left = this.textarea.value.slice(0, cursorPosition);
    const right = this.textarea.value.slice(cursorPosition);
    const selectionLength = this.textarea.selectionEnd - this.textarea.selectionStart;
    const fnButtonsHandler = {
      Tab: () => {
        this.insertText(`${left}\t${right.slice(selectionLength)}`, cursorPosition + 1);
      },
      ArrowLeft: () => {
        this.insertText(`${left}⇐${right.slice(selectionLength)}`, cursorPosition + 1);
      },
      ArrowRight: () => {
        this.insertText(`${left}⇒${right.slice(selectionLength)}`, cursorPosition + 1);
      },
      ArrowUp: () => {
        this.insertText(`${left}⇑${right.slice(selectionLength)}`, cursorPosition + 1);
      },
      ArrowDown: () => {
        this.insertText(`${left}⇓${right.slice(selectionLength)}`, cursorPosition + 1);
      },
      Enter: () => {
        this.insertText(`${left}\n${right.slice(selectionLength)}`, cursorPosition + 1);
      },
      Delete: () => {
        if (selectionLength > 0) {
          this.insertText(`${left}${right.slice(selectionLength)}`, cursorPosition);
        } else {
          this.insertText(`${left}${right.slice(1)}`, cursorPosition);
        }
      },
      Backspace: () => {
        if (selectionLength > 0) {
          this.insertText(`${left}${right.slice(selectionLength)}`, cursorPosition);
        } else {
          this.insertText(`${left.slice(0, -1)}${right}`, cursorPosition - 1);
        }
      },
      Space: () => {
        this.insertText(`${left} ${right.slice(selectionLength)}`, cursorPosition + 1);
      },
      Lang: () => {
        this.changeLang();
      },
    };
    if (fnButtonsHandler[keyObject.code]) {
      fnButtonsHandler[keyObject.code]();
    } else if (!keyObject.isFnKey) {
      this.insertText(`${left}${symbol || ''}${right.slice(selectionLength)}`, cursorPosition + 1);
    }
  }

  insertText(text, position) {
    this.textarea.value = text;
    this.textarea.setSelectionRange(position, position);
  }
}
