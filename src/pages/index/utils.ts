/**
 * 立即执行函数
 */
export const exec: <Args extends [], Ret>(fn: (...args: Args) => Ret, ...args: Args) => Ret = (
  fn,
  ...args
) => fn(...args);
