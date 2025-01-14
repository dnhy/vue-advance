import { isObject } from "../../shared/src/index.js";
import { activeEffect } from "./effect.js";
import { reactive } from "./reactive.js";

export const enum ReactiveFlags {
  isReactive = "__v_isReactive",
}

export const mutableHanlders = {
  get(target, key, reciver) {
    if (key === ReactiveFlags.isReactive) {
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
  },
};

// {name:'qwqw',age:123}=>{key=>set[]}
const targetMap = new WeakMap();

function track(target, key) {
  if (activeEffect) {
    let keyMap = targetMap.get(target);
    if (!keyMap) {
      targetMap.set(target, (keyMap = new Map()));
    }

    let dep = keyMap.get(key);
    if (!dep) {
      keyMap.set(key, (dep = new Set()));
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
