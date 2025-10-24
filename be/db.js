import sql from 'mssql';
import dotenv from 'dotenv';
dotenv.config();

const config = {
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    driver: 'ODBC Driver 18 for SQL Server',
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
};

// Fungsi untuk ambil atau buat koneksi pool
let poolPromise = null;

export async function getPool() {
    if (!poolPromise) {
        try {
            console.log(`🔍 Connecting to: ${config.server}\\${config.database}`);
            poolPromise = await sql.connect(config);
            console.log('✅ Connected successfully to SQL Server!');
        } catch (err) {
            console.error('❌ DB connection error:\n', JSON.stringify(err, null, 2));
            throw err;
        }
    }
    return poolPromise;
}

// Ekspor juga modul sql untuk query helper
export { sql };
