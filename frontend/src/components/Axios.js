import axios from 'axios';

const baseUrl = 'http://127.0.0.1:8000/';
const AxiosInstance = axios.create({
    baseURL: baseUrl,
    headers: {
        'Content-Type': 'application/json',
        accept: 'application/json'
    }
});

// Automatically include the Authorization token in every request if available
AxiosInstance.interceptors.request.use((config) => {
    const authTokens = localStorage.getItem('authTokens') ? JSON.parse(localStorage.getItem('authTokens')) : null;

    if (authTokens) {
        config.headers['Authorization'] = `Bearer ${authTokens.access}`;
    }

    return config;
}, (error) => {
    return Promise.reject(error);
});

// Intercept responses to handle token refresh if the access token has expired
AxiosInstance.interceptors.response.use((response) => {
    return response;  // If the response is successful, return it
}, async (error) => {
    const originalRequest = error.config;  // Save the original request configuration

    // Check if the error is due to an expired token (401 Unauthorized)
    if (error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;  // Mark the request as retried

        // Retrieve authentication tokens from local storage
        const authTokens = localStorage.getItem('authTokens') ? JSON.parse(localStorage.getItem('authTokens')) : null;

        // Try to refresh the token if a refresh token is available
        if (authTokens) {
            try {
                // Make a request to refresh the access token
                const response = await axios.post(`${baseUrl}token/refresh/`, {
                    refresh: authTokens.refresh  // Include the refresh token in the request
                });

                // Update localStorage with the new tokens
                localStorage.setItem('authTokens', JSON.stringify({
                    ...authTokens,  // Retain the old tokens
                    access: response.data.access  // Update the access token with the new one
                }));

                // Update the Authorization header with the new access token
                AxiosInstance.defaults.headers['Authorization'] = `Bearer ${response.data.access}`;
                originalRequest.headers['Authorization'] = `Bearer ${response.data.access}`;  // Set the new token in the original request

                // Retry the original request with the new access token
                return AxiosInstance(originalRequest);  // Return the retried request
            } catch (refreshError) {
                // If refreshing the token fails, force log out
                console.error("Failed to refresh token:", refreshError);  // Log the error
                localStorage.removeItem('authTokens');  // Remove tokens from local storage
                window.location.href = '/login';  // Redirect to login page
            }
        } else {
            // If no tokens are found, redirect to login
            window.location.href = '/login';  // Redirect to login page
        }
    }

    return Promise.reject(error);  // Reject the promise for any other errors
});

export default AxiosInstance;