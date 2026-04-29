-- Supabase Schema for Catalog Students (PostgreSQL)

-- 1. Users Table
CREATE TABLE user_accounts (
    id SERIAL PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('admin', 'penjual', 'pembeli')) NOT NULL,
    telepon VARCHAR(20),
    alamat TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Products Table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    penjual_id INTEGER NOT NULL REFERENCES user_accounts(id) ON DELETE CASCADE,
    nama_produk VARCHAR(255) NOT NULL,
    deskripsi TEXT,
    harga DECIMAL(12,2) NOT NULL,
    stok INTEGER NOT NULL DEFAULT 0,
    gambar VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Shopping Cart Table
CREATE TABLE shopping_cart (
    id SERIAL PRIMARY KEY,
    pembeli_id INTEGER NOT NULL REFERENCES user_accounts(id) ON DELETE CASCADE,
    produk_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    jumlah INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Orders Table
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    pembeli_id INTEGER NOT NULL REFERENCES user_accounts(id) ON DELETE CASCADE,
    total_harga DECIMAL(12,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','dibayar','diproses','dikirim','selesai','dibatalkan')),
    alamat_pengiriman TEXT,
    catatan TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- 5. Order Details Table
CREATE TABLE order_details (
    id SERIAL PRIMARY KEY,
    pesanan_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    produk_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    jumlah INTEGER NOT NULL DEFAULT 1,
    subtotal DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Chat Messages Table
CREATE TABLE chat_messages (
    id SERIAL PRIMARY KEY,
    pengirim_id INTEGER NOT NULL REFERENCES user_accounts(id) ON DELETE CASCADE,
    penerima_id INTEGER NOT NULL REFERENCES user_accounts(id) ON DELETE CASCADE,
    pesan TEXT NOT NULL,
    dibaca BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Set Row Level Security (RLS) policies if needed in the future
-- (Currently left open for server-side Next.js API access)
