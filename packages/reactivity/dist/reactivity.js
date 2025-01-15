// packages/reactivity/src/effect.ts
var activeEffect = void 0;
function cleanAllTracks(effect2) {
  const sets = effect2.deps;
  for (let i = 0; i < sets.length; i++) {
    sets[i].delete(effect2);
  }
  effect2.deps.length = 0;
}
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
      cleanAllTracks(this);
      return this.fn();
    } finally {
      activeEffect = this.parent;
      this.parent = void 0;
    }
  }
};
function effect(fn) {
  const reactiveEffect = new ReactiveEffect(fn);
  reactiveEffect.run();
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
    const oldValue = target[key];
    const flag = Reflect.set(target, key, value);
    if (value !== oldValue) {
      trigger(target, key);
    }
    return flag;
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
function trigger(target, key) {
  let keyMap = targetMap.get(target);
  if (!keyMap) return;
  let effects = keyMap.get(key);
  if (effects) {
    effects = [...effects];
    effects.forEach((effect2) => {
      if (effect2 === activeEffect) return;
      effect2.run();
    });
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
