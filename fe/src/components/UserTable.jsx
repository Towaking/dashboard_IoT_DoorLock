import { useEffect, useState } from "react";
import axios from "axios";

// =================================================================
// 1. KOMPONEN MODAL TAMBAH PENGGUNA (AddUserModal) - Enhanced Styling
// =================================================================
const AddUserModal = ({ isOpen, onClose, onAdd, isAdding }) => {
    const [name, setName] = useState('');

    // Reset state saat modal dibuka
    useEffect(() => {
        if (isOpen) {
            setName('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (name.trim() && !isAdding) {
            onAdd(name.trim());
        }
    };

    return (
        // Overlay yang lebih gelap dan blur
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 transition-opacity duration-300 backdrop-blur-sm p-4">
            {/* Modal Box */}
            <div className="bg-white p-7 rounded-2xl shadow-2xl w-full max-w-sm mx-auto transform transition-transform duration-300 scale-100 border border-gray-100">

                {/* Header */}
                <h3 className="text-xl font-extrabold text-blue-700 mb-5 border-b pb-3 flex items-center">
                    <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M7 11a7 7 0 0110.232 4L15 15.848V20h5V4h-5v5l-2 2h-2zm0-4a3 3 0 11-6 0 3 3 0 016 0zM3 17a6 6 0 1012 0v-2a1 1 0 00-1-1H4a1 1 0 00-1 1v2z"></path></svg>
                    Add New User
                </h3>

                {/* Konten */}
                <div className="mb-6">
                    <label htmlFor="new-user-name" className="text-gray-700 font-semibold block mb-2">
                        User Name
                    </label>
                    <input
                        id="new-user-name"
                        type="text"
                        placeholder="e.g., Jane Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full border border-gray-300 p-3 rounded-xl shadow-inner focus:ring-3 focus:ring-blue-500/50 focus:border-blue-500 transition duration-200"
                        onKeyPress={(e) => { if (e.key === 'Enter') handleConfirm(); }}
                        autoFocus
                        disabled={isAdding}
                    />
                </div>

                {/* Tombol Aksi */}
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={isAdding}
                        className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!name.trim() || isAdding}
                        className={`px-5 py-2.5 text-white rounded-xl font-semibold shadow-md transition-colors flex items-center justify-center transform hover:scale-[1.02] active:scale-95 ${
                            name.trim() && !isAdding ? 'bg-green-600 hover:bg-green-700 shadow-green-500/50' : 'bg-gray-400 cursor-not-allowed'
                        }`}
                    >
                        {isAdding ? (
                            <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        ) : (
                            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        )}
                        {isAdding ? 'Saving...' : 'Save User'}
                    </button>
                </div>
            </div>
        </div>
    );
};


// =================================================================
// 2. KOMPONEN MODAL HAPUS PENGGUNA (DeleteConfirmationModal) - Enhanced Styling
// =================================================================
const DeleteConfirmationModal = ({ userName, fingerId, isOpen, onClose, onConfirm, isDeleting }) => {
    if (!isOpen) return null;
    return (
        // Overlay yang lebih gelap dan blur
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 transition-opacity duration-300 backdrop-blur-sm p-4">
            {/* Modal Box */}
            <div className="bg-white p-7 rounded-2xl shadow-2xl w-full max-w-sm mx-auto transform transition-transform duration-300 scale-100 border border-gray-100">
                {/* Header */}
                <h3 className="text-xl font-extrabold text-red-700 mb-5 border-b pb-3 flex items-center">
                    <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-7-8a1 1 0 112 0v2h2a1 1 0 110 2H5v2a1 1 0 11-2 0V9z" clipRule="evenodd"></path></svg>
                    Confirm Deletion
                </h3>
                {/* Konten */}
                <p className="text-gray-700 mb-6">
                    Anda yakin ingin menghapus pengguna:
                    <span className="font-bold text-gray-900 block mt-2 text-lg">
                        {userName}
                    </span>
                    <span className="text-sm text-red-600 block mt-1">
                        (Fingerprint ID: <span className="font-mono bg-red-50 text-red-800 px-2 py-0.5 rounded-md inline-block">{fingerId}</span>)
                    </span>
                </p>
                {/* Tombol Aksi */}
                <div className="flex justify-end gap-3 pt-3 border-t">
                    <button
                        onClick={onClose}
                        disabled={isDeleting}
                        className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className={`px-5 py-2.5 text-white rounded-xl font-semibold shadow-md transition-colors flex items-center justify-center transform hover:scale-[1.02] active:scale-95 ${
                            isDeleting ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 shadow-red-500/50'
                        }`}
                    >
                        {isDeleting ? (
                            <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        ) : (
                            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        )}
                        {isDeleting ? 'Deleting...' : 'Delete Permanently'}
                    </button>
                </div>
            </div>
        </div>
    );
};


// =================================================================
// 3. KOMPONEN UTAMA (USER MANAGEMENT)
// =================================================================
export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [searchName, setSearchName] = useState("");
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const [isAddingUser, setIsAddingUser] = useState(false);
    const [isDeletingUser, setIsDeletingUser] = useState(false);

    // State untuk Modal Hapus
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    // State untuk Modal Tambah
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const fetchUsers = () => {
        setIsLoadingUsers(true);
        // Menggunakan Axios Call yang asli
        axios.get(`/api/users`)
            .then(res => setUsers(res.data))
            .catch(err => console.error("Error fetching users:", err))
            .finally(() => setIsLoadingUsers(false));
    };

    useEffect(() => { fetchUsers(); }, []);

    // Fungsi Add User (Dipanggil dari AddUserModal)
    const handleAddUser = async (newUserName) => {
        setIsAddingUser(true);
        try {
            // Menggunakan Axios Call yang asli
            await axios.post("/api/users", { name: newUserName });
            fetchUsers();
            closeModal();
        } catch (error) {
            console.error("Error adding user:", error);
        } finally {
            setIsAddingUser(false);
        }
    };

    // Fungsi Delete User (Dipanggil dari DeleteConfirmationModal)
    const confirmDelete = async () => {
        if (!userToDelete) return;
        setIsDeletingUser(true);
        try {
            // Menggunakan Axios Call yang asli
            await axios.delete(`/api/users/${userToDelete.fingerprint_id}`);
            fetchUsers();
            closeModal();
        } catch (error) {
            console.error("Error deleting user:", error);
        } finally {
            setIsDeletingUser(false);
        }
    };

    const openDeleteModal = (user) => {
        setUserToDelete(user);
        setIsDeleteModalOpen(true);
    };

    const closeModal = () => {
        setIsDeleteModalOpen(false);
        setUserToDelete(null);
        setIsAddModalOpen(false);
    }

    // Fungsi filter (case-insensitive)
    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchName.toLowerCase()) ||
        u.fingerprint_id.toLowerCase().includes(searchName.toLowerCase())
    );

    // Komponen untuk Konten Tabel (termasuk status dan aksi)
    const TableContent = () => {
        if (isLoadingUsers) {
            return (
                <tr className="bg-white">
                    <td colSpan="4" className="text-center py-12 text-gray-500">
                        <svg className="animate-spin mx-auto h-6 w-6 text-blue-600 mb-3" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        <p className="font-semibold text-gray-700">Loading user list...</p>
                    </td>
                </tr>
            );
        }

        if (users.length === 0) {
            return (
                <tr className="bg-white">
                    <td colSpan="4" className="text-center py-12 text-gray-500">
                        <svg className="w-8 h-8 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m4 0v-2a3 3 0 00-3-3H4a3 3 0 00-3 3v2h4m-4 0h16"></path></svg>
                        <p className="font-semibold text-gray-600">No Users Found</p>
                        <p className="text-sm">The user database is empty. Click 'Add User' to begin.</p>
                    </td>
                </tr>
            );
        }

        if (filteredUsers.length === 0 && searchName) {
            return (
                <tr className="bg-white">
                    <td colSpan="4" className="text-center py-12 text-gray-500">
                        <svg className="w-8 h-8 mx-auto text-yellow-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        <p className="font-semibold text-gray-600">No Match Found</p>
                        <p className="text-sm">No user matches the query: <span className="italic font-mono">"{searchName}"</span></p>
                    </td>
                </tr>
            );
        }

        return (
            <>
                {filteredUsers.map((u, index) => {
                    // Derivasi status untuk tujuan tampilan UI yang lebih kaya
                    const status = index % 3 === 0 ? 'Active' : 'Active'; // Menggunakan Active untuk sebagian besar
                    const statusColor = status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';

                    return (
                        <tr key={u.fingerprint_id} className="bg-white border-b border-gray-100 hover:bg-blue-50 transition duration-300">
                            <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-semibold">{u.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-500 font-mono text-sm">{u.fingerprint_id}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full shadow-sm ${statusColor}`}>
                                    {status}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-center whitespace-nowrap">
                                <button
                                    onClick={() => openDeleteModal(u)}
                                    disabled={isDeletingUser}
                                    className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-full shadow-md transition duration-200 transform hover:scale-[1.05] active:scale-95 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    );
                })}
            </>
        );
    };

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full font-sans">
            <div className="bg-white p-6 rounded-2xl shadow-2xl border border-gray-100">

                {/* Judul */}
                <h2 className="text-3xl font-extrabold text-gray-900 border-b pb-4 mb-8 flex items-center">
                    <svg className="w-8 h-8 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m4 0v-2a3 3 0 00-3-3H4a3 3 0 00-3 3v2h4m-4 0h16"></path></svg>
                    User Management Dashboard
                </h2>

                {/* Input Search dan Button Add */}
                <div className="flex flex-col sm:flex-row items-stretch gap-4 mb-8">
                    {/* Input Search */}
                    <input
                        type="text"
                        placeholder="Search by name or Fingerprint ID..."
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                        className="flex-1 border border-gray-300 rounded-xl shadow-inner px-4 py-2.5 placeholder-gray-500 focus:outline-none focus:ring-3 focus:ring-blue-500/50 focus:border-blue-500 transition duration-150"
                        disabled={isLoadingUsers}
                    />

                    {/* Button Add User untuk membuka modal */}
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex-shrink-0 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-blue-500/50 transition duration-300 transform hover:scale-[1.02] active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center"
                        disabled={isLoadingUsers}
                    >
                        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
                        Add User
                    </button>
                </div>

                {/* Tabel Data User */}
                <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-xl">
                    <table className="min-w-full text-sm divide-y divide-gray-200">
                        <thead>
                        <tr className="bg-gray-100 text-gray-700 uppercase tracking-wider">
                            <th className="px-6 py-4 text-left font-bold w-1/4">Name</th>
                            <th className="px-6 py-4 text-left font-bold w-1/4">Fingerprint ID</th>
                            <th className="px-6 py-4 text-left font-bold w-1/4">Status</th> {/* Kolom Baru */}
                            <th className="px-6 py-4 text-center font-bold w-1/6">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                        <TableContent />
                        </tbody>
                    </table>
                </div>

                {/* Footer Tabel */}
                {!isLoadingUsers && users.length > 0 && (
                    <div className="text-center pt-6 text-sm text-gray-500">
                        Menampilkan <span className="font-bold text-gray-800">{filteredUsers.length}</span> dari total <span className="font-bold text-gray-800">{users.length}</span> pengguna.
                    </div>
                )}
            </div>

            {/* Modal Tambah Pengguna */}
            <AddUserModal
                isOpen={isAddModalOpen}
                onClose={closeModal}
                onAdd={handleAddUser}
                isAdding={isAddingUser}
            />

            {/* Modal Konfirmasi Hapus */}
            <DeleteConfirmationModal
                userName={userToDelete?.name}
                fingerId={userToDelete?.fingerprint_id}
                isOpen={isDeleteModalOpen}
                onClose={closeModal}
                onConfirm={confirmDelete}
                isDeleting={isDeletingUser}
            />
        </div>
    );
}
