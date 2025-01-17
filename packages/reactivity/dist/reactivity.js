// packages/reactivity/src/effect.ts
var activeEffect = void 0;
function cleanAllTracks(effect3) {
  const sets = effect3.deps;
  for (let i = 0; i < sets.length; i++) {
    sets[i].delete(effect3);
  }
  effect3.deps.length = 0;
}
var ReactiveEffect = class {
  constructor(fn, scheduler) {
    this.fn = fn;
    this.scheduler = scheduler;
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
function effect(fn, options) {
  const reactiveEffect = new ReactiveEffect(fn, options?.scheduler);
  reactiveEffect.run();
  return reactiveEffect.run.bind(reactiveEffect);
}

// packages/shared/src/index.ts
function isObject(val) {
  return typeof val === "object" && val !== null;
}
function isFunction(val) {
  return typeof val === "function";
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
  triggerEffects(effects);
}
function triggerEffects(effects) {
  if (effects) {
    effects = [...effects];
    effects.forEach((effect3) => {
      if (effect3 === activeEffect) return;
      if (effect3.scheduler) {
        effect3.scheduler();
      } else {
        effect3.run();
      }
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
function isReactive(target) {
  return !!(target && target["__v_isReactive" /* isReactive */]);
}

// packages/reactivity/src/computed.ts
var ComputedImpl = class {
  constructor(getter, setter) {
    this.getter = getter;
    this.setter = setter;
    this.deps = /* @__PURE__ */ new Set();
    this.dirty = true;
    this.effect = new ReactiveEffect(getter, () => {
      this.dirty = true;
      triggerEffects(this.deps);
    });
  }
  get value() {
    if (activeEffect) {
      trackEffects(this.deps);
    }
    if (this.dirty) {
      this._value = this.effect.run();
      this.dirty = false;
    }
    return this._value;
  }
  set value(newValue) {
    this.setter(newValue);
  }
};
var computed = (getterOrOptions) => {
  let isGetter = isFunction(getterOrOptions);
  let getter;
  let setter;
  if (isGetter) {
    getter = getterOrOptions.get;
    setter = () => {
      console.warn("computed is readonly");
    };
  } else {
    getter = getterOrOptions.get;
    setter = getterOrOptions.set;
  }
  return new ComputedImpl(getter, setter);
};

// packages/reactivity/src/watch.ts
function reserve(source, seen = /* @__PURE__ */ new Set()) {
  if (!isObject(source)) {
    return source;
  }
  if (seen.has(source)) {
    return source;
  }
  seen.add(source);
  for (const key in source) {
    reserve(source[key], seen);
  }
  return source;
}
var watch = (source, cb, options) => {
  let getter;
  const { deep, immediate } = options;
  if (isReactive(source)) {
    getter = () => reserve(source);
  } else if (isFunction(source)) {
    getter = source;
  }
  if (deep) {
    const baseGetter = getter;
    getter = () => reserve(baseGetter());
  }
  let oldValue;
  const job = () => {
    const newValue = effect3.run();
    cb(newValue, oldValue);
    oldValue = newValue;
  };
  const effect3 = new ReactiveEffect(getter, job);
  if (immediate) {
    job();
  } else {
    oldValue = effect3.run();
  }
};
export {
  ReactiveEffect,
  activeEffect,
  computed,
  effect,
  isReactive,
  reactive,
  watch
};
//# sourceMappingURL=reactivity.js.map
