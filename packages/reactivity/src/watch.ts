import { isFunction, isObject } from "@vue/shared";
import { isReactive } from "./reactive.js";
import { ReactiveEffect } from "./effect.js";

function reserve(source, seen = new Set()) {
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

export const watch = (source, cb, options) => {
  let getter: any;
  const { deep, immediate } = options;
  if (isReactive(source)) {
    getter = () => reserve(source);
  } else if (isFunction(source)) {
    getter = source;
  }

  if (deep) {
    const baseGetter = getter;
    //不能提前调用getter，必须在effect挂到全局之后调用
    getter = () => reserve(baseGetter());
  }

  let oldValue: any;
  const job = () => {
    const newValue = effect.run();
    cb(newValue, oldValue);
    oldValue = newValue;
  };

  const effect = new ReactiveEffect(getter, job);
  if (immediate) {
    job();
  } else {
    oldValue = effect.run();
  }
};
