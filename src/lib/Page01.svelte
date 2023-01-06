<script>

  export let observer;
  export let seq;
  export let canvas;

  let minWidth = 680;
  let maxWidth = 1600;
  let minHeight = 600;
  let maxHeight = 1024;


  const doStuff = ({detail}) => {
    console.log("++", detail.target.innerText, detail.isVisible);
    detail.target.dataset.visible = true;
    isVisible = true;
  };
  const undoStuff = ({detail}) => {
    console.log("--", detail.target.innerText, detail.isVisible);
    detail.target.dataset.visible = false;
    isVisible = false;
  };

  $: isVisible = false;

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
    width: var(--width);
    height: var(--height);
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
    width: calc(var(--width) * 0.98);
    height: calc(var(--height) * 0.98);
    border: 1px solid darkorange;
    padding: 0.25rem;

    display: flex;
    align-items: center;
    justify-content: center;
  }

  div.scan > img {
    max-width: 100%;
    max-height: 100%;
    height: 100%;
  }

</style>

<div class="page" id="id{seq}" class:visible={isVisible} style="--width: {canvas.width}px; --height: {canvas.height}px;" use:observer on:intersecting="{doStuff}" on:unintersecting={undoStuff}>
  <span>Item {seq}</span>
  {#if isVisible}
    <div class="scan">
      <img src="https://babel.hathitrust.org/cgi/imgsrv/image?id={canvas.id}&seq={seq}&height={canvas.height}" />
    </div>
  {/if}
</div>
