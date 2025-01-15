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
  constructor(public fn: () => void) {}
  run() {
    try {
      this.parent = activeEffect;
      activeEffect = this;
      cleanAllTracks(this);

      return this.fn();
    } finally {
      activeEffect = this.parent;
      this.parent = undefined;
    }
  }
}

export function effect(fn: () => void) {
  const reactiveEffect = new ReactiveEffect(fn);
  reactiveEffect.run();
}
