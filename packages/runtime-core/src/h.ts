import { isObject } from "../../shared/src/index.js";
import { createVNode, isVnode } from "./createVNode.js";

export function h(type, propsOrChildren?, children?) {
  //createElement用户创建虚拟dom的方法
  const len = arguments.length;
  if (len == 2) {
    if (isObject(propsOrChildren) && !Array.isArray(propsOrChildren)) {
      if (isVnode(propsOrChildren)) {
        // const vDom = h("div", h("span", "123"));
        return createVNode(type, null, [propsOrChildren]);
      } else {
        // const vDom = h("div", { style: { color: "red" } });
        return createVNode(type, propsOrChildren);
      }
    } else {
      // const vDom = h("div", "hello jw");
      // const vDom = h("div", [h("span", "123"), h("span", "qwq")]);
      return createVNode(type, null, propsOrChildren);
    }
  } else {
    if (len > 3) {
      // const vDom = h("div", {}, h("span", "123"), h("span", "qwq"));
      children = Array.from(arguments).slice(2);
    } else {
      // const vDom = h("div",{}, h("span", "123"));
      // const vDom = h("div", h("span", "123"), h("span", "qwq"));❎错误写法
      if (len == 3 && isVnode(children)) {
        children = [children];
      }
    }

    // const vDom = h("div");
    // const vDom = h("div", {}, "hello jw");
    // const vDom = h("div", {}, [h("span", "123"), h("span", "qwq")]);
    return createVNode(type, propsOrChildren, children);
  }
}
