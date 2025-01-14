// packages/reactivity/src/effect.ts
var ReactiveEffect = class {
  constructor(fn) {
    this.fn = fn;
    this.parent = null;
    this.deps = [];
  }
  run() {
    try {
      this.parent = activeEffect;
      activeEffect = this;
      return this.fn();
    } finally {
      activeEffect = this.parent;
      this.parent = void 0;
    }
  }
};
var activeEffect = void 0;
function effect(fn) {
  const reactiveEffect = new ReactiveEffect(fn);
  reactiveEffect.run();
  activeEffect = reactiveEffect;
}

// packages/shared/src/index.ts
function isObject(val) {
  return typeof val === "object" && val !== null;
}

// packages/reactivity/src/baseHandler.ts
var mutableHanlders = {
  get(target, key, reciver) {
    if (key === "__v_isReactive" /* isReactive */) {
      return true;
    }
    track(target, key);
    const result = Reflect.get(target, key, reciver);
    if (isObject(result)) {
      return reactive(result);
    }
    return result;
  },
  set(target, key, value, receiver) {
    Reflect.set(target, key, value);
    return true;
  }
};
var targetMap = /* @__PURE__ */ new WeakMap();
function track(target, key) {
  if (activeEffect) {
    let keyMap = targetMap.get(target);
    if (!keyMap) {
      targetMap.set(target, keyMap = /* @__PURE__ */ new Map());
    }
    let dep = keyMap.get(key);
    if (!dep) {
      keyMap.set(key, dep = /* @__PURE__ */ new Set());
    }
    trackEffects(dep);
  }
}
function trackEffects(dep) {
  const shouldTrack = !dep.has(activeEffect);
  if (shouldTrack) {
    dep.add(activeEffect);
    activeEffect.deps.push(dep);
  }
}

// packages/reactivity/src/reactive.ts
function reactive(target) {
  return createReactive(target);
}
var proxyMaps = /* @__PURE__ */ new WeakMap();
function createReactive(target) {
  if (proxyMaps.has(target)) {
    return proxyMaps.get(target);
  }
  if (target["__v_isReactive" /* isReactive */]) {
    return target;
  }
  const proxy = new Proxy(target, mutableHanlders);
  proxyMaps.set(target, proxy);
  return proxy;
}
export {
  ReactiveEffect,
  activeEffect,
  effect,
  reactive
};
//# sourceMappingURL=reactivity.js.map
