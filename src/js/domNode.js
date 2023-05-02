export default function domNode(node, className = '', children = [], parent = null, ...dataAttr) {
  const element = document.createElement(node);

  if (className) element.classList.add(...className.split(' '));

  if (Array.isArray(children)) {
    children.forEach((child) => {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else if (child instanceof Node) {
        element.append(child);
      }
    });
  } else if (typeof children === 'string') {
    element.innerHTML = children;
  } else if (children instanceof Node) {
    element.append(children);
  }

  if (parent instanceof Node) parent.append(element);

  dataAttr.forEach(([dataName, dataValue]) => {
    if (dataValue === '') {
      element.setAttribute(dataName, '');
    } else if (['id', 'value', 'cols', 'placeholder', 'rows', 'autocorrect', 'spellcheck'].includes(dataName)) {
      element.setAttribute(dataName, dataValue);
    } else {
      element.dataset[dataName] = dataValue;
    }
  });

  return element;
}
