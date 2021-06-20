import Pusher from 'pusher';

import dotenv from 'dotenv'
dotenv.config();

const { PUSHER_SECRET, PUSHER_APPID, VITE_PUSHER_KEY: PUSHER_KEY } = process.env;



export async function get() {
  const pusher = new Pusher({
    appId:PUSHER_APPID,
    key: PUSHER_KEY,
    secret: PUSHER_SECRET,
    cluster: 'eu',
    useTLS: true,
  });


  pusher.trigger('my-channel', 'my-event', {
    message: 'hello world',
  });

  return { body: 'OK' };
}
