import { useState } from "react";
import Monitoring from "./pages/Monitoring";
import Users from "./pages/Users";
import Login from "./pages/Login";

export default function App() {
    // Pastikan ID default cocok dengan salah satu menu
    const [activeMenu, setActiveMenu] = useState("monitoring");
    // FUNGSI INI DIKEKALKAN SEPERTI PERMINTAAN PENGGUNA
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

    const handleLogin = () => {
        setIsLoggedIn(true);
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
    };

    if (!isLoggedIn) return <Login onLogin={handleLogin} />;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            {/* Navbar yang lebih elegan dan bersih */}
            <header className="bg-white border-b border-gray-100 shadow-xl sticky top-0 z-20">
                <div className="max-w-full mx-auto flex justify-between items-center px-4 sm:px-6 lg:px-8 py-4">

                    {/* Logo / Title yang lebih menonjol */}
                    <div className="flex items-center space-x-3 flex-shrink-0">
                        <svg className="w-8 h-8 text-blue-700" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"></path>
                        </svg>
                        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 hidden sm:block">
                            IoT Door Lock
                        </h1>
                        <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:hidden">
                            Dashboard
                        </h1>
                    </div>

                    {/* Navigation - Lebih halus dan terfokus */}
                    <nav className="flex items-center gap-2 sm:gap-4">
                        {/* Tombol Navigasi Utama */}
                        {[
                            { id: "monitoring", label: "Monitoring" },
                            { id: "users", label: "Users" },
                        ].map((menu) => (
                            <button
                                key={menu.id}
                                className={`
                                px-4 sm:px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 transform
                                ${
                                    activeMenu === menu.id
                                        ? "bg-blue-700 text-white shadow-lg shadow-blue-500/50 ring-2 ring-blue-500/30 hover:bg-blue-800" // Tombol Aktif: Shadow lebih kuat, ring menonjol
                                        : "text-gray-600 hover:text-blue-700 hover:bg-blue-100/70 hover:shadow-sm" // Tombol Inaktif: Rupa yang lebih bersih
                                }
                            `}
                                onClick={() => setActiveMenu(menu.id)}
                            >
                                {menu.label}
                            </button>
                        ))}

                        {/* Logout Button (Desktop: Teks, Mobile: Ikon) */}
                        <button
                            className="ml-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-4 sm:px-5 py-2 rounded-full shadow-lg shadow-red-500/30 transition-all duration-300 transform hover:scale-[1.02] active:scale-95 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                            onClick={handleLogout}
                        >
                            {/* Teks di desktop/tablet */}
                            <span className="hidden sm:inline">Logout</span>
                            {/* Ikon di mobile */}
                            <svg className="w-5 h-5 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                        </button>
                    </nav>
                </div>
            </header>

            {/* Content - Hapus padding di sini agar komponen page yang menangani padding (Monitoring/Users) */}
            <main className="flex-grow w-full">
                {activeMenu === "monitoring" ? <Monitoring /> : <Users />}
            </main>
        </div>

    );
}
