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

function doWatch(source, cb, options: any = Object.freeze({})) {
  const { deep, immediate } = options;
  let getter: any;
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
  let clean: () => void;

  function onCleanup(fn: () => void) {
    clean = fn;
  }
  const job = () => {
    if (clean) clean();

    if (cb) {
      const newValue = effect.run();
      cb(newValue, oldValue, onCleanup);
      oldValue = newValue;
    } else {
      effect.run();
    }
  };

  const effect = new ReactiveEffect(getter, job);
  if (immediate) {
    job();
  } else {
    oldValue = effect.run();
  }
}

export const watchEffect = (source, options) => {
  doWatch(source, null, options);
};

export const watch = (source, cb, options) => {
  doWatch(source, cb, options);
};
