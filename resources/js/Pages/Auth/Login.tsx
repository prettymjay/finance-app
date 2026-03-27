import React, { useState, FormEvent } from 'react';
import { Link, router } from '@inertiajs/react';
import axios from 'axios';
import GuestLayout from '@/Layouts/GuestLayout';
import ApplicationLogo from '@/Components/ApplicationLogo';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await axios.post('/login', {
                username,
                password,
                remember,
            });

            if (response.status === 200) {
                router.visit('/dashboard');
            }
        } catch (err: any) {
            if (err.response?.status === 422) {
                setError('Invalid username or password');
            } else if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError('An error occurred during login. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <GuestLayout>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800 text-center">
                    Login to Your Account
                </h2>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Input */}
                <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                        Username
                    </label>
                    <input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        placeholder="you@example.com"
                    />
                </div>

                {/* Password Input */}
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        placeholder="••••••••"
                    />
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={remember}
                            onChange={(e) => setRemember(e.target.checked)}
                            className="h-4 w-4 text-blue-600 rounded border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-600">Remember me</span>
                    </label>
                    <Link
                        href="/forgot-password"
                        className="text-sm text-blue-600 hover:text-blue-800 transition"
                    >
                        Forgot Password?
                    </Link>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-2 px-4 rounded-lg font-medium text-white transition ${
                        loading
                            ? 'bg-blue-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
                    }`}
                >
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>

            {/* Register Link */}
            <div className="mt-6 text-center">
                <p className="text-gray-600">
                    Don't have an account?{' '}
                    <Link href="/register" className="text-blue-600 hover:text-blue-800 font-medium transition">
                        Register here
                    </Link>
                </p>
            </div>
        </GuestLayout>
    );
}