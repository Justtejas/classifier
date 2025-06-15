import React, { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();

        if (!username || !password) {
            toast.error('Please fill in all fields');
            return;
        }

        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            if (username === 'test' && password === '1234') {
                toast.success('Login Successful!');
                sessionStorage.setItem('isLoggedIn', 'true');
                navigate('/');
            } else {
                toast.error('Login Failed!');
            }
        }, 2000);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-300/80 to-pink-400/80 p-4">
            <ToastContainer />
            <div className="bg-white shadow-lg rounded-2xl w-full max-w-md p-8">
                <div className="flex justify-center mb-6">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-20 w-20 text-blue-800"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </div>
                <h2 className="text-3xl font-bold text-center text-blue-900 mb-2">Welcome Back!</h2>
                <p className="text-center text-blue-700 mb-6">Please log in to continue</p>

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-blue-800 font-medium mb-1">Username</label>
                        <input
                            type="text"
                            className="w-full px-4 py-3 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-teal-400"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter username"
                        />
                    </div>

                    <div>
                        <label className="block text-blue-800 font-medium mb-1">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="w-full px-4 py-3 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-teal-400"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3 text-blue-800"
                            >
                                {showPassword ? '🙈' : '👁️'}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl transition-all duration-300 flex justify-center"
                    >
                        {loading ? (
                            <svg
                                className="animate-spin h-5 w-5 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8v8H4z"
                                />
                            </svg>
                        ) : (
                            'LOG IN'
                        )}
                    </button>
                </form>

                <div className="text-center mt-4">
                    <span className="text-blue-700">Don't have an account?</span>
                    <button
                        onClick={() => toast.info('Signup not implemented')}
                        className="ml-1 text-teal-600 font-bold"
                    >
                        Sign up
                    </button>
                </div>
            </div>
        </div>
    );
}

