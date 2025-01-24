// packages/reactivity/src/effectScope.ts
var activeEffectSope;
var EffectScope = class {
  constructor(detached) {
    this.effects = [];
    this.scopes = [];
    if (!detached && activeEffectSope) {
      activeEffectSope.scopes.push(this);
    }
  }
  run(fn) {
    try {
      this.parent = activeEffectSope;
      activeEffectSope = this;
      return fn();
    } finally {
      activeEffectSope = this.parent;
      this.parent = void 0;
    }
  }
  stop() {
    for (let i = 0; i < this.effects.length; i++) {
      this.effects[i].stop();
    }
    for (let i = 0; i < this.scopes.length; i++) {
      this.scopes[i].stop();
    }
  }
};
function recordEffectScope(effect3) {
  if (activeEffectSope) {
    activeEffectSope.effects.push(effect3);
  }
}
function effectScope(detached = false) {
  return new EffectScope(detached);
}

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
    this.__v_isRef = true;
    this.active = true;
    recordEffectScope(this);
  }
  run() {
    if (!this.active) {
      return this.fn();
    }
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
  stop() {
    if (this.active) {
      this.active = false;
      cleanAllTracks(this);
    }
  }
};
function effect(fn, options) {
  const _effect = new ReactiveEffect(fn, options?.scheduler);
  _effect.run();
  const runner = _effect.run.bind(_effect);
  runner.effect = _effect;
  return runner;
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
function toReactive(target) {
  return isObject(target) ? reactive(target) : target;
}

// packages/reactivity/src/computed.ts
var ComputedRefImpl = class {
  constructor(getter, setter) {
    this.getter = getter;
    this.setter = setter;
    this.deps = /* @__PURE__ */ new Set();
    this.dirty = true;
    this.__v_isRef = true;
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
  return new ComputedRefImpl(getter, setter);
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
function doWatch(source, cb, options = Object.freeze({})) {
  const { deep, immediate } = options;
  let getter;
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
  let clean;
  function onCleanup(fn) {
    clean = fn;
  }
  const job = () => {
    if (clean) clean();
    if (cb) {
      const newValue = effect3.run();
      cb(newValue, oldValue, onCleanup);
      oldValue = newValue;
    } else {
      effect3.run();
    }
  };
  const effect3 = new ReactiveEffect(getter, job);
  if (immediate) {
    job();
  } else {
    oldValue = effect3.run();
  }
}
var watchEffect = (source, options) => {
  doWatch(source, null, options);
};
var watch = (source, cb, options) => {
  doWatch(source, cb, options);
};

// packages/reactivity/src/ref.ts
var RefImpl = class {
  constructor(rawVal) {
    this.rawVal = rawVal;
    this.__v_isRef = true;
    this.deps = /* @__PURE__ */ new Set();
    this._value = toReactive(rawVal);
  }
  get value() {
    if (activeEffect) {
      trackEffects(this.deps);
    }
    return this._value;
  }
  set value(newVal) {
    if (newVal !== this.rawVal) {
      this._value = toReactive(newVal);
      this.rawVal = newVal;
      triggerEffects(this.deps);
    }
  }
};
function ref(rawVal) {
  return new RefImpl(rawVal);
}
var ObjectRefImpl = class {
  constructor(target, key) {
    this.target = target;
    this.key = key;
    this.__v_isRef = true;
  }
  get value() {
    return this.target[this.key];
  }
  set value(newVal) {
    this.target[this.key] = newVal;
  }
};
function toRef(target, key) {
  if (!isReactive(target)) {
    throw new Error("target must be a reactive object");
  }
  return new ObjectRefImpl(target, key);
}
function toRefs(target) {
  const obj = {};
  for (const key in target) {
    obj[key] = toRef(target, key);
  }
  return obj;
}
function proxyRefs(target) {
  return new Proxy(target, {
    get(t, k, r) {
      return target[k]["__v_isRef"] ? t[k].value : t[k];
    },
    set(t, k, newVal, r) {
      if (target["__v_isRef"]) {
        t[k].value = newVal;
        return true;
      } else {
        return Reflect.set(t, k, newVal);
      }
    }
  });
}
export {
  ReactiveEffect,
  activeEffect,
  activeEffectSope,
  computed,
  effect,
  effectScope,
  isReactive,
  proxyRefs,
  reactive,
  recordEffectScope,
  ref,
  toReactive,
  toRef,
  toRefs,
  watch,
  watchEffect
};
//# sourceMappingURL=reactivity.js.map
