# Server

Tentu, ini adalah rancangan Entity Relationship Diagram (ERD) yang disesuaikan dengan kebutuhan Group Project kamu (Chat App mirip Discord/WhatsApp) dengan fitur Real-time, Group Management, dan AI Suggestions.

Karena kamu menggunakan arsitektur Client-Server (React + Node.js/Database) dan diwajibkan menggunakan Real Time Communication, struktur database ini dirancang agar efisien untuk query chat history dan manajemen user.

Rancangan ERD (Entity Relationship Diagram)

Berikut adalah visualisasi hubungan antar tabel. Kamu bisa menggunakan referensi ini untuk membuat migrasi database (misalnya menggunakan Sequelize atau Prisma).

```
erDiagram
    Users ||--o{ GroupMembers : "joins"
    Users ||--o{ Messages : "sends"
    Users ||--o{ Groups : "creates/owns"

    Groups ||--o{ GroupMembers : "has"
    Groups ||--o{ Messages : "contains"
    Groups ||--|| Messages : "last_message_link"

    Users {
        int id PK
        string username
        string email
        string password
        string avatar_url
        timestamp created_at
    }

    Groups {
        int id PK
        string name "Nullable for private chat"
        enum type "private, group"
        int admin_id FK "Owner of the group"
        int last_message_id FK "Optimization for inbox list"
        timestamp created_at
        timestamp updated_at
    }

    GroupMembers {
        int id PK
        int group_id FK
        int user_id FK
        timestamp joined_at
    }

    Messages {
        int id PK
        int group_id FK
        int sender_id FK
        text content
        boolean is_ai_generated "Optional: if AI replies directly"
        timestamp created_at
    }
```

Penjelasan Detail Tabel & Fitur

Berikut adalah penjelasan bagaimana setiap tabel mendukung fitur yang kamu minta:

1. Tabel Users

Menyimpan data pengguna aplikasi.

Kolom Penting: username, email, password, avatar_url.

Hubungan:

One-to-Many ke Messages (User bisa mengirim banyak pesan).

One-to-Many ke Groups (User bisa menjadi admin di banyak grup).

2. Tabel Groups (Conversations)

Tabel ini merepresentasikan sebuah "ruang obrolan", baik itu Private Chat (1-on-1) maupun Group Chat.

Fitur "Membuat Group & Admin":

Kolom admin_id: Menyimpan ID user yang membuat grup. User ini yang memiliki hak akses untuk menambah/menghapus member (sesuai requirement).

Kolom type: Bernilai 'private' atau 'group'.

Fitur "Menampilkan Pesan Terakhir":

Kolom last_message_id: Ini adalah Foreign Key yang mengarah ke tabel Messages. Setiap kali ada pesan baru masuk ke grup ini, kolom ini di-update.

Kenapa butuh ini? Agar saat kamu menampilkan daftar chat (Inbox), kamu tidak perlu melakukan query berat mencari pesan terakhir di tabel Messages yang isinya bisa jutaan. Cukup ambil dari kolom ini.

3. Tabel GroupMembers (Pivot Table)

Tabel penghubung antara Users dan Groups. Ini memungkinkan satu grup memiliki banyak user, dan satu user bergabung di banyak grup (Many-to-Many).

Fitur "Menambah/Mendelete User":

Saat Admin "menambah user", server akan membuat baris baru di tabel ini (INSERT).

Saat Admin "mendelete user", server akan menghapus baris di tabel ini (DELETE).

4. Tabel Messages

Tempat penyimpanan seluruh riwayat chat.

Fitur "AI Suggestions":

AI tidak wajib punya tabel sendiri. Fitur AI bekerja dengan cara membaca data dari tabel ini.

Logika: Saat User mengetik, sistem (Client/Server) akan mengambil, misalnya, 10 pesan terakhir dari group_id tersebut di tabel Messages, lalu mengirimnya ke API AI (seperti OpenAI/Gemini) sebagai context untuk mendapatkan saran balasan.

Saran Implementasi Fitur AI (Requirement No. 9)

Untuk memenuhi requirement AI yang dapat memberi sugesti berdasarkan context:

Trigger: Saat user sedang mengetik atau membuka chat room.

Process:

Ambil 5-10 pesan terakhir dari tabel Messages berdasarkan group_id.

Kirim array pesan tersebut ke API AI dengan prompt: "Based on this conversation history, suggest 3 quick replies for the user."

==========================================================

Berdasarkan struktur data Anda (Users, Groups, Messages, GroupMembers) dan fitur AI yang direncanakan, berikut adalah daftar Endpoint API (REST) yang esensial untuk Anda buat:

1. Authentication (User)

Endpoint dasar untuk manajemen akses pengguna.

POST /register

Mendaftarkan user baru (Create User).

POST /login

Autentikasi user dan memberikan Token (misal: JWT).

GET /users (Opsional tapi penting)

Mencari user lain untuk diajak chat (search by username/email).

2. Groups (Chat Rooms & Inbox)

Mengelola daftar obrolan, baik Personal (PC) maupun Grup (GC).

GET /groups

Menampilkan daftar chat (Inbox) milik user yang sedang login.

Logic: Ambil semua data dari GroupMembers milik user, lalu join ke tabel Groups dan Messages (untuk preview pesan terakhir).

POST /groups

Membuat grup baru (dengan nama & deskripsi).

POST /groups/private (Penting: getOrCreatePrivateChat)

Logika khusus: Cek apakah sudah ada grup tipe 'private' antara User A dan User B?

Jika Ada: Return groupId yang sudah ada.

Jika Tidak Ada: Buat grup baru, lalu otomatis masukkan kedua user ke GroupMembers.

3. Messages (Pesan)

Inti dari aplikasi chat Anda.

GET /groups/:groupId/messages

Mengambil riwayat percakapan dalam grup tertentu.

Tips: Gunakan pagination (infinite scroll) agar tidak meload ribuan pesan sekaligus.

POST /groups/:groupId/messages

Mengirim pesan baru.

Body: { content: "Halo", isAiGenerated: false }

Logic Transaksi (Penting):

Insert data ke tabel Messages.

Update kolom lastMessageId di tabel Groups (agar Inbox naik ke paling atas).

4. Group Members (Manajemen Anggota)

POST /groups/:groupId/members

Menambahkan (invite) user lain ke dalam grup.

DELETE /groups/:groupId/members

User keluar dari grup (Leave Group) atau Admin mengeluarkan member (Kick).

5. AI Features (Fitur Tambahan)

Endpoint khusus untuk mendukung fitur cerdas di aplikasi Anda.

POST /ai/suggest-reply

Mengirim konteks chat terakhir ke AI, lalu AI mengembalikan saran balasan teks.

Alur: User klik "Saran AI" -> Request ke endpoint ini -> Dapat teks -> User kirim ke endpoint Messages (dengan isAiGenerated: true).

GET /groups/:groupId/summary (Opsional)

Meminta AI merangkum percakapan panjang di dalam grup tersebut.

Saran Urutan Pengerjaan

Auth (Wajib di awal).

Groups & Messages (Basic): Pastikan user bisa buat grup dan kirim pesan manual dulu.

GroupMembers: Fitur invite/kick.

AI Integration: Baru tambahkan endpoint /ai/... dan logika isAiGenerated terakhir.

Apakah Anda butuh contoh code untuk salah satu controller di atas (misalnya logic sendMessage yang sekaligus update lastMessageId)?