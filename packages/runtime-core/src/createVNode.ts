import { isString, ShapeFlags } from "../../shared/src/index.js";

export function isVnode(val) {
  return !!(val && val.__v_isVNode);
}

export function createVNode(type, props?, children?: any[] | string) {
  const shapeFlag = isString(type) ? ShapeFlags.ELEMENT : 0;

  const vnode = {
    shapeFlag,
    __v_isVNode: true,
    type,
    props,
    key: props && props.key,
    el: null,
    children,
  };

  if (children) {
    let type = 0;
    if (Array.isArray(children)) {
      type = ShapeFlags.ARRAY_CHILDREN;
    } else {
      type = ShapeFlags.TEXT_CHILDREN;
    }

    vnode.shapeFlag |= type;
  }

  return vnode;
}
