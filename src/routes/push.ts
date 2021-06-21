import { createPusher } from '$lib/pusher';

export async function get() {
  const pusher = createPusher();

  pusher.trigger('presence-channel', 'my-event', {
    message: 'hello world',
  });

  return { body: 'OK' };
}
