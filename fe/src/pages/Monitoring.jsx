import { useState } from "react";
import ChartFrequency from "../components/ChartFrequency.jsx";
import LogsBox from "../components/LogsBox.jsx";

export default function Monitoring() {
    // State untuk mengontrol filter tanggal global
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");

    // Fungsi helper untuk mendapatkan teks tanggal yang ditampilkan
    const getFilterText = () => {
        if (from && to) {
            return ` (Data dari ${from} hingga ${to})`;
        }
        if (from) {
            return ` (Data dari ${from} dan seterusnya)`;
        }
        if (to) {
            return ` (Data hingga ${to})`;
        }
        return " (Semua Data)";
    };

    return (
        <div className="p-4 sm:p-8 lg:p-12 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 font-sans text-gray-900">

            {/* Header Dashboard */}
            <h1 className="text-4xl font-extrabold text-gray-800 mb-12 border-b-4 border-blue-600/30 pb-4 flex items-center animate-fade-in-down">
                <svg className="w-10 h-10 mr-4 text-blue-600 drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-1.25-3M15 10V5a3 3 0 00-3-3H9a3 3 0 00-3 3v5m-3 0h18M3 10h18M6 10h12l2 6H4l2-6z"></path></svg>
                Real-Time Monitoring Dashboard
            </h1>

            {/* MAIN DASHBOARD LAYOUT: Grid 1 kolom di mobile, 3 kolom di desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10 animate-fade-in">

                {/* === KOLOM 1: FILTER (SIDEBAR) === */}
                <div className="lg:col-span-1">
                    {/* Filter Tanggal Global - PADDING DIKEMASKINI DARI p-7 KE p-5 UNTUK MOBILE */}
                    <div className="bg-white p-5 sm:p-7 rounded-3xl shadow-3xl border border-gray-100 lg:sticky lg:top-8 transition-all duration-500 transform hover:scale-[1.01] hover:shadow-blue-300/40 animate-slide-in-left">
                        <h2 className="text-2xl font-extrabold text-blue-700 mb-6 border-b-2 border-blue-100 pb-3 flex items-center">
                            <svg className="w-6 h-6 mr-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 16.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3z" clipRule="evenodd"></path></svg>
                            Date Filter
                        </h2>

                        {/* Input Group: Dibuat Flex (Horizontal) di tablet ke atas */}
                        <div className="flex flex-col md:flex-row gap-5 mb-7">

                            {/* Input From */}
                            <div className="flex flex-col flex-1">
                                <label htmlFor="date-from" className="text-gray-700 font-semibold mb-2 flex items-center text-sm">
                                    <svg className="w-4 h-4 mr-1 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-4 4h.01M3 18v-7a2 2 0 012-2h14a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2z"></path></svg>
                                    From Date
                                </label>
                                <input
                                    id="date-from"
                                    type="date"
                                    value={from}
                                    onChange={e => setFrom(e.target.value)}
                                    className="border border-gray-300 p-3 rounded-xl shadow-inner bg-gray-50 focus:outline-none focus:ring-4 focus:ring-blue-200/50 focus:border-blue-500 transition duration-300 text-gray-800 w-full"
                                />
                            </div>

                            {/* Input To */}
                            <div className="flex flex-col flex-1">
                                <label htmlFor="date-to" className="text-gray-700 font-semibold mb-2 flex items-center text-sm">
                                    <svg className="w-4 h-4 mr-1 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-4 4h.01M3 18v-7a2 2 0 012-2h14a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2z"></path></svg>
                                    To Date
                                </label>
                                <input
                                    id="date-to"
                                    type="date"
                                    value={to}
                                    onChange={e => setTo(e.target.value)}
                                    className="border border-gray-300 p-3 rounded-xl shadow-inner bg-gray-50 focus:outline-none focus:ring-4 focus:ring-blue-200/50 focus:border-blue-500 transition duration-300 text-gray-800 w-full"
                                />
                            </div>
                        </div>

                        {/* Reset Button */}
                        <button
                            onClick={() => { setFrom(""); setTo(""); }}
                            className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition duration-300 border border-blue-700 shadow-lg shadow-blue-500/30 focus:outline-none focus:ring-3 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center transform hover:scale-[1.02] active:scale-98"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                            Reset Filter
                        </button>
                    </div>
                </div>


                {/* === KOLOM 2: KONTEN UTAMA (Chart dan Logs) === */}
                <div className="lg:col-span-2 flex flex-col gap-8 md:gap-10">

                    {/* Komponen Chart */}
                    <div className="bg-white p-7 rounded-3xl shadow-3xl border border-gray-100 transition duration-500 transform hover:scale-[1.01] hover:shadow-green-300/40 animate-slide-in-right">
                        <h2 className="text-2xl font-extrabold text-gray-800 mb-5 pb-3 border-b-2 border-green-100 flex items-center">
                            <svg className="w-6 h-6 mr-3 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd"></path></svg>
                            Access Frequency Chart
                            <span className="text-base font-medium text-blue-600 block sm:inline ml-0 sm:ml-3 mt-1 sm:mt-0 opacity-80">
                                {getFilterText()}
                            </span>
                        </h2>
                        {/* Mengirimkan state filter ke komponen ChartFrequency */}
                        <ChartFrequency from={from} to={to} />
                    </div>

                    {/* Komponen Log */}
                    <div className="bg-white p-7 rounded-3xl shadow-3xl border border-gray-100 transition duration-500 transform hover:scale-[1.01] hover:shadow-orange-300/40 animate-slide-in-right delay-100">
                        <h2 className="text-2xl font-extrabold text-gray-800 mb-5 pb-3 border-b-2 border-orange-100 flex items-center">
                            <svg className="w-6 h-6 mr-3 text-orange-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h.01a1 1 0 100-2H10zm3 0a1 1 0 000 2h.01a1 1 0 100-2H13zm-3 4a1 1 0 000 2h.01a1 1 0 100-2H10zm3 0a1 1 0 000 2h.01a1 1 0 100-2H13z" clipRule="evenodd"></path></svg>
                            Recent Door Access Logs
                            <span className="text-base font-medium text-blue-600 block sm:inline ml-0 sm:ml-3 mt-1 sm:mt-0 opacity-80">
                                {getFilterText()}
                            </span>
                        </h2>
                        {/* Mengirimkan state filter ke komponen LogsBox */}
                        <LogsBox from={from} to={to} />
                    </div>
                </div>
            </div>
        </div>
    );
}
