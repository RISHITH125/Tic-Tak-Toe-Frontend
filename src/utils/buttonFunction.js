import { login } from './serverutils';


/**
 * buttonFunction: attempts to ensure an authenticated session and Nakama socket.
 * Returns a structured result so the caller (Home) can decide how to react.
 *
 * Possible returns:
 * - { status: 'need_name' }
 * - { status: 'notok', reason: 'username_taken'|'auth_failed'|'nakama_error'|... }
 * - { status: 'ok', session, nakama }
 */


async function buttonFunction(type, playerName, setGetName, setPlayerName,password,setSession) {
  if (!playerName) {
     if (typeof setGetName === 'function') setGetName(true);
    return { status: 'need_name' };
  }

  // Try stored session first
  const storedRaw = localStorage.getItem('session');
  let session = storedRaw ? JSON.parse(storedRaw) : null;


  if(session){
    return { status: 'ok', session };
  }


  // No valid stored session: call login
  try {
    const result = await login(playerName,password);

    // Support two shapes:
    // 1) { status: 'success', session: { token, user_id, username, ... } }
    // 2) { token, user_id, username, ... }
    if (result && typeof result === 'object') {
      if (result.status && result.status !== 'success') {
        // Authentication returned a non-success status (e.g. username exists)
        setGetName(true);
        return { status: 'notok', reason: result.status || 'auth_failed' };
      }
      console.log('buttonFunction login result', result);
      // Extract session object
      session = result.session ? result.session : result;
      if (!session) {
        // Unexpected reply
        return { status: 'notok', reason: 'auth_invalid_response' };
      }

      // Persist session and update username in UI
      try {
        localStorage.setItem('session', JSON.stringify(session));
        setSession(session);
        if (setPlayerName && session.username) setPlayerName(session.username);
      } catch (e) {
        console.warn('Failed to persist session', e);
      }


      // Action stubs - actual game flow should be implemented by caller or here
      if (type === 'quick') {
        console.log('Start Quick Match with', session.user_id || session.username);
      } else if (type === 'private' || type === 'create') {
        console.log('Create Room with', session.user_id || session.username);
      }

      return { status: 'ok', session: session };
    }

    return { status: 'notok', reason: 'auth_empty_response' };
  } catch (err) {
    console.error('buttonFunction auth error', err);
    // If login threw because username exists or other server-side check, surface that
    const reason = err?.response?.data?.message || err?.message || 'auth_exception';
    setGetName(true);
    return { status: 'notok', reason };
  }
}

export { buttonFunction };
