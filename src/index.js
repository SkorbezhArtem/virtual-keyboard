import Keyboard from './js/VirtualKeyboard';
import localStorage from './js/LocalStorage';
import keyboardRows from './js/languages/keyboardRows';

const lang = localStorage.get('lang', 'en');

const keyboard = new Keyboard(keyboardRows);
keyboard.init(lang);
