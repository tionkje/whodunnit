<script>
  import { onMount, onDestroy } from 'svelte';
  import { PUSHER_KEY, PUSHER_CLUSTER } from '$lib/Env';

  let members = [];
  let me;
  let pusher,channel;

  const unbindings = [];

  function connect() {
    if(pusher) pusher.disconnect();
    unbindings.forEach(f=>f());
    unbindings.length=0;
    // Enable pusher logging - don't include this in production
    Pusher.logToConsole = true;

    pusher = new Pusher(PUSHER_KEY, {
      cluster: PUSHER_CLUSTER,
      forceTLS: true,
      authEndpoint: 'auth',
      auth: {
        params: {
          name: localStorage.name,
          score: localStorage.score || 0,
        },
      },
    });

    channel = pusher.subscribe('presence-channel');

    // hook bind to auto unbind on destroy
    function hookBind(channel){
      const _bind = channel.bind.bind(channel);
      channel.bind = (evName, cb)=>{
        _bind(evName, cb);
        unbindings.push(()=>channel.unbind(evName,cb));
      }
    }

    hookBind(channel);

    channel.bind('message', function ({action,data}) {
      onAction(action,JSON.parse(decodeURIComponent(data)));
    });

    channel.bind('pusher:subscription_succeeded', () => {
      members = [];
      channel.members.each((m) => members.push(m));
      members = members;
      me = channel.members.me;
      members.sort((a,b)=>a.id.localeCompare(b.id));
    });
    channel.bind('pusher:member_added', (member) => {
      // addMemberToUserList(member.id)
      members.push(member);
      members = members;
      members.sort((a,b)=>a.id.localeCompare(b.id));
      console.log('pusher:member_added', member);
    });
    channel.bind('pusher:member_removed', (member) => {
      // const userEl = document.getElementById("user_" + member.id);
      // userEl.parentNode.removeChild(userEl);
      console.log('pusher:member_removed', member);
      members = members.filter((m) => m.id != member.id);
      members.sort((a,b)=>a.id.localeCompare(b.id));
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

  onDestroy(()=>{
    unbindings.forEach(f=>f());
    unbindings.length=0;
    pusher&&pusher.disconnect();
  });

  let showNamePrompt = true;

  function setName(name) {
    localStorage.name = name;
    showNamePrompt = false;
    connect();
  }

  let hideGoBtn = false;
  let dunnit;

  function onAction(action, data){
    console.log(action,data);
    switch(action){
      case 'start':
        dunnit = null;
        hideGoBtn = true;
        setTimeout(()=>openGuess(data),1000+Math.random()*1000);
        break;
      case 'score':
        if(data.who == me.id){
          localStorage.score = Number(localStorage.score || 0)+Number(data.score);
        }
        connect();
          // location.reload();
        break;
      case 'blame':
        // if(data.from == me.id && data.blame == dunnit.id) post('score',me.id);

        members.find(m=>m.id==data.from).info.blames=data.blame;
        members=members;
        if(members.every(m=>m.info.blames || m.id == dunnit.id)){
          let score = 0;
          if(me.id != dunnit.id){
            if(me.info.blames == dunnit.id) score++;
            score += members.filter(m=>m.info.blames == me.id).length;
          } else {
            score += members.filter(m=>m.info.blames && m.info.blames != me.id).length;
          }
          post('score',{who:me.id,score});
          members.forEach(m=>m.info.blames=null);
          dunnit = null;
          hideGoBtn = false;
        }
        break;
      case 'scheet':
        var a = new Audio(); a.src="https://api.pleaseclown.me"; a.play();
        // debugger
        break;
      default:
        console.error(action, data);
    }
  }

  function openGuess(data){
    data = Number(data);
    dunnit = members[Math.floor(members.length*data)]
    console.log(dunnit);
  }

  function post(ev, data){
    data = encodeURIComponent(JSON.stringify(data));
    fetch(`push?action=${ev}&data=${data}`);
  }
let disabledScheet = false;
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
    <li class:me={me.id==member.id}>{member.info.name} {member.info.score} {members.find(m=>m.id==member.info.blames)?.info.name||''}</li>
    {#if dunnit && dunnit.id != me.id && member.id != me.id && !me.info.blames}
    <button on:click={e=>post('blame',{from:me.id, blame:member.id})}>Schuldig!</button>
    {/if}
    {/each}
    {#if dunnit && dunnit.id == me.id && !disabledScheet}
    <button on:click={e=>post('scheet',{})} on:click={e=>{disabledScheet=true;setTimeout(()=>disabledScheet=false,5000) }}>Scheet!</button>
    {/if}
  </ul>
  {#if !hideGoBtn}
  <button on:click={e=>post('start',Math.random())} on:click={e=>hideGoBtn=true}>Go</button>
  {/if}
{/if}

<style>
  .me{font-weight:bold;}
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
