//浏览器dom的options
import { nodeOps } from "./nodeOps.js";
import { patchProp } from "./props.js";
// 创建渲染函数的核心方法
import { createRenderer } from "@vue/runtime-core";

const renderOptions = { ...nodeOps, patchProp };

export function render(vdom, container) {
  const { render } = createRenderer(renderOptions);

  render(vdom, container);
}

export * from "@vue/runtime-core";
