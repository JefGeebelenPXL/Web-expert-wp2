import { defineStore } from 'pinia';
import axios from 'axios';
import { reactive, ref } from 'vue';

const securityUrl = 'http://localhost:3000/security';
const taskUrl = 'http://localhost:3000/task';
const adminUrl = 'http://localhost:3000/admin';

export const useStore = defineStore('store', {
    state: () => ({
        user: {},
        tasks: [],
        allTasks: [],
        users: [],
        loading: false
    }),

    getters: {
        isAdmin: (state) => state.user.roles?.includes('admin') ?? false
    },

    actions: {
        async login(credentials) {
            this.loading = true;
            this.user = {};
            this.tasks = [];
            try {
                const { username, password } = credentials;
                const axiosConfig = { withCredentials: true };
                const response = await axios.post(`${securityUrl}/login`, { username, password }, axiosConfig);
                this.user = response.data;
            } catch (error) {
                throw new Error(error.message || 'Login failed');
            } finally {
                this.loading = false;
            }
        },

        async logout() {
            this.loading = true;
            this.user = {};
            this.tasks = [];
            try {
                const axiosConfig = { withCredentials: true };
                await axios.post(`${securityUrl}/logout`, {}, axiosConfig);
            } catch (error) {
                throw new Error(error.message || 'Logout failed');
            } finally {
                this.loading = false;
            }
        },

        async checkLogin() {
            this.loading = true;
            this.user = {};
            try {
                const axiosConfig = { withCredentials: true };
                const response = await axios.post(`${securityUrl}/login/check`, {}, axiosConfig);
                this.user = response.data;
            } catch (error) {
                throw new Error(error.message || 'Login check failed');
            } finally {
                this.loading = false;
            }
        },

        async changeCompleted(taskId, completed) {
            this.loading = true;
            try {
                const userId = this.user._id;
                const axiosConfig = { withCredentials: true };
                const response = await axios.patch(`${taskUrl}/${taskId}`, { completed }, axiosConfig);
                const index = this.tasks.findIndex(task => task._id === taskId);
                this.tasks[index].completed = completed;
            } catch (error) {
                throw new Error(error.message || 'Failed to update task completion status');
            } finally {
                this.loading = false;
            }
        },

        async retrieveOwnTasks() {
            this.loading = true;
            this.tasks = [];
            try {
                const id = this.user._id;
                const axiosConfig = {withCredentials: true};
                const response = await axios.get(`${taskUrl}/`, axiosConfig);
                this.tasks = response.data;
            } catch (error) {
                throw new Error(error.message || 'Failed to retrieve tasks');
            } finally {
                this.loading = false;
            }
        },

        // ---------- admin ----------

        async retrieveAllTasks() {
            this.loading = true;
            try {
                const axiosConfig = {withCredentials: true};
                const response = await axios.get(`${adminUrl}/tasks`, axiosConfig);
                this.allTasks = response.data;
            } catch (error) {
                throw new Error(error.response?.data?.error?.message || 'Failed to retrieve all tasks');
            } finally {
                this.loading = false;
            }
        },

        async retrieveAllUsers() {
            this.loading = true;
            try {
                const axiosConfig = {withCredentials: true};
                const response = await axios.get(`${adminUrl}/users`, axiosConfig);
                this.users = response.data;
            } catch (error) {
                throw new Error(error.response?.data?.error?.message || 'Failed to retrieve users');
            } finally {
                this.loading = false;
            }
        },

        async assignTask(taskId, userId) {
            try {
                const axiosConfig = {withCredentials: true};
                const response = await axios.patch(`${adminUrl}/tasks/${taskId}/assign`, {userId}, axiosConfig);
                const index = this.allTasks.findIndex(task => task._id === taskId);
                this.allTasks[index] = response.data;
            } catch (error) {
                throw new Error(error.response?.data?.error?.message || 'Failed to assign task');
            }
        }
    }
});
