-- Tambah kolom userId ke tabel categories
ALTER TABLE categories ADD COLUMN userId int(11) NOT NULL AFTER name;

-- Tambah foreign key constraint
ALTER TABLE categories ADD CONSTRAINT fk_categories_user FOREIGN KEY (userId) REFERENCES users(id);

-- Update data yang ada dengan userId default (3)
UPDATE categories SET userId = 3 WHERE userId IS NULL; 