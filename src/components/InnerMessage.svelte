<script>
  import { getContext } from 'svelte';

  console.log("INNER CONTEXT", getContext('context'));

  // const { root } = getContext('context');
  // const emitter = { emit: function() {} };

  const { emitter } = getContext('context');

  let count = 0;
  function notify() {
    count += 1;
    emitter.emit('update.count', count);
  }

</script>

<pre>AHOY</pre>
<!-- <pre>MESSAGE: {root.message()}</pre> -->
<p>
  <button on:click={notify}>Notify Root</button>
</p>