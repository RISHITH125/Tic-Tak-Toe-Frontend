/*
  Lightweight Nakama client helper.
  This file creates and returns a connected Nakama socket using the provided session token.
  It tries to import the official nakama-js client dynamically; if not available, it exports a noop that returns null.
*/

import * as nakama from '@heroiclabs/nakama-js';

const NAKAMA_HOST = import.meta.env.VITE_NAKAMA_HOST || 'localhost';
const NAKAMA_PORT = import.meta.env.VITE_NAKAMA_PORT || '7350';
const NAKAMA_USE_SSL = (import.meta.env.VITE_NAKAMA_USE_SSL === 'false');


const socket = new nakama.Socket(NAKAMA_HOST,NAKAMA_PORT,NAKAMA_USE_SSL);

async function tryConnect(session) {
  if (!session || !session.token) {
    return { ok: false, reason: 'invalid_session' };
  }

  socket.setToken(session.token);
  const result = await socket.connect();

  if (!result.ok) {
    return { ok: false, reason: 'connection_failed' };
  }

  return { ok: true };
}
export { tryConnect };
