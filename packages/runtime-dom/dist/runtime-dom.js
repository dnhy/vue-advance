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
    return node.textContent = text;
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

// packages/shared/src/index.ts
function isObject(val) {
  return typeof val === "object" && val !== null;
}
function isString(val) {
  return typeof val === "string";
}

// packages/runtime-core/src/renderer.ts
function createRenderer(options) {
  let {
    insert: hostInsert,
    remove: hostRemove,
    createElement: hostCreatElement,
    createText: hostCreateText,
    setText: hostSetText,
    setElementText: hostSetElementText,
    parentNode: hostParentNode,
    nextSibling: hostNextSibling,
    patchProp: hostPatchProp
  } = options;
  function mountChildren(children, container) {
    for (let i = 0; i < children.length; i++) {
      patch(null, children[i], container);
    }
  }
  function mountElement(vnode, container) {
    const { type, props, shapeFlag, children } = vnode;
    const el = vnode.el = hostCreatElement(type);
    if (props) {
      for (const key in props) {
        hostPatchProp(el, key, null, props[key]);
      }
    }
    if (16 /* ARRAY_CHILDREN */ & shapeFlag) {
      mountChildren(children, el);
    } else {
      hostSetElementText(el, children);
    }
    hostInsert(el, container);
  }
  function patchElement(vnode, nextNode, container) {
  }
  function unmount(vnode) {
    hostRemove(vnode);
  }
  function patch(prevNode, nextNode, container) {
    if (prevNode == null) {
      mountElement(nextNode, container);
    } else {
      patchElement(prevNode, nextNode, container);
    }
  }
  return {
    render(vnode, container) {
      if (vnode === null) {
        unmount(vnode.el);
      } else {
        const prevNode = container._vnode || null;
        const nextNode = vnode;
        patch(prevNode, nextNode, container);
        container._vnode = nextNode;
      }
    }
  };
}

// packages/runtime-core/src/createVNode.ts
function isVnode(val) {
  return !!(val && val.__v_isVNode);
}
function createVNode(type, props, children) {
  const shapeFlag = isString(type) ? 1 /* ELEMENT */ : 0;
  const vnode = {
    shapeFlag,
    __v_isVNode: true,
    type,
    props,
    key: props && props.key,
    el: null,
    children
  };
  if (children) {
    let type2 = 0;
    if (Array.isArray(children)) {
      type2 = 16 /* ARRAY_CHILDREN */;
    } else {
      type2 = 8 /* TEXT_CHILDREN */;
    }
    vnode.shapeFlag |= type2;
  }
  return vnode;
}

// packages/runtime-core/src/h.ts
function h(type, propsOrChildren, children) {
  const len = arguments.length;
  if (len == 2) {
    if (isObject(propsOrChildren) && !Array.isArray(propsOrChildren)) {
      if (isVnode(propsOrChildren)) {
        return createVNode(type, null, [propsOrChildren]);
      } else {
        return createVNode(type, propsOrChildren);
      }
    } else {
      return createVNode(type, null, propsOrChildren);
    }
  } else {
    if (len > 3) {
      children = Array.from(arguments).slice(2);
    } else {
      if (len == 3 && isVnode(children)) {
        children = [children];
      }
    }
    return createVNode(type, propsOrChildren, children);
  }
}

// packages/runtime-dom/src/index.ts
var renderOptions = { ...nodeOps, patchProp };
function render(vdom, container) {
  const { render: render2 } = createRenderer(renderOptions);
  render2(vdom, container);
}
export {
  createRenderer,
  h,
  render
};
//# sourceMappingURL=runtime-dom.js.map
