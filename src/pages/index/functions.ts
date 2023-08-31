type FunctionDefinition = { key: string; label: string; value: (x: number, k: number) => number };

const functions: FunctionDefinition[] = [
  { key: '1', label: 'f(x) = k * x', value: (x, k) => k * x },
  { key: 'inverse', label: 'f(x) = k / x', value: (x, k) => k / x },
];
