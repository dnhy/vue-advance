import { isFunction } from "@vue/shared";
import { activeEffect, effect, ReactiveEffect } from "./effect.js";
import { trackEffects, triggerEffects } from "./baseHandler.js";

class ComputedRefImpl {
  public _value: any;
  public effect: ReactiveEffect;
  public deps = new Set();
  public dirty = true;
  __v_isRef = true;
  constructor(public getter: () => void, public setter: (val: any) => void) {
    this.effect = new ReactiveEffect(getter, () => {
      //内部依赖修改之后在下一次访问value时需要重新计算
      this.dirty = true;
      triggerEffects(this.deps);
    });
  }

  get value() {
    // 访问value，计算属性对象本身收集渲染effect,value=>[effect,effect]
    if (activeEffect) {
      trackEffects(this.deps);
    }
    // 计算属性放到全局，内部依赖收集计算属性effect
    if (this.dirty) {
      this._value = this.effect.run();
      this.dirty = false;
    }
    return this._value;
  }

  set value(newValue) {
    this.setter(newValue);
  }
}

export const computed = (getterOrOptions) => {
  let isGetter = isFunction(getterOrOptions);
  let getter: () => void;
  let setter: () => void;

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
