export class ReactiveEffect {
  parent = null;
  deps = [];
  constructor(public fn: () => void) {}
  run() {
    try {
      this.parent = activeEffect;
      activeEffect = this;
      return this.fn();
    } finally {
      activeEffect = this.parent;
      this.parent = void 0;
    }
  }
}

export let activeEffect = void 0;

export function effect(fn: () => void) {
  const reactiveEffect = new ReactiveEffect(fn);
  reactiveEffect.run();
  activeEffect = reactiveEffect;
}
