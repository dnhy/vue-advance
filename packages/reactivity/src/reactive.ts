import { mutableHanlders, ReactiveFlags } from "./baseHandler.js";

export function reactive(target) {
  return createReactive(target);
}

const proxyMaps = new WeakMap();

function createReactive(target) {
  // 解决多次代理
  if (proxyMaps.has(target)) {
    return proxyMaps.get(target);
  }
  // 解决嵌套代理
  if (target[ReactiveFlags.isReactive]) {
    return target;
  }

  const proxy = new Proxy(target, mutableHanlders);
  proxyMaps.set(target, proxy);
  return proxy;
}

export function isReactive(target) {
  return !!(target && target[ReactiveFlags.isReactive]);
}
