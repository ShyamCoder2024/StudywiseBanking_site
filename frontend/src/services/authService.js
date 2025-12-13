import api from './api';

export const authService = {
    // Student Registration
    async register(userData) {
        const response = await api.post('/auth/register', userData);
        return response.data;
    },

    // Student Login
    async login(credentials) {
        const response = await api.post('/auth/login', credentials);
        return response.data;
    },

    // Admin Login
    async adminLogin(credentials) {
        const response = await api.post('/auth/admin/login', credentials);
        return response.data;
    },

    // Forgot Password - Send OTP
    async sendOTP(email) {
        const response = await api.post('/auth/forgot-password', { email });
        return response.data;
    },

    // Verify OTP
    async verifyOTP(email, otp) {
        const response = await api.post('/auth/verify-otp', { email, otp });
        return response.data;
    },

    // Reset Password
    async resetPassword(email, otp, newPassword) {
        const response = await api.post('/auth/reset-password', { email, otp, newPassword });
        return response.data;
    },

    // Get current user profile
    async getProfile() {
        const response = await api.get('/auth/profile');
        return response.data;
    },

    // Update profile
    async updateProfile(userData) {
        const response = await api.put('/auth/profile', userData);
        return response.data;
    },
};

export default authService;
