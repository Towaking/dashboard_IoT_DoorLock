import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import axios from "axios";

export default function ChartFrequency({ from, to }) {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false); // State baru untuk loading

    const fetchData = () => {
        setIsLoading(true); // Mulai loading
        let url = "/api/logs/frequency";
        if (from && to) url += `?from=${from}&to=${to}`;

        axios.get(url)
            .then(res => setData(res.data))
            .catch(err => {
                console.error("Error fetching frequency:", err);
                setData([]); // Pastikan data kosong jika ada error
            })
            .finally(() => {
                setIsLoading(false); // Selesai loading
            });
    };

    useEffect(() => {
        fetchData();
    }, [from, to]); // otomatis fetch saat from/to berubah

    // Placeholder untuk kondisi data kosong atau sedang loading
    const ChartContent = () => {
        if (isLoading) {
            return (
                <div className="flex items-center justify-center h-full min-h-[300px] text-gray-500">
                    {/* Loading Spinner */}
                    <svg className="animate-spin h-6 w-6 mr-3 text-blue-500" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading Chart Data...
                </div>
            );
        }

        if (data.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-gray-500">
                    <svg className="w-12 h-12 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0h6"></path></svg>
                    <p className="font-semibold">No access data found</p>
                    <p className="text-sm">Try adjusting the date filter.</p>
                </div>
            );
        }

        return (
            <ResponsiveContainer width="100%" height={300}>
                <BarChart
                    data={data}
                    margin={{ top: 15, right: 10, left: -15, bottom: 5 }} // Padding disesuaikan
                >
                    <CartesianGrid strokeDasharray="4 4" stroke="#f3f4f6" vertical={false} /> {/* Garis vertikal dihilangkan */}
                    <XAxis
                        dataKey="user_name"
                        stroke="#6b7280" // abu-abu gelap
                        fontSize={12}
                        tickLine={false}
                        axisLine={{ stroke: '#e5e7eb' }} // Tambah garis sumbu X yang halus
                        // Menyesuaikan label jika terlalu banyak
                        interval={0}
                        angle={-25}
                        textAnchor="end"
                        height={60}
                    />
                    <YAxis
                        stroke="#6b7280" // abu-abu gelap
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => (value >= 1000 ? `${value / 1000}k` : value)}
                    />
                    <Tooltip
                        cursor={{ fill: '#f3f4f6' }} // Efek highlight bar yang lebih halus
                        contentStyle={{
                            backgroundColor: '#ffffff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '0.5rem',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            padding: '0.5rem',
                            fontSize: '0.875rem' // text-sm
                        }}
                        formatter={(value, name) => [value, "Total Access"]} // Ubah label tooltip
                    />
                    <Bar
                        dataKey="cnt"
                        fill="#2563eb" // Menggunakan blue-600 yang lebih standar dan cerah
                        radius={[8, 8, 0, 0]}
                        // Menggunakan gradien atau warna yang berbeda untuk efek visual yang lebih kaya (opsional)
                        // activeBar={<Rectangle fill="#1d4ed8" stroke="#3b82f6" />}
                    />
                </BarChart>
            </ResponsiveContainer>
        );
    };

    return (
        // Wrapper luar (card sudah didefinisikan di komponen Monitoring)
        <div className="p-2">
            {/* Judul akan ditangani di komponen induk (Monitoring.jsx) */}

            <div className="min-h-[300px]">
                <ChartContent />
            </div>
        </div>
    );
}
