<script>

  import { onMount } from 'svelte';
  import { setContext } from 'svelte';

  import PageText from './PageText.svelte';
  // import SearchHighlights from './SearchHighlights.svelte';

  export let observer;
  export let seq;
  export let canvas;
  export let zoom;

  export let handleIntersecting;
  export let handleUnintersecting;

  export function toggle(visible) {
    isVisible = visible;
    if (visible) {
      loadImage();
    } else {
      unloadImage();
    }
  }

  let scan;
  let image;
  let matches;
  let page_coords;
  let objectUrl;
  let isLoaded = false;

  // cgi/imgsrv/thumbnail?id={canvas.id}&seq={seq}
  let defaultThumbnailSrc = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=`;
  export let thumbnailSrc = defaultThumbnailSrc;

  const updateMatches = function(coords, values) {
    matches = [ ...values ];
    page_coords = [ ...coords ];
    console.log("UPDATE MATCHES", coords, values);
  }

  const loadImage = function() {
    let height = scanHeight * window.devicePixelRatio;
    let img_src = `/cgi/imgsrv/image?id=${canvas.id}&seq=${seq}&height=${height}`;
    fetch(img_src)
      .then((response) => {
        let size = response.headers.get('x-image-size');
        // console.log(...response.headers);
        let parts = size.split('x');
        let ratio = canvas.height / parseInt(parts[1], 10);
        let width = Math.ceil(parseInt(parts[0], 10) * ratio);
        canvas.width = width;
        console.log("--", seq, size, `${canvas.width}x${canvas.height}`);
        return response.blob();
      })
      .then(blob => {
        objectUrl = URL.createObjectURL(blob);
        if ( image ) {
          image.src = objectUrl;
          isLoaded = true;
        } else {
          URL.revokeObjectURL(objectUrl);
        }
      })    
  }

  const unloadImage = function() {
    URL.revokeObjectURL(objectUrl);
    console.log("---- unload", seq, image);
  }

  const doStuff = ({detail}) => {
    console.log("++", seq, detail.isVisible);
    detail.target.dataset.visible = true;
    isVisible = true;

    let height = scanHeight * window.devicePixelRatio;

    // let img_src = `/cgi/imgsrv/image?id=${canvas.id}&seq=${seq}&height=${height}`;
    // fetch(img_src)
    //   .then((response) => {
    //     let size = response.headers.get('x-image-size');
    //     console.log(...response.headers);
    //     let parts = size.split('x');
    //     let ratio = canvas.height / parseInt(parts[1], 10);
    //     let width = Math.ceil(parseInt(parts[0], 10) * ratio);
    //     canvas.width = width;
    //     console.log("--", seq, size, `${canvas.width}x${canvas.height}`);
    //     return response.blob();
    //   })
    //   .then(blob => {
    //     objectUrl = URL.createObjectURL(blob);
    //     if ( image ) {
    //       image.src = objectUrl;
    //     } else {
    //       URL.revokeObjectURL(objectUrl);
    //     }
    //   })
  };

  const imageOnLoad = function(event) {
    if ( rotateX != 0 ) { return ; }
    console.log("!", seq, rotateX, event.target.naturalWidth, event.target.naturalHeight);
    // if ( event.target.naturalHeight != scanHeight ) {
    //   scanHeight = event.target.naturalHeight;
    //   scanAdjusted = true;
    // }
  }

  const undoStuff = ({detail}) => {
    if ( image === undefined ) { return ; }
    console.log("--", seq, detail.isVisible);
    detail.target.dataset.visible = false;
    isVisible = false;
    URL.revokeObjectURL(objectUrl);
    image.src = null;
  };

  const rotateScan = function() {
    orient = ( orient + 90 ) % 360;
    if ( orient == 90 || orient == 270 ) {
      // we need to set the margins
      orientMargin = ( ( scanHeight * 0.80 ) / 2 / 2 ) * -1;
    } else {
      orientMargin = 0;
    }
  }

  function calculateRatio(canvas) {
    if ( canvas.height > canvas.width ) {
      return window.innerHeight / canvas.height;
    }
    let width = window.innerWidth * 0.6;
    let ratio = width / canvas.width;
    return ratio;
  }

  function calculate(value, zoom) {
    // console.log("calculate", value, scanRatio, zoom);
    return Math.ceil(value * scanRatio * zoom);
  }

  $: isVisible = false;
  $: scanRatio = calculateRatio(canvas);
  $: scanHeight = calculate(canvas.height, zoom);
  $: scanWidth = calculate(canvas.width, zoom);
  $: scanAdjusted = false;
  $: orient = 0;
  $: rotateX = 0;
  $: orientMargin = 0;

  let testWidth, testHeight;

  onMount(() => {
    testWidth = Math.ceil(canvas.originalWidth * scanRatio);
    testHeight = Math.ceil(canvas.originalHeight * scanRatio);
    // console.log("AHOY WUT", seq, canvas.width, canvas.height, '/', canvas.originalWidth, canvas.originalHeight);
  })

</script>

<style>
  div.page {
    /* display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: 1fr;
    justify-items: center;
    align-items: center; */

    border: 1px solid lightslategray;
    position: relative;
    margin: auto;
  }

  div.visible {
    /* background-color: rgba(153, 50, 204, 0.125); */
    border: 4px solid darkorange;
  }

  /* :is([data-visible="true"]) {
    background: darkolivegreen;
  } */

  div.frame {
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: 1fr;
    justify-items: center;
    align-items: center;
    position: relative;
  }

  div.frame > span {
    display: block;
    padding: 1rem;
    background: darkslategray;
    color: slategray;
    font-size: 1.5rem;
    font-family: monospace;
    position: sticky;
    top: 1rem;

    grid-row: 1/2;
    grid-column: 1/2;
    position: relative;

    z-index: 100;

    transition: transform .8s ease-in-out;
  }

  /* div.nonsense {
    position: absolute;
    top: 50%;
    margin-top: calc(var(--height) * 0.8 * 0.5 * -1);
    height: calc(var(--height) * 0.8);
    width: calc(var(--width) * 0.8);
    background: rgb(255, 160, 122, 0.4);
  } */

  div.scan {
    grid-column: 1/2;
    grid-row: 1/2;
    /* width: calc(var(--width) * 0.98);
    height: calc(var(--height) * 0.98); */
    /* width: var(--width); */
    /* width: 100%; */
    width: var(--width);
    height: var(--height);
    border: 1px solid white;
    padding: 0.25rem;

    /* display: flex;
    align-items: center;
    justify-content: center; */

    display: grid;
    position: relative;
  }

  div.scan > img {
    width: 100%;
    grid-area: 1/1;
  }

  img.thumbnail {
    height: 100%;
    opacity: 0.6;
    transition: opacity 0.8s;
  }

  img.actual {
    opacity: 0;
    transition: opacity 1s;
  }

  img.actual.loaded {
    opacity: 1.0;
  }

  img.thumbnail.loaded {
    opacity: 0.0;
  }

  .frame[data-orient="0"] {
    /* max-width: 100%;
    max-height: 100%;
    width: 100%; */
  }

  .frame:is([data-orient="90"]) {
    /* max-width: 100%;
    height: auto; */
    transform: rotate(90deg) scale(0.8) !important;
    margin-top: calc(var(--orient-margin) * 1px) !important;
    margin-bottom: calc(var(--orient-margin) * 1px) !important;
  }

  .frame:is([data-orient="180"]) {
    /* max-width: 100%;
    max-height: 100%;
    width: 100%; */
    transform: rotate(180deg) !important;
  }

  .frame:is([data-orient="270"]) {
    /* max-width: 100%;
    height: auto; */

    transform: rotate(270deg) scale(0.8) !important;
    margin-top: calc(var(--orient-margin) * 1px) !important;
    margin-bottom: calc(var(--orient-margin) * 1px) !important;
  }

  div.adjusted {
    border: 4px solid lightgreen;
  }

  .toolbar {
    display: flex;
    flex-direction: row;
    margin-top: 1rem;
    margin-bottom: 0.25rem;
    position: sticky;
    background: transparent;
    justify-content: flex-end;
    top: 0.5rem;
    z-index: 10;
    gap: 0.5rem;
  }

  .debug {
    position: absolute;
    border: 4px dotted orange;
    background: transparent;
    top: 50%;
    left: 50%;
    transform: translateX(-50%) translateY(-50%);
    width: var(--width);
    height: var(--height);
    z-index: 10;
  }

</style>

<!-- on:intersecting={doStuff} on:unintersecting={undoStuff} -->
<div class="page" data-seq={seq} class:visible={isVisible} use:observer id="id{seq}" on:intersecting={handleIntersecting} on:unintersecting={handleUnintersecting}>
  <div class="toolbar">
    <button type="button" class="btn btn-outline-dark" on:click={rotateScan}><i class="bi bi-arrow-clockwise"></i></button>
    <span class="badge bg-secondary d-flex align-items-center p-2">#{seq}</span>
  </div>
  <div class="frame" data-orient={orient} style="--orient-margin: {orientMargin}">
    <div class="debug" style="--width: {testWidth}px; --height: {testHeight}px;"></div>
    <span>Item {seq}</span>
    <div class="scan" bind:this={scan} class:adjusted={scanAdjusted} style="--width: {scanWidth}px; --height: {scanHeight}px;" >
      <img src={thumbnailSrc} class:loaded={isLoaded} aria-hidden="true" class="thumbnail" alt="" />
      {#if isVisible}
          <img class="actual" class:loaded={isLoaded} src="" bind:this={image} on:load={imageOnLoad} data-rotate="{rotateX}" />
          <PageText hidden={true} canvas={canvas} image={image} seq={seq}></PageText>
      {/if}
      <!-- <SearchHighlights image={image} scan={scan} page_coords={page_coords} matches={matches}></SearchHighlights> -->
    </div>
  </div>
</div>
