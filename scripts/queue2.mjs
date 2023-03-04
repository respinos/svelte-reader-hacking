import Queue from "queue-promise";
import { argv } from 'node:process';

let currentSeq = parseInt(argv[2], 10);
let totalSeq = parseInt(argv[3], 10);

const pagesData = [];
pagesData.push({}); // nop
for (let seq = 1; seq <= totalSeq; seq++) {
  pagesData.push({ seq: seq, inView: false, enqueued: false });
}

const loadPage = async function(pageDatum, delta) {
  return delay(delta)
    .then(() => {
      if (pageDatum.inView) {
        console.log(":: loading", delta, "->", pageDatum, pagesData[pageDatum.seq]);
      } else {
        console.log("$$ ignoring", delta, "->", pageDatum);
      }
      pageDatum.enqueued = false;
      return pageDatum;
    })
}

function delay(t, v) {
  return new Promise(resolve => setTimeout(resolve, t, v));
}

async function queuePage(pageDatum) {
  pageDatum.enqueued = true;
  let delta = Math.floor(Math.random() * 1000);
  return loadPage(pageDatum, delta);
  // return delay(delta)
  //   .then(() => { return loadPage(pageDatum, delta) });

}

const queue = new Queue({
  concurrent: 5,
  interval: 1000
});

let resolved = 0;
queue.on("resolve", data => {
  console.log("     :: resolved", resolved, data, pagesData[data.seq + 1])
  resolved += 1;
  if ( true && resolved == 5 ) {
    loadPages(totalSeq - currentSeq);
  }

  pagesData.forEach((datum) => { 
    if (datum.inView) { console.log('     %%%', datum.seq, datum.enqueued); }
  });

});
queue.on("reject", error => console.error("!! error", error));

queue.on("start", () => { console.log('-- started')});
queue.on("stop", () => { console.log('-- stopped')});
queue.on("end", () => { console.log('-- end')});

function loadPages(currentSeq) {
  pagesData.forEach((datum) => {
    if ( datum.inView ) {
      datum.inView = false;
      console.log("??", datum.seq, datum.enqueued, datum.inView);
    }
  })
  let x = [ currentSeq ];
  queue.enqueue(() => { return queuePage(pagesData[currentSeq]) });
  for (let seq = currentSeq - 1; seq >= currentSeq - 5; seq--) {
    if (seq > 0) {
      queue.enqueue(() => { return queuePage(pagesData[seq]) });
      x.push(seq);
    }
  }
  for (let seq = currentSeq + 1; seq <= currentSeq + 5; seq++) {
    if (seq < totalSeq) {
      queue.enqueue(() => { return queuePage(pagesData[seq]) });
      x.push(seq);
    }
  }
  x.forEach((seq) => {
    pagesData[seq].inView = true;
  })
  console.log(">>>", currentSeq, x);
}

loadPages(currentSeq);

// setTimeout(() => {
//   loadPages(totalSeq - currentSeq);
// }, Math.floor(Math.random() * 1000));

// setTimeout(() => {
//   console.log(pagesData);
// }, 5000);

console.log("-30-");