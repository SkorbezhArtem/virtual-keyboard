class DOMNode {
  constructor(tagName, attributes = {}, children = []) {
    this.tagName = tagName;
    this.attributes = attributes;
    this.children = children;
  }

  create() {
    const element = document.createElement(this.tagName);

    Object.entries(this.attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });

    this.children.forEach((child) => {
      if (child instanceof DOMNode) {
        element.appendChild(child.create());
      } else {
        element.appendChild(document.createTextNode(child));
      }
    });

    return element;
  }
}

const divNode = new DOMNode('div', { class: 'container' }, [
  new DOMNode('h1', { class: 'title' }, ['Virtual Keyboard']),
  new DOMNode('p', { class: 'subtitle' }, ['The keyboard was created in the OC Windows']),
  new DOMNode('p', { class: 'subtitle' }, ['Switch language: Left Alt + Shift']),
  new DOMNode('textarea', { class: 'textarea' }, []),
]);

const domElement = divNode.create();
document.body.appendChild(domElement);
