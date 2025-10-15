import axios from "axios";
import CryptoJS from 'crypto-js';

const API_URL = import.meta.env.VITE_SERVER_HOST || 'http://localhost:3000';

/**
 *  @param {string} username
 * @returns {Promise<{token: string}>} sessions info {token , user_id , username}
 * 
 */

const hashPassword = (password) => {
    return CryptoJS.SHA256(password).toString();
};


export const login = async (username,password) => {
    try {
        password = hashPassword(password);
        const response = await axios.post(`${API_URL}/auth`, { username,password });
        return response.data; // { token, user_id, username }
    } catch (error) {
            // If the server returned a structured error payload, preserve it so callers
            // can inspect status/message (e.g. Conflict: User already exists).
            const serverMessage = error?.response?.data?.message || error?.response?.data?.error || null;
            if (serverMessage) {
                // ensure the thrown error contains the server response and readable message
                error.message = serverMessage;
                throw error;
            }

            // Fallback to the original error message or a generic one
            throw new Error(error?.message || 'Login failed');
    }
};