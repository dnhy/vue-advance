// packages/runtime-dom/src/nodeOps.ts
var nodeOps = {
  insert(el, parent, anchor) {
    return parent.insertBefore(el, anchor || null);
  },
  remove(el) {
    const parent = el.parentNode;
    if (parent) {
      parent.removeChild(el);
    }
  },
  createElement(type) {
    return document.createElement(type);
  },
  createText(text) {
    return document.createTextNode(text);
  },
  setText(node, text) {
    return node.nodeValue = text;
  },
  setElementText(node, text) {
    return node.nodeValue = text;
  },
  parentNode(node) {
    return node.parentNode;
  },
  nextSibling(node) {
    return node.nextSibling;
  }
};

// packages/runtime-dom/src/props.ts
function patchStyle(el, prevValue, nextValue) {
  const style = el["style"];
  if (nextValue) {
    for (const key in nextValue) {
      style[key] = nextValue[key];
    }
  }
  if (prevValue) {
    for (const key in prevValue) {
      if (nextValue[key] == null) {
        style[key] = null;
      }
    }
  }
}
function patchClass(el, nextValue) {
  if (nextValue === null) {
    el.removeAttribute("class");
  } else {
    el.className = nextValue;
  }
}
function createInvoker(val) {
  const invoker = (e) => invoker.val(e);
  invoker.val = val;
  return invoker;
}
function patchEvent(el, eventName, nextValue) {
  const invokers = el._evi || (el._evi = {});
  const exists = invokers[eventName];
  if (exists && nextValue) {
    exists.val = nextValue;
  } else {
    const name = eventName.slice(2).toLowerCase();
    if (nextValue) {
      const invoker = createInvoker(nextValue);
      invokers[eventName] = invoker;
      el.addEventListener(name, invoker);
    } else if (exists) {
      el.removeEventListner(name, exists);
      invokers[eventName] = null;
    }
  }
}
function patchAttr(el, key, nextValue) {
  if (nextValue === null) {
    el.removeAttribute(key);
  } else {
    el.setAttribute(key, nextValue);
  }
}
function patchProp(el, key, prevValue, nextValue) {
  if (key === "style") {
    return patchStyle(el, prevValue, nextValue);
  } else if (key === "class") {
    return patchClass(el, nextValue);
  } else if (/on[^a-z]/.test(key)) {
    return patchEvent(el, key, nextValue);
  } else {
    return patchAttr(el, key, nextValue);
  }
}

// packages/runtime-core/src/renderer.ts
function createRenderer(options) {
  return {
    render(vdom, container) {
    }
  };
}

// packages/runtime-core/src/h.ts
function h() {
}

// packages/runtime-dom/src/index.ts
var renderOptions = { ...nodeOps, patchProp };
function render(vdom, container) {
  const { render: render2 } = createRenderer(renderOptions);
  render2({}, container);
}
export {
  createRenderer,
  h,
  render
};
//# sourceMappingURL=runtime-dom.js.map
