import { nodeOps } from "./nodeOps.js";
import { patchProp } from "./props.js";

const renderOptions = { ...nodeOps, patchProp };
console.log("renderOptions :", renderOptions);
