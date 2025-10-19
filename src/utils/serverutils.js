import axios from "axios";

const API_URL = import.meta.env.VITE_SERVER_HOST || "http://localhost:3000";

/**
 *  @param {string} username
 * @returns {Promise<{token: string}>} sessions info {token , user_id , username}
 *
 */

export const login = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}/auth/signin`, {
      username,
      password,
    });

    return response.data;
  } catch (error) {
    // If the server returned a structured error payload, preserve it so callers
    // can inspect status/message (e.g. Conflict: User already exists).
    const serverMessage =
      error?.response?.data?.message || error?.response?.data?.error || null;
    if (serverMessage) {
      // ensure the thrown error contains the server response and readable message
      error.message = serverMessage;
      throw error;
    }

    // Fallback to the original error message or a generic one
    throw new Error(error?.message || "Login failed");
  }
};

export const refreshSession = async (session) => {
  try {
    if (!session || !session.token) {
      throw new Error("Invalid session");
    }
    const response = await axios.post(`${API_URL}/auth/refresh`, { session });
    return response.data; // { token, user_id, username }
  } catch (error) {
    const serverMessage =
      error?.response?.data?.message || error?.response?.data?.error || null;
    if (serverMessage) {
      // ensure the thrown error contains the server response and readable message
      error.message = serverMessage;
      throw error;
    }
  }
};

export const quickMatch = async (session) => {
  try {
    const response = await axios.post(
      `${API_URL}/game/quick-match`,
      {},
      {
        headers: { Authorization: `Bearer ${session.token}` },
      }
    );

    return response.data;
  } catch (error) {
    const serverMessage =
      error?.response?.data?.message || error?.response?.data?.error || null;
    if (serverMessage) {
      // ensure the thrown error contains the server response and readable message
      error.message = serverMessage;
      throw error;
    }
  }
};

export const getLeaderboard = async (session) => {
  let response; 

  try {
    if (!session || !session.token) {
      response = await axios.get(`${API_URL}/user/leaderboard`);
    } else {
      response = await axios.get(`${API_URL}/user/leaderboard`, {
        headers: { Authorization: `Bearer ${session.token}` },
      });
    }

    return response.data; 
  } catch (error) {
    const serverMessage =
      error?.response?.data?.message || error?.response?.data?.error || null;
    if (serverMessage) {
      error.message = serverMessage;
      throw error;
    }
    throw error;
  }
};