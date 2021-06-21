import Pusher from 'pusher';

import dotenv from 'dotenv';
dotenv.config();

import { PUSHER_KEY, PUSHER_CLUSTER } from '$lib/Env';
const { PUSHER_SECRET, PUSHER_APPID } = process.env;

let pusher;
export function createPusher() {
  if (pusher) return pusher;
  pusher = new Pusher({
    appId: PUSHER_APPID,
    key: PUSHER_KEY,
    secret: PUSHER_SECRET,
    cluster: PUSHER_CLUSTER,
    useTLS: true,
  });
  return pusher;
}
