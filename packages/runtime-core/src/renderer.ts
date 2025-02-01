import { ShapeFlags } from "../../shared/src/index.js";

export function createRenderer(options) {
  let {
    insert: hostInsert,
    remove: hostRemove,
    createElement: hostCreatElement,
    createText: hostCreateText,
    setText: hostSetText,
    setElementText: hostSetElementText,
    parentNode: hostParentNode,
    nextSibling: hostNextSibling,
    patchProp: hostPatchProp,
  } = options;

  function mountChildren(children, container) {
    for (let i = 0; i < children.length; i++) {
      patch(null, children[i], container);
    }
  }

  function mountElement(vnode, container) {
    const { type, props, shapeFlag, children } = vnode;
    const el = (vnode.el = hostCreatElement(type));
    if (props) {
      for (const key in props) {
        hostPatchProp(el, key, null, props[key]);
      }
    }
    if (ShapeFlags.ARRAY_CHILDREN & shapeFlag) {
      mountChildren(children, el);
    } else {
      hostSetElementText(el, children);
    }

    hostInsert(el, container);
  }
  function patchElement(vnode, nextNode, container) {}

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
    },
  };
}
