import createDomNode from './domNode';

export default class Key {
  constructor({ key, shift, code }) {
    this.key = key;
    this.shift = shift;
    this.code = code;
    this.isFnKey = Boolean(key.match(/Tab|Caps|Shift|Ctrl|Alt|Enter|Back|Del|arr|En|Ru/));

    this.keyShift = createDomNode('div', 'key-shift', shift && shift.match(/[^0-9a-zA-Zа-яА-ЯёЁ]/) ? shift : '');
    this.keyTitle = createDomNode('div', 'key-title', key);
    this.keyContainer = createDomNode('div', 'keyboard__key', [this.keyShift, this.keyTitle], null, ['code', this.code], ['fn', String(this.isFnKey)]);
  }
}
