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
    const oldValue = target[key];
    const flag = Reflect.set(target, key, value);

    if (value !== oldValue) {
      trigger(target, key);
    }
    return flag;
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

    let dep = keyMap.get(key); //dep是一个set
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
    // effect的deps数组收集set，其实就是effect反向收集key
    activeEffect.deps.push(dep);
  }
}

export function trigger(target, key) {
  let keyMap = targetMap.get(target);
  if (!keyMap) return; //effect里还未访问直接赋值，会直接触发getter
  let effects = keyMap.get(key);

  //对set进行遍历，由于run中每次属性都会删除所有依赖，并重新收集，这样每次执行都会加入新的依赖到set，会导致死循环
  // 将set转换成数组
  if (effects) {
    effects = [...effects];
    effects.forEach((effect) => {
      if (effect === activeEffect) return;
      effect.run();
    });
  }
}
