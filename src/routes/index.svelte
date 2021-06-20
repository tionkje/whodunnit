<svelte:head>
<script src="https://js.pusher.com/7.0/pusher.min.js"></script>
</svelte:head>

<script>
  import { onMount } from 'svelte';
  import { PUSHER_KEY } from '$lib/Env'
  
  onMount(()=>{
    // Enable pusher logging - don't include this in production
    Pusher.logToConsole = true;

    var pusher = new Pusher(PUSHER_KEY, {
      cluster: 'eu'
    });

    var channel = pusher.subscribe('my-channel');
    channel.bind('my-event', function(data) {
      alert(JSON.stringify(data));
    });
  });

</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>

<button on:click={(e) => fetch('push')}>Fetch</button>

<h1>Hello, {PUSHER_KEY}</h1>
