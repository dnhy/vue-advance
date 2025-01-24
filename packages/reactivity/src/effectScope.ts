export let activeEffectSope;

class EffectScope {
  parent;
  effects = [];
  scopes = [];
  constructor(detached) {
    if (!detached && activeEffectSope) {
      activeEffectSope.scopes.push(this);
    }
  }
  run(fn) {
    try {
      this.parent = activeEffectSope;
      activeEffectSope = this;

      return fn();
    } finally {
      activeEffectSope = this.parent;
      this.parent = undefined;
    }
  }
  stop() {
    for (let i = 0; i < this.effects.length; i++) {
      this.effects[i].stop();
    }
    for (let i = 0; i < this.scopes.length; i++) {
      this.scopes[i].stop();
    }
  }
}

export function recordEffectScope(effect) {
  if (activeEffectSope) {
    activeEffectSope.effects.push(effect);
  }
}

// detached是否是独立的scope，true不被依赖收集
export function effectScope(detached = false) {
  return new EffectScope(detached);
}
