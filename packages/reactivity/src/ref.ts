import { trackEffects, triggerEffects } from "./baseHandler.js";
import { activeEffect } from "./effect.js";
import { isReactive, toReactive } from "./reactive.js";

class RefImpl {
  _value;
  __v_isRef = true;
  deps = new Set();
  constructor(public rawVal) {
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
}

export function ref(rawVal) {
  return new RefImpl(rawVal);
}

class ObjectRefImpl {
  _value;
  __v_isRef = true;
  constructor(public target, public key) {}
  get value() {
    return this.target[this.key];
  }
  set value(newVal) {
    this.target[this.key] = newVal;
  }
}

export function toRef(target, key) {
  if (!isReactive(target)) {
    throw new Error("target must be a reactive object");
  }
  return new ObjectRefImpl(target, key);
}

export function toRefs(target) {
  const obj = {};
  for (const key in target) {
    obj[key] = toRef(target, key);
  }

  return obj;
}

export function proxyRefs(target) {
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
    },
  });
}
