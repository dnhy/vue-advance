export function isObject(val: any) {
  return typeof val === "object" && val !== null;
}

export function isFunction(val) {
  return typeof val === "function";
}
