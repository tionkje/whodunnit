<script>
  import { onMount } from 'svelte';
  import { PUSHER_KEY, PUSHER_CLUSTER } from '$lib/Env';

  let members = [];

  function connect() {
    // Enable pusher logging - don't include this in production
    Pusher.logToConsole = true;

    var pusher = new Pusher(PUSHER_KEY, {
      cluster: PUSHER_CLUSTER,
      forceTLS: true,
      authEndpoint: 'auth',
      auth: {
        params: {
          name: localStorage.name,
        },
      },
    });

    var channel = pusher.subscribe('presence-channel');
    // channel.bind('my-event', function (data) {
    //   alert(JSON.stringify(data));
    // });

    channel.bind('pusher:subscription_succeeded', () => {
      channel.members.each((m) => members.push(m));
      members = members;
    });
    channel.bind('pusher:member_added', (member) => {
      // addMemberToUserList(member.id)
      members.push(member);
      members = members;
      console.log('pusher:member_added', member);
    });
    channel.bind('pusher:member_removed', (member) => {
      // const userEl = document.getElementById("user_" + member.id);
      // userEl.parentNode.removeChild(userEl);
      console.log('pusher:member_removed', member);
      members = members.filter((m) => m.id != member.id);
    });
  }

  onMount(() => {
    const { random, floor } = Math;
    const randInArr = (a) => a[floor(a.length * random())];
    const genId = (l) =>
      Array(l)
        .fill(0)
        .map(() => randInArr('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890'))
        .join('');
    if (!document.cookie.match('(^|;) ?user_id=([^;]*)(;|$)')) {
      document.cookie = `user_id=${genId(32)}`;
    }
    if (localStorage.name) {
      connect();
      showNamePrompt = false;
    }
  });

  let showNamePrompt = true;

  function setName(name) {
    localStorage.name = name;
    showNamePrompt = false;
    connect();
  }
</script>

<svelte:head>
  <script src="https://js.pusher.com/7.0/pusher.min.js"></script>
</svelte:head>

{#if showNamePrompt}
  <main>
    <form on:submit|preventDefault={(e) => setName(e.target.name.value)}>
      <input name="name" type="text" placeholder="name" />
      <button>Submit</button>
    </form>
  </main>
{:else}
  <ul>
    {#each members as member}
      <li>{member.info.name}</li>
    {/each}
  </ul>
{/if}

<style>
  form {
    max-width: 400px;
  }
  main {
    display: flex;
    justify-content: center;
  }
  input {
    padding: 10px 20px;
  }
  button {
    padding: 10px 20px;
  }
</style>
