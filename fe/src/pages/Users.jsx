import UserTable from "../components/UserTable";

export default function Users() {
    return (
        // Container utama untuk halaman Users
        <div className="p-4 sm:p-8 lg:p-12 min-h-screen bg-gray-50 font-sans">

            {/* Header Halaman - Disesuaikan dengan gaya Monitoring.jsx */}
            <h1 className="text-3xl font-extrabold text-gray-800 mb-10 border-b-4 border-blue-500/20 pb-3">
                User Management Console
            </h1>
            <UserTable />

        </div>
    );
}
