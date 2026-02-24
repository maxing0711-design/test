import { explainLine } from './src/explain.js';

const samples = [
  'Error: Module not found: Cannot find module axios',
  'warn deprecated package',
  'EACCES: permission denied, mkdir /usr/local/lib/node_modules',
  'Info: compiled successfully',
  'timeout of 5000ms exceeded'
];

const loops = 20000;
const t0 = performance.now();
for (let i = 0; i < loops; i++) {
  explainLine(samples[i % samples.length]);
}
const t1 = performance.now();

console.log(`bench_loops=${loops}`);
console.log(`total_ms=${(t1 - t0).toFixed(2)}`);
console.log(`avg_us=${(((t1 - t0) * 1000) / loops).toFixed(2)}`);
