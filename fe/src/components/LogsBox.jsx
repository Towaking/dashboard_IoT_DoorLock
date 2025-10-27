import { useEffect, useState } from "react";
import axios from "axios";

export default function LogsBox({ from, to }) {
    const [logs, setLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchLogs = () => {
        setIsLoading(true);
        let url = "/api/logs";
        if (from && to) url += `?from=${from}&to=${to}`;

        axios.get(url)
            .then(res => setLogs(res.data))
            .catch(err => {
                console.error("Error fetching logs:", err);
                setLogs([]);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    useEffect(() => {
        fetchLogs();
    }, [from, to]);

    // Format tanggal ke DD/MM/YYYY WIB
    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        return d.toLocaleDateString("en-GB", { timeZone: "Asia/Jakarta" });
    };

    // Format jam dari string "HH:MM:SS" UTC ke WIB
    const formatTime = (timeStr) => {
        if (!timeStr) return "";
        const d = new Date(`1970-01-01T${timeStr}Z`);
        return d.toLocaleTimeString("en-GB", {
            timeZone: "Asia/Jakarta",
            hour12: false
        });
    };

    const LogListContent = () => {
        // 1. Loading State
        if (isLoading) {
            return (
                <div className="flex items-center justify-center h-full min-h-[250px] text-gray-500">
                    <svg className="animate-spin h-6 w-6 mr-3 text-blue-500" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Fetching Door Logs...
                </div>
            );
        }

        // 2. Empty State
        if (logs.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center h-full min-h-[250px] text-gray-400 p-4">
                    <svg className="w-12 h-12 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <p className="font-semibold text-gray-600">No Access Logs</p>
                    <p className="text-sm">No door activity recorded for the current filter period.</p>
                </div>
            );
        }

        // 3. Log List (Data Ada)
        return (
            <div className="space-y-1">
                {logs.map((log, i) => {
                    const isFailed = log.user_name === "Unknown";
                    const displayName = log.user_name || "Unknown";
                    const actionText = isFailed ? "failed to open the door" : "opened the door";
                    const noteText = isFailed ? "Rejected" : log.note;
                    const iconColor = isFailed ? "text-red-500" : "text-green-500";

                    return (
                        <div
                            key={i}
                            className={`text-sm py-3 px-4 rounded-lg flex justify-between items-center group ${
                                i % 2 === 0 ? "bg-gray-50" : "bg-white"
                            } hover:bg-blue-50 transition duration-150 border border-transparent hover:border-blue-100`}
                        >
                            {/* Kolom 1: User dan Aksi */}
                            <div className="flex items-center">
                                <svg
                                    className={`w-5 h-5 mr-3 ${iconColor} flex-shrink-0`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    {isFailed ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    )}
                                </svg>

                                <span className="font-semibold text-gray-800">
                                    <span
                                        className={`font-extrabold ${
                                            isFailed ? "text-red-700" : "text-blue-700"
                                        }`}
                                    >
                                        {displayName}
                                    </span>
                                    <span className="text-gray-600 ml-2">{actionText}</span>
                                </span>

                                {noteText && (
                                    <span
                                        className={`italic ml-3 text-xs px-2 py-0.5 rounded-full border flex-shrink-0 ${
                                            isFailed
                                                ? "text-red-600 bg-red-100 border-red-200"
                                                : "text-gray-500 bg-gray-100 border-gray-200"
                                        }`}
                                    >
                                        {noteText}
                                    </span>
                                )}
                            </div>

                            {/* Kolom 2: Timestamp Block */}
                            <div className="text-right flex-shrink-0 bg-blue-50/50 border border-blue-100 rounded-lg p-1.5 min-w-[110px] text-center">
                                <span className="block text-xs font-semibold text-gray-700">
                                    {formatDate(log.event_date)}
                                </span>
                                <span className="block text-sm font-extrabold text-blue-800 tracking-wider">
                                    {formatTime(log.event_time)}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 transition duration-300 hover:shadow-xl">
            <div className="h-96 overflow-y-auto border border-gray-200 p-2 rounded-lg bg-gray-50 custom-scrollbar">
                <LogListContent />
            </div>
        </div>
    );
}
