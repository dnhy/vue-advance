import { recordEffectScope } from "./effectScope.js";

export let activeEffect = undefined;

function cleanAllTracks(effect) {
  const sets = effect.deps;
  for (let i = 0; i < sets.length; i++) {
    sets[i].delete(effect);
  }
  effect.deps.length = 0;
}

export class ReactiveEffect {
  parent = null;
  deps = [];
  __v_isRef = true;
  active = true;
  constructor(public fn: () => void, public scheduler?: () => void) {
    recordEffectScope(this);
  }
  run() {
    if (!this.active) {
      return this.fn();
    }
    try {
      this.parent = activeEffect;
      // 将当前的ReactiveEffect挂到全局
      activeEffect = this;
      cleanAllTracks(this);

      // 进行依赖收集
      return this.fn();
    } finally {
      activeEffect = this.parent;
      this.parent = undefined;
    }
  }
  stop() {
    if (this.active) {
      this.active = false;
      cleanAllTracks(this);
    }
  }
}

export function effect(fn: () => void, options: any) {
  // 渲染effect
  const _effect = new ReactiveEffect(fn, options?.scheduler);
  _effect.run();

  const runner = _effect.run.bind(_effect);
  runner.effect = _effect;
  return runner;
}
