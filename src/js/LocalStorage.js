class LocalStorage {
  constructor() {
    this.storage = window.localStorage;
  }

  set(key, value) {
    this.storage.setItem(key, value);
  }

  get(key, subst = null) {
    return this.storage.getItem(key) || subst;
  }

  del(key) {
    this.storage.removeItem(key);
  }
}

const localStorage = new LocalStorage();
export default localStorage;
