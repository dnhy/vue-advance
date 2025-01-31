import { nodeOps } from "./nodeOps.js";
import { patchProp } from "./props.js";
import { createRenderer } from "@vue/runtime-core";

const renderOptions = { ...nodeOps, patchProp };

export function render(vdom, container) {
  const { render } = createRenderer(renderOptions);

  render({}, container);
}

export * from "@vue/runtime-core";
