<script>

  export let observer;
  export let seq;
  export let canvas;

  let image;
  let objectUrl;

  const doStuff = ({detail}) => {
    console.log("++", detail.target.innerText, detail.isVisible);
    detail.target.dataset.visible = true;
    isVisible = true;

    let img_src = `https://babel.hathitrust.org/cgi/imgsrv/image?id=${canvas.id}&seq=${seq}&width=${scanWidth}`;
    fetch(img_src)
      .then((response) => {
        let size = response.headers.get('x-image-size');
        console.log(...response.headers);
        console.log("--", seq, size);
        return response.blob();
      })
      .then(blob => {
        objectUrl = URL.createObjectURL(blob);
        image.src = objectUrl;
      })
  };

  const imageOnLoad = function(event) {
    if ( rotateX != 0 ) { return ; }
    console.log("!", seq, rotateX, event.target.naturalWidth, event.target.naturalHeight);
    if ( event.target.naturalHeight != scanHeight ) {
      scanHeight = event.target.naturalHeight;
      scanAdjusted = true;
    }
  }

  const undoStuff = ({detail}) => {
    console.log("--", detail.target.innerText, detail.isVisible);
    detail.target.dataset.visible = false;
    isVisible = false;
    URL.revokeObjectURL(objectUrl);
    image.src = null;
  };

  const rotateScan = function() {
    orient = ( orient + 1 ) % 4;
    let [ height, width ] = [ scanWidth, scanHeight ];
    scanWidth = width;
    scanHeight = height;
    if ( orient == 1 ) {
      rotateX = 90;
    } else if ( orient == 2 ) {
      rotateX = 180;
    } else if ( orient == 3 ) {
      rotateX = 270;
    } else {
      rotateX = 0;
    }
  }

  $: isVisible = false;
  $: scanHeight = canvas.height;
  $: scanWidth = canvas.width;
  $: scanAdjusted = false;
  $: orient = 0;
  $: rotateX = 0;

</script>

<style>
  div.page {
    /* display: flex;
    align-items: center;
    justify-content: center; */

    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: 1fr;
    justify-items: center;
    align-items: center;

    border: 1px solid lightslategray;
    width: 100%;
    /* width: var(--width);
    height: var(--height); */
    position: relative;
  }

  div.visible {
    background-color: darkorchid;
  }

  /* :is([data-visible="true"]) {
    background: darkolivegreen;
  } */

  div.page > span {
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
    width: var(--width);
    height: var(--height);
    border: 1px solid darkorange;
    padding: 0.25rem;

    display: flex;
    align-items: center;
    justify-content: center;
  }

  div.scan > img {
  }

  img[data-rotate="0"] {
    max-width: 100%;
    max-height: 100%;
    width: 100%;
  }

  img:is([data-rotate="90"]) {
    max-width: 100%;
    height: auto;
    transform: rotate(90deg);
  }

  img:is([data-rotate="180"]) {
    max-width: 100%;
    max-height: 100%;
    width: 100%;
    transform: rotate(180deg);
  }

  img:is([data-rotate="270"]) {
    max-width: 100%;
    height: auto;
    transform: rotate(270deg);
  }

  div.adjusted {
    border: 4px solid lightgreen;
  }

  button {
    position: absolute;
    top: 1rem;
    right: 1rem;
    font-size: 2rem;
  }

</style>

<div class="page" id="id{seq}" class:visible={isVisible} use:observer on:intersecting="{doStuff}" on:unintersecting={undoStuff}>
  <span>Item {seq}</span>
  <div class="scan" class:adjusted={scanAdjusted} style="--width: {scanWidth}px; --height: {scanHeight}px;" >
    {#if isVisible}
        <img src="" bind:this={image} on:load={imageOnLoad} data-rotate="{rotateX}" />
    {/if}
  </div>
  <button on:click={rotateScan}>↺</button>
</div>
