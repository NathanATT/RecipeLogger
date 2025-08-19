import axios from 'axios';
import { toast } from 'react-toastify';
import type { ApiError } from '../types';
import DetailedErrorToast from '../components/DetailedErrorToast'; // <-- IMPORT THE SHARED COMPONENT

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// The local DetailedErrorToast component has been removed from this file.

api.interceptors.response.use(
  (response) => response,
  (error: ApiError) => {
    const userMessage = error.response?.data?.message || 'An unexpected error occurred.';

    // Now we render the imported component inside the toast.
    toast.error(<DetailedErrorToast userMessage={userMessage} technicalError={error} />, {
      position: "bottom-right",
      autoClose: 5000,
      closeOnClick: false, // Important for interactivity
    });

    return Promise.reject(error);
  }
);

export default api;