<script>
	import { onDestroy } from 'svelte';
  import { createEventDispatcher } from 'svelte';

	import { createObserver } from 'svelte-use-io';
	const { observer } = createObserver({ trackVisibility: true, delay: 100 });

  const dispatch = createEventDispatcher();

	// const doStuff = ({ detail }) => console.log({ detail });
  const doStuff = ({detail}) => {
    console.log("+", detail.target.innerText, detail.isVisible);
    detail.target.dataset.visible = true;
  };
  const undoStuff = ({detail}) => {
    console.log("-", detail.target.innerText, detail.isVisible);
    detail.target.dataset.visible = false;
  };
	// { detail: IntersectionObserverEntry }

  const handleZoom = function(event) {
    let delta = 2;
    if ( event.shiftKey ) {
      delta = 0.5;
    }
    zoom *= delta;
    dispatch('updateZoom', zoom);
  }

  import Page from './lib/Page04.svelte';
  import manifest from './lib/manifest3.json';

  manifest.items.forEach((item) => {
    item.originalHeight = item.height;
    item.originalWidth = item.width;
  })

  $: zoom = 1;

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

<!-- <ul>
	{#each Array.from({ length: 1000 }, (_, i) => i + 1) as i (i)}
	<li id="id{i}" use:observer on:intersecting="{doStuff}" on:unintersecting={undoStuff}>Item {i}</li>
	{/each}
</ul> -->

<!-- <section>
{#each Array.from({ length: 1000 }, (_, i) => i + 1) as i (i)}
<Page {observer} seq={i}></Page>
{/each}
</section> -->

<section>
  {#each manifest.items as canvas}
  <Page {observer} {canvas} seq={canvas.seq} bind:zoom={zoom}></Page>
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