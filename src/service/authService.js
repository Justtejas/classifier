import { toast } from "react-toastify";
import api from "./api";

export const login = async ({ email, password }) => {
    try {
        if (!email || !password) {
            throw new Error("Email and password are required.");
        }

        const response = await api.post("/login", { email, password });

        if (response.status === 200) {
            return response.data.token;
        } else {
            throw new Error("Login failed. Please try again.");
        }
    } catch (error) {
        const errorMessage = error.response?.data?.error || error.message || "An unexpected error occurred.";
        toast.error(errorMessage);
        console.error("Login error:", error);
        throw error;
    }
};

export const signUp = async ({ email, password }) => {
    try {
        if (!email || !password) {
            throw new Error("Email and password are required.");
        }

        const response = await api.post("/signup", { email, password });

        if (response.status === 201) {
            return true;
        } else {
            throw new Error("Sign-up failed. Please try again.");
        }
    } catch (error) {
        const errorMessage = error.response?.data?.error || error.message || "An unexpected error occurred.";
        toast.error(errorMessage);
        console.error("Sign-up error:", error);
        throw error;
    }
};
