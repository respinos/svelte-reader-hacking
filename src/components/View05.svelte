<script>
	import { onDestroy } from 'svelte';
  import { createEventDispatcher } from 'svelte';

  // import EventEmitter from "events";
  import PQueue from "p-queue";
  console.log("AHOY QUEUE", PQueue);
  const queue = new PQueue({
    concurrency: 5,
    interval: 1000,
  });

  const unloadQueue = new PQueue({
    concurrency: 1,
    interval: 5000,
  })

  const thumbnailer = new PQueue({
    concurrency: 1,
    intervalCap: 1,
    interval: 1500,
  })

  // const loadPageThumbnail = function(seq) {
  //   let pageDatum = manifestMap[seq];
  //   if ( ! pageDatum.page ) { return ; }
  //   thumbnailQueue.add(() => {
  //     console.log("-- queue thumbnail", seq, pageDatum);
  //     return pageDatum.page.loadThumbnail();
  //   })
  // }

  // const thumbnailer = function(node) {
  //   // the node has been mounted in the DOM
  //   let seq = parseInt(node.dataset.seq, 10);
  //   loadPageThumbnail(seq);

  //   return {
  //     update() {
  //       loadPageThumbnail(seq);
  //     },

  //     destroy() {
  //       // end
  //     }
  //   }
  // }

	import { createObserver } from 'svelte-use-io';

	const { observer, io } = createObserver({
    threshold: [ 0, 0.25, 0.5, 0.75, 1.0 ]
  });

  const dispatch = createEventDispatcher();
  const manifestMap = {};

  const currentInView = [];
  let currentSeq;

  const unloadPage = async function(pageDatum) {
    console.log("!! unloading", pageDatum.seq, queue.size, "->", pageDatum);
    manifestMap[pageDatum.seq].page.toggle(false);
    pageDatum.loaded = false;
  }

  const loadPage = async function(pageDatum, delta) {
    if (! pageDatum.loaded) {
      console.log(":: loading", pageDatum.seq, queue.size, "->", pageDatum);
      pageDatum.loaded = true;
      pageDatum.page.toggle(true);
    } else {
      console.log("$$ ignoring", pageDatum.seq, queue.size, "->", pageDatum);
    }
    pageDatum.enqueued = false;
    return pageDatum;
  }

  const queuePage = async function(pageDatum) {
    pageDatum.enqueued = true;
    let delta = Math.floor(Math.random() * 1000);
    return loadPage(pageDatum, delta);
  }

  const loadPages = function(currentSeq) {
    if (manifestMap[currentSeq].timeout) {
      clearTimeout(manifestMap[currentSeq].timeout);
      manifestMap[currentSeq].timeout = null;
    }
    let previouslyInView = [];
    manifest.items.forEach((item) => {
      if ( item.inView ) {
        previouslyInView.push(item.seq);
      }
    })
    let newInView = [ currentSeq ];
    // queue.add(() => { return queuePage(manifestMap[currentSeq]) }, Infinity);
    for (let seq = currentSeq - 1; seq >= currentSeq - 5; seq--) {
      if (seq > 0) {
        // queue.add(() => { return queuePage(manifestMap[seq]) });
        newInView.push(seq);
      }
    }
    for (let seq = currentSeq + 1; seq <= currentSeq + 5; seq++) {
      if (seq < manifest.total_items) {
        // queue.add(() => { return queuePage(manifestMap[seq]) });
        newInView.push(seq);
      }
    }

    let currentDiff = previouslyInView.filter(x => !newInView.includes(x));
    let newDiff = newInView.filter(x => !previouslyInView.includes(x));

    console.log("$$$ DIFF", currentSeq, currentDiff, newDiff);

    currentDiff.forEach((seq) => {
      manifestMap[seq].inView = false;
      // and push unto the unload stack
      unloadQueue.add(() => {
        return unloadPage(manifestMap[seq])
      });
    })

    newDiff.forEach((seq) => {
      manifestMap[seq].inView = true;
      queue.add(() => {
        return queuePage(manifestMap[seq])
      }, 
      { 
        priority: seq == currentSeq ? Infinity : 0 
      })
    });

    currentInView.length = 0;
    currentInView.push(...newInView);
  }

  const handleIntersecting = (({detail}) => {
    let seq = parseInt(detail.target.dataset.seq);
    let pageDatum = manifestMap[seq];
    if ( detail.isIntersecting ) {
      pageDatum.intersectionRatio = detail.intersectionRatio;
      if ( pageDatum.loaded ) {
        console.log("# intersecting", seq, detail.isIntersecting, detail.intersectionRatio);
      } else {
        console.log("+ intersecting", seq, detail.isIntersecting, detail.intersectionRatio);
        // pageDatum.page.toggle(true);
        // pageDatum.inView = true;
        if ( pageDatum.timeout ) { clearTimeout(pageDatum.timeout); }
        pageDatum.timeout = setTimeout(() => {
          console.log("$ intersecting", seq);
          loadPages(seq);
        }, 1000);
        // loadPages(seq);
      }
    } else {
      console.log("# intersecting", seq, detail.isIntersecting, detail.intersectionRatio, pageDatum.isVisible);
    }
    setCurrentSeq();
  })

  const handleUnintersecting = (({detail}) => {
    let seq = parseInt(detail.target.dataset.seq);
    console.log("- intersecting", seq);
    manifestMap[seq].intersectionRatio = undefined;
    if (manifestMap[seq].timeout) {
      clearTimeout(manifestMap[seq].timeout);
      manifestMap[seq].timeout = null;
    }
  })


  const handleZoom = function(event) {
    let delta = 2;
    if ( event.shiftKey ) {
      delta = 0.5;
    }
    zoom *= delta;
    dispatch('updateZoom', zoom);
  }

  const setCurrentSeq = function() {
    if ( currentInView.length == 0 ) { return; }
    let tmp = {intersectionRatio: 0, seq: 0};
    currentInView.forEach((seq) => {
      let pageDatum = manifestMap[seq];
      if ( pageDatum.intersectionRatio === undefined ) { return ; }
      console.log("/// ---", manifestMap[seq].intersectionRatio, manifestMap[seq].inView);
      if ( manifestMap[seq].intersectionRatio > tmp.intersectionRatio ) {
        tmp.intersectionRatio = manifestMap[seq].intersectionRatio;
        tmp.seq = seq;
      }
    })
    currentSeq = tmp.seq;
    return tmp;
  }

  window.currentSeq = function() {
    return currentSeq;
  }

  import Page from './Page05.svelte';
  import manifest from '../lib/manifest3.json';

  manifest.items.forEach((item) => {
    item.originalHeight = item.height;
    item.originalWidth = item.width;
    item.inView = false;
    item.loaded = false;
    item.page = null;
    manifestMap[item.seq] = item;
  })

  $: zoom = 1;

  onDestroy(() => {
    io.disconnect();
  })

</script>

<style>
  section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    width: 80vw;
    margin-left: auto;
    margin-right: auto;
  }

  nav {
    display: flex;
    flex-direction: column;
    background: rgba(0,0,0,0.4);
    position: fixed;
    top: 10vh;
    gap: 0.5rem;
  }

  nav a {
    display: block;
    padding: 0.5rem;
    background: darkslateblue;
    color: yellow;
  }

  .toolbar {
    position: fixed;
    bottom: 0.5rem;
    left: 0.5rem;
    display: flex;
    flex-direction: row;
    gap: 1rem;
  }
</style>

<!-- on:intersecting={doStuff} on:unintersecting={undoStuff} -->
<section>
  {#each manifest.items as canvas}
  <Page 
    bind:this={canvas.page}
    {observer} 
    {canvas} 
    {handleIntersecting}
    {handleUnintersecting}
    seq={canvas.seq} 
    bind:zoom={zoom}
    {thumbnailer}></Page>
  {/each}
</section>

<nav>
  <a href="#id1">Item 1</a>
  <a href="#id10">Item 10</a>
  <a href="#id50">Item 50</a>
  <a href="#id90">Item 90</a>
  <a href="#id100">Item 100</a>
  <a href="#id800">Item 800</a>
</nav>

<div class="toolbar">
  <button on:click={handleZoom}>🔍 <span>{zoom}</span></button>
</div>