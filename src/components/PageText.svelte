<script>

  import { onMount } from 'svelte';
  import { getContext } from 'svelte';
  import SearchHighlights from './SearchHighlights.svelte';

  export let hidden = false;
  export let seq;
  export let canvas;
  export let image;

  let matches = [];
  let page_coords;

  let pageText;

  const extractHighlights = function(words, ocr_div) {

    function parseCoords(value) {
      var values = value.split(' ')
      return values.map((v) => parseInt(v, 10));
    }

    var timestamp = (new Date).getTime();
    page_coords = parseCoords(ocr_div.dataset.coords);
    var word_regexes = {};
    let word;
    words.forEach((word) => {
      var pattern;
      try {
        pattern = new RegExp(`(?<=^|\\P{L})(${word})(?=\\P{L}|$)`, 'igu');
      } catch (error) {
        try {
          pattern = new RegExp(`(?:^|[\\s,\\.:;"'-])${word}(?:$|[\\s,\\.:;"'-])`, 'igu');
        } catch (error) {
          pattern = new RegExp(`(?:^|[\\s,\\.:;"'-])${word}(?:$|[\\s,\\.:;"'-])`, 'ig');
        }
      }
      word_regexes[word] = pattern;
    })

    function textNodesUnder(el){
      var n, a=[], walk=document.createTreeWalker(el,NodeFilter.SHOW_TEXT,null,false);
      while(n=walk.nextNode()) a.push(n);
      return a;
    }

    var textNodes = textNodesUnder(ocr_div);
    textNodes.forEach(function(text) {
      var innerHTML = text.nodeValue.trim();
      if ( ! innerHTML ) { return; }

      var matched = false; var matchedWord = null;
      words.forEach(function(word) {
        // var pattern = new RegExp(`\\b(${word})\\b`, 'gi');
        // var pattern = new RegExp(`(?:^|\\s)${words[0]}(?:$|\\s)`, 'ig')
        // var pattern = new RegExp(`(?<=^|\\P{L})(${word})(?=\\P{L}|$)`, 'ig');
        var pattern = word_regexes[word];
        if ( innerHTML.match(pattern) ) {
          matched = true;
          matchedWord = word.toLowerCase();
        }
      })
      if ( ! matched ) { return ; }
      var span = text.parentNode;
      span.dataset.innerHTML = innerHTML;
      matches.push(span);
    })

    console.log("AHOY MATCHES", matches);
    matches = matches;
  }

  const loadPageText = function() {
    if ( pageText && pageText.querySelector('.ocr_page') ) { return ; }
    let text_src = `/cgi/imgsrv/html?id=${canvas.id}&seq=${seq}`;
    // need to deal with q1
    fetch(text_src)
      .then((response) => {
        return response.text();
      })
      .then(text => {
        if ( ! pageText ) { return ; }
        // pageText = text.replace('<div class="ocr_page"', '<div class="ocr_page" data-words="[&quot;lowndes&quot;]"');
        const parser = new DOMParser();
        const ocr_div = parser.parseFromString(text, 'text/html').body.childNodes[0];
        ocr_div.dataset.words = `["lowndes"]`;
        ocr_div.classList.add('visually-hidden');
        pageText.append(ocr_div);

        let words = JSON.parse(ocr_div.dataset.words || '[]');
        if ( ! words || ! words.length ) { return ; }

        if ( ! ocr_div.dataset.coords ) { return; }

        extractHighlights(words, ocr_div);

      })
  }

  $: if (image) { loadPageText() }
  $: if ( getContext('answer') ) { console.log("AHOY HAVE ANSWER", seq); }

</script>

<style>

  .page-text.hidden {
    display: block;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background: #eee;
    position: absolute !important;
    height: 1px;
    width: 1px;
    overflow: hidden;
    clip: rect(1px 1px 1px 1px);
    clip: rect(1px, 1px, 1px, 1px);
  }

  .page-text {
    position: relative;
    grid-area: 1/1;
    width: 100%;
  }

  /* :global(mark.highlight) {
    position: absolute;
    background: greenyellow;
    opacity: 0.4;
  } */

</style>

<div class="page-text" bind:this={pageText}>
  <SearchHighlights image={image} page_coords={page_coords} matches={matches}></SearchHighlights>
</div>
