import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { signUp } from "../service/authService";

export default function Signup() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);

    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const validatePassword = (password) =>
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(password);

    const handleSignup = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            toast.error('Please fill in all fields');
            setLoading(false)
            return;
        }

        if (!validateEmail(email)) {
            toast.error("Email must be a valid email address");
            return;
        }
        if (!validatePassword(password)) {
            toast.error("Password must be 8+ chars with upper, lower, number, and symbol");
            return;
        }
        try {
            setLoading(true);
            const response = await signUp({ email, password })
            if (response) {
                toast.success("Account created successfully. Redirecting to  login.", { autoClose: 1800 });
                setTimeout(() => {
                    navigate("/login");
                }, 2000)
            }
        } catch (err) {
            toast.error(err);
        } finally {
            setTimeout(() => {
                setLoading(false)
            }, 1500);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-300/80 to-pink-400/80 p-4">
            <div className="bg-white rounded-2xl shadow-md w-full max-w-md p-6 space-y-4">

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
                <h2 className="text-3xl font-bold text-center text-blue-900 mb-2">Welcome</h2>
                <p className="text-center text-blue-700 mb-6">Please sign up to continue</p>
                <form onSubmit={handleSignup} className="space-y-5">
                    <div>
                        <label className="block text-blue-800 font-medium mb-1">Email</label>
                        <input
                            type="text"
                            className="w-full px-4 py-3 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-teal-400"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
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
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white
                    font-bold py-3 rounded-xl transition-all duration-300 flex
                    justify-center"
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
                            'Sign up'
                        )}
                    </button>

                </form>

                <div className="text-center mt-4">
                    <span className="text-blue-700">Log in instead?</span>
                    <button
                        onClick={() => navigate("/login")}
                        className="ml-1 text-teal-600 font-bold"
                    >
                        Log In
                    </button>
                </div>
            </div>
        </div>
    );
}
