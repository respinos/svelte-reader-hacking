import priorityQueue from '@datastructures-js/priority-queue';
const {
  PriorityQueue,
  MinPriorityQueue,
  MaxPriorityQueue,
  ICompare,
  IGetCompareValue,
} = priorityQueue;

import { argv } from 'node:process';

const HT = {};
HT.params = {};

const pagesQueue = new PriorityQueue((a, b) => {
  let delta_a = Math.abs(a.seq - HT.params.seq); 
  let delta_b = Math.abs(b.seq - HT.params.seq); 
  console.log(HT.params.seq, "->", a.seq, delta_a, delta_a <= 5, "/", b.seq, delta_b, delta_b <= 5);
  if ( Math.abs(a.seq - HT.params.seq ) <= 5 ) {
    // prioritize within the window
    return -1;
  }
  if (Math.abs(b.seq - HT.params.seq) <= 5) {
    // prioritize within the window
    return -1;
  }
  return 1;
})

HT.params.seq = parseInt(argv[2], 10);
console.log("??", HT.params.seq);

for (let seq = 1; seq <= parseInt(argv[3], 10); seq++) {
  pagesQueue.push({ seq: seq });
}

console.log(pagesQueue.toArray());

console.log(pagesQueue.front());
console.log(pagesQueue.back());

HT.params.seq = 45;
console.log(pagesQueue.toArray());

console.log("-30-");