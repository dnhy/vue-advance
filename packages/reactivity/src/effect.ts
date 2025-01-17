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
  constructor(public fn: () => void, public scheduler?: () => void) {}
  run() {
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
}

export function effect(fn: () => void, options: any) {
  // 渲染effect
  const reactiveEffect = new ReactiveEffect(fn, options?.scheduler);
  reactiveEffect.run();

  return reactiveEffect.run.bind(reactiveEffect);
}
