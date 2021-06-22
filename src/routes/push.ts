import { createPusher } from '$lib/pusher';

export async function get({query}) {
  const pusher = createPusher();

  pusher.trigger('presence-channel', 'message', {action:query.get('action'),data:query.get('data')});

  return { body: 'OK' };
}
