import { useState } from "react";
import api from "../utils/axiosInstance";


export default function Login({ onLogin }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            // Logika pemanggilan API asal anda
            const res = await api.post("/auth/login", { username, password });

            localStorage.setItem("token", res.data.token);

            onLogin();

        } catch (err) {
            console.error(err);
            let errorMessage = err.response?.data?.error || "Login failed";
            if (err.response?.status) {
                errorMessage = `${err.response.data?.error || 'Server error'}`;
            }
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 p-4 font-sans">

            <form
                onSubmit={handleSubmit}
                className="bg-white p-8 sm:p-10 rounded-2xl shadow-2xl w-full max-w-sm border border-gray-100 transform transition-all duration-300 hover:shadow-blue-300/60"
            >

                <div className="flex flex-col items-center mb-8">
                    <div className="bg-blue-600 p-3 rounded-full mb-4 shadow-xl shadow-blue-500/40 transform hover:scale-105 transition-transform duration-300">
                        <svg
                            // Animasi naik turun (bounce) di logo
                            className={`w-8 h-8 text-white ${isLoading ? 'animate-bounce' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a4 4 0 00-8 0v4H6a2 2 0 00-2 2v6a2 2 0 002 2h12a2 2 0 002-2v-6a2 2 0 00-2-2h-1V7a4 4 0 00-4-4z"></path>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11v6"></path>
                        </svg>
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">Admin Login</h2>
                </div>


                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6 shadow-md transition-opacity duration-300" role="alert">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                            <p className="font-semibold text-sm">{error}</p>
                        </div>
                    </div>
                )}


                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-5 py-3 mb-4 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-blue-200/50 focus:border-blue-500 transition duration-300 shadow-inner bg-gray-50"
                    required
                    disabled={isLoading}
                />


                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-5 py-3 mb-6 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-blue-200/50 focus:border-blue-500 transition duration-300 shadow-inner bg-gray-50"
                    required
                    disabled={isLoading}
                />


                <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full text-white font-bold py-3 rounded-xl shadow-xl transition duration-300 focus:outline-none focus:ring-4 focus:ring-offset-2 flex items-center justify-center transform active:scale-[0.98] ${
                        isLoading
                            ? 'bg-blue-400 cursor-not-allowed shadow-blue-300/50'
                            : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/50 focus:ring-blue-500'
                    }`}
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Authenticating...
                        </>
                    ) : (
                        "Login ke Dashboard"
                    )}
                </button>

                <div className="text-center mt-6">
                    <a href="#" className="text-sm text-blue-600 hover:text-blue-800 hover:underline">
                        Lupa Password?
                    </a>
                </div>
            </form>
        </div>
    );
}
