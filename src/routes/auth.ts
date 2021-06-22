import { createPusher } from '$lib/pusher';
import cookie from 'cookie';
import querystring from 'querystring';

export async function post({ headers, rawBody }) {
  const body = querystring.parse(rawBody);
  const cookies = cookie.parse(headers.cookie);
  const pusher = createPusher();
  // console.log(body);
  // console.log(cookies.user_id);

  const socketId = body.socket_id;
  const channel = body.channel_name;
  // // Primitive auth: the client self-identifies. In your production app,
  // // the client should provide a proof of identity, like a session cookie.
  const user_id = cookies.user_id;
  const presenceData = { user_id, user_info: { name: body.name, score:body.score } };
  const auth = pusher.authenticate(socketId, channel, presenceData);

  return { body: auth };
}
