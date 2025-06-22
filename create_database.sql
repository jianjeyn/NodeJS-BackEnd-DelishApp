-- Langkah 1: Membuat Database
CREATE DATABASE IF NOT EXISTS `provis_resep` 
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Menggunakan database yang baru dibuat atau yang sudah ada
USE `provis_resep`;

-- Menonaktifkan pengecekan foreign key sementara untuk proses drop & create
SET FOREIGN_KEY_CHECKS=0;

-- Langkah 2: Membuat Struktur Tabel (Menghapus tabel lama jika ada)
DROP TABLE IF EXISTS `notification_users`, `notifications`, `community_users`, `favorites`, `followers`, `reviews`, `steps`, `ingredients`, `recipes`, `communities`, `users`;

-- Tabel 'users'
CREATE TABLE `users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `username` VARCHAR(255) NOT NULL UNIQUE,
  `no_hp` VARCHAR(20) NULL,
  `tanggal_lahir` DATE NULL,
  `password` VARCHAR(255) NOT NULL,
  `gender` CHAR(1) NULL,
  `foto` VARCHAR(255) NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

-- Tabel 'communities'
CREATE TABLE `communities` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nama` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

-- Tabel 'recipes'
CREATE TABLE `recipes` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `nama` VARCHAR(255) NOT NULL,
  `foto` VARCHAR(255) NULL,
  `detail` TEXT NULL,
  `durasi` VARCHAR(50) NULL,
  `kategori` VARCHAR(100) NULL,
  `jenis_hidangan` VARCHAR(100) NULL,
  `estimasi_waktu` VARCHAR(50) NULL,
  `tingkat_kesulitan` VARCHAR(50) NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

-- Tabel 'ingredients'
CREATE TABLE `ingredients` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `recipe_id` BIGINT UNSIGNED NOT NULL,
  `bahan` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`recipe_id`) REFERENCES `recipes`(`id`) ON DELETE CASCADE
);

-- Tabel 'steps'
CREATE TABLE `steps` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `recipe_id` BIGINT UNSIGNED NOT NULL,
  `no` INT NOT NULL,
  `deskripsi` TEXT NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`recipe_id`) REFERENCES `recipes`(`id`) ON DELETE CASCADE
);

-- Tabel 'reviews'
CREATE TABLE `reviews` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `recipe_id` BIGINT UNSIGNED NOT NULL,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `deskripsi` TEXT NULL,
  `bintang` TINYINT NOT NULL,
  `foto` VARCHAR(255) NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`recipe_id`) REFERENCES `recipes`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

-- Tabel 'followers' (Pivot Table)
CREATE TABLE `followers` (
  `from_user_id` BIGINT UNSIGNED NOT NULL,
  `to_user_id` BIGINT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`from_user_id`, `to_user_id`),
  FOREIGN KEY (`from_user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`to_user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

-- Tabel 'favorites' (Pivot Table)
CREATE TABLE `favorites` (
  `user_id` BIGINT UNSIGNED NOT NULL,
  `recipe_id` BIGINT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`, `recipe_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`recipe_id`) REFERENCES `recipes`(`id`) ON DELETE CASCADE
);

-- Tabel 'community_users' (Pivot Table)
CREATE TABLE `community_users` (
  `community_id` BIGINT UNSIGNED NOT NULL,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`community_id`, `user_id`),
  FOREIGN KEY (`community_id`) REFERENCES `communities`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

-- Tabel 'notifications'
CREATE TABLE `notifications` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `judul` VARCHAR(255) NOT NULL,
  `deskripsi` TEXT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

-- Tabel 'notification_users' (Pivot Table)
CREATE TABLE `notification_users` (
  `notification_id` BIGINT UNSIGNED NOT NULL,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `read_at` TIMESTAMP NULL,
  PRIMARY KEY (`notification_id`, `user_id`),
  FOREIGN KEY (`notification_id`) REFERENCES `notifications`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

-- Mengaktifkan kembali pengecekan foreign key
SET FOREIGN_KEY_CHECKS=1;

-- Langkah 3: Mengisi Data Awal (Seeding)

-- Seeding untuk tabel 'users'
INSERT INTO `users` (`name`, `email`, `username`, `no_hp`, `tanggal_lahir`, `password`, `gender`, `foto`) VALUES
('Alifa Salsabila', 'alifa1@example.com', 'alifabee', '081234567890', '2002-05-15', '$2a$12$eyAmZQThBEOz/BBBn/H18O8alngb/XXBdppaigsHL3HhMplyRXx3m', 'P', 'avatars/alifa.jpg'),
('Klara Oliviera', 'klara1@example.com', 'klarakeren', '081298765432', '2001-11-25', '$2a$12$eRbwWj/JKVXBbDq7Nl3/7Of9rWEqlaHp0Yt8tEo/1aFSIeSrxUW4y', 'P', 'avatars/klara.jpg'),
('Naeya Adeani', 'naeya1@example.com', 'notnaex', '082112345678', '2003-02-10', '$2a$12$qHZ9801mAm3YGnntPCGemeofmeOgGwohvRVhV1FbM1gpzH18HgdWm', 'P', 'avatars/naeya.jpg'),
('Jihan Aqilah', 'jihan1@example.com', 'jianjeyn', '082234567890', '2004-02-10', '$2a$12$5UpKopDFqU35RCMFoPNTueszM5V.HEFi8iiBJPH52k0Ii/abhtCFe', 'P', 'avatars/jihan.jpg'),
('Ririn Marcelina', 'ririn1@example.com', 'marchrin', '082345678901', '2002-03-15', '$2a$12$ZZkLk9Lnnzt.nL8UvFOuE.3BxzU5dapalpx3lYbZaTNWTNKK1Hbzy', 'P', 'avatars/ririn.jpg'),
('Yahyo Abdulozoda', 'yahyo1@example.com', 'yahyocoolguy', '081234567890', '2000-01-01', '$2a$12$YbO2u6Cgo0dSXTP.Dez1tOHzrm00OgaM4EdQ3f4GLVt1oLtwI/.86', 'L', 'avatars/yahyo.jpg');

-- Seeding untuk tabel 'communities'
INSERT INTO `communities` (`nama`) VALUES
('Komunitas Masak Sehat'),
('Komunitas Pecinta Makanan Pedas'),
('Komunitas Vegetarian'),
('Komunitas Makanan Tradisional'),
('Komunitas Kue dan Roti');

-- Seeding untuk tabel 'recipes'
INSERT INTO `recipes` (`user_id`, `nama`, `foto`, `detail`, `durasi`, `kategori`, `jenis_hidangan`, `estimasi_waktu`, `tingkat_kesulitan`) VALUES
(1, 'Nasi Goreng Telur', NULL, 'Menu cepat dan mudah untuk sarapan atau makan malam.', '15 Menit', 'Breakfast', 'Makanan Sederhana', '<15 Min', 'Mudah'),
(2, 'Sayur Bening Bayam', NULL, 'Sayur sehat untuk makan siang keluarga.', '20 Menit', 'Lunch', 'Makanan Sehat', '<30 Min', 'Mudah'),
(3, 'Tempe Goreng Tepung', NULL, 'Lauk favorit semua kalangan.', '15 Menit', 'Lunch', 'Makanan Sederhana', '<15 Min', 'Mudah'),
(4, 'Tumis Kangkung', NULL, 'Sayuran praktis dan cepat disajikan.', '10 Menit', 'Dinner', 'Makanan Sederhana', '<15 Min', 'Mudah'),
(5, 'Telur Dadar', NULL, 'Lauk serba guna dan favorit semua orang.', '10 Menit', 'Dinner', 'Makanan Sederhana', '<15 Min', 'Mudah');

-- Seeding untuk tabel 'ingredients'
INSERT INTO `ingredients` (`recipe_id`, `bahan`) VALUES
(1, 'Nasi'), (1, 'Telur'), (1, 'Bawang Merah'), (1, 'Bawang Putih'), (1, 'Kecap Manis'),
(2, 'Bayam'), (2, 'Wortel'), (2, 'Bawang Putih'), (2, 'Garam'), (2, 'Air'),
(3, 'Tempe'), (3, 'Tepung Terigu'), (3, 'Bawang Putih'), (3, 'Garam'),
(4, 'Kangkung'), (4, 'Bawang Putih'), (4, 'Cabe Merah'), (4, 'Terasi'),
(5, 'Telur'), (5, 'Daun Bawang'), (5, 'Bawang Merah'), (5, 'Garam');

-- Seeding untuk tabel 'steps'
INSERT INTO `steps` (`recipe_id`, `no`, `deskripsi`) VALUES
(1, 1, 'Panaskan sedikit minyak di wajan, lalu tumis bawang merah dan bawang putih yang telah diiris tipis hingga harum dan agak kecokelatan.'),
(1, 2, 'Masukkan telur ke dalam wajan, kemudian orak-arik hingga matang dan tercampur merata dengan bumbu.'),
(1, 3, 'Tambahkan nasi putih dingin ke dalam wajan, lalu aduk secara merata dengan telur dan bumbu yang sudah ditumis.'),
(1, 4, 'Tuangkan kecap manis, garam, dan merica secukupnya, lalu aduk dan masak hingga nasi goreng terasa kering dan matang merata.'),
(1, 5, 'Angkat dan sajikan selagi hangat dengan tambahan kerupuk dan irisan mentimun sebagai pelengkap.'),
(2, 1, 'Didihkan air dalam panci bersih untuk digunakan sebagai kuah sayur bening.'),
(2, 2, 'Setelah mendidih, masukkan bawang putih yang telah digeprek dan irisan wortel, lalu rebus hingga wortel mulai lunak.'),
(2, 3, 'Masukkan bayam yang telah dicuci bersih bersama jagung manis pipil (jika ada), dan masak hingga bayam layu.'),
(2, 4, 'Tambahkan garam dan sedikit gula pasir untuk menyeimbangkan rasa, lalu koreksi rasa sebelum mematikan api.'),
(2, 5, 'Tuang ke dalam mangkuk saji dan sajikan segera selagi hangat agar kesegaran bayam tetap terjaga.'),
(3, 1, 'Potong tempe tipis-tipis sesuai selera, kemudian rendam sebentar dalam air garam agar terasa lebih gurih.'),
(3, 2, 'Siapkan adonan tepung dengan mencampurkan tepung terigu, bawang putih halus, garam, ketumbar bubuk, dan air secukupnya hingga kental.'),
(3, 3, 'Celupkan potongan tempe ke dalam adonan tepung hingga seluruh permukaannya tertutup rata.'),
(3, 4, 'Panaskan minyak dalam jumlah cukup banyak, lalu goreng tempe yang sudah dilapisi tepung hingga kuning keemasan dan garing.'),
(3, 5, 'Angkat tempe goreng dan tiriskan minyaknya di atas tisu dapur, lalu sajikan hangat dengan sambal atau cabai rawit.'),
(4, 1, 'Panaskan minyak goreng dalam wajan, lalu tumis bawang putih dan cabai merah besar yang telah diiris hingga harum.'),
(4, 2, 'Tambahkan terasi yang sudah dibakar ke dalam tumisan, lalu aduk rata hingga terasi larut bersama bumbu.'),
(4, 3, 'Masukkan kangkung yang telah dicuci bersih, aduk cepat agar semua bagian terkena bumbu dan tidak layu berlebihan.'),
(4, 4, 'Tambahkan sedikit air, garam, dan gula pasir untuk memperkaya rasa, lalu masak sebentar hingga bumbu meresap.'),
(4, 5, 'Angkat dan sajikan selagi panas sebagai pendamping nasi hangat.'),
(5, 1, 'Kocok telur dalam mangkuk bersama irisan daun bawang, bawang merah, cabai (jika suka pedas), dan garam hingga berbusa.'),
(5, 2, 'Panaskan sedikit minyak dalam wajan anti lengket, lalu tuangkan adonan telur secara merata ke permukaan wajan.'),
(5, 3, 'Masak dengan api kecil hingga bagian bawah matang kecokelatan, lalu balik dan masak sisi satunya hingga matang.'),
(5, 4, 'Angkat telur dadar dan potong sesuai selera sebelum disajikan bersama nasi hangat dan sambal favorit.');

-- Seeding untuk tabel 'reviews'
INSERT INTO `reviews` (`recipe_id`, `user_id`, `deskripsi`, `bintang`, `foto`) VALUES
(1, 1, 'Nasi Goreng Telur sangat gurih. Favorit banget!', 5, NULL),
(1, 2, 'Bumbunya pas, tapi kurang pedas untuk seleraku.', 3, NULL),
(1, 3, 'Sangat mudah untuk di recook!.', 5, NULL),
(1, 4, 'Nasi Goreng Telur ini enak banget, tapi aku tambahin cabe biar lebih pedas.', 4, NULL),
(2, 3, 'Sayur Bening Bayam ini segar dan sehat. Cocok untuk diet.', 5, NULL),
(2, 4, 'Sayur Bening Bayam ini enak, tapi aku tambahkan sedikit garam lagi.', 4, NULL),
(2, 2, 'Menu sehat yang mudah dibuat. Aku suka!', 5, NULL),
(3, 5, 'Tempe Goreng Tepung ini renyah dan gurih. Suka banget!', 5, NULL),
(3, 6, 'Kurang asin menurutku, tapi teksturnya oke.', 3, NULL),
(4, 1, 'Tumis Kangkung ini cepat dan mudah. Cocok untuk makan malam.', 4, NULL),
(4, 2, 'Sangat lezat, tapi aku tambahkan sedikit cabe untuk rasa pedas.', 5, NULL),
(4, 3, 'Tumis Kangkung ini enak, tapi aku lebih suka kalau ada udangnya.', 4, NULL),
(5, 3, 'Telur Dadar ini enak dan mudah dibuat. Suka!', 5, NULL),
(5, 2, 'Telur Dadar ini enak, tapi aku tambahkan sedikit sayuran.', 4, NULL),
(5, 4, 'Telur Dadar ini enak, tapi aku tambahkan sedikit keju.', 4, NULL);

-- Seeding untuk tabel 'community_users' (pivot table)
INSERT INTO `community_users` (`community_id`, `user_id`) VALUES
(1, 1), (1, 2), (1, 3),
(2, 1), (2, 4),
(3, 2), (3, 3), (3, 5),
(4, 1), (4, 4),
(5, 2), (5, 5);

-- Seeding untuk tabel 'favorites'
INSERT INTO `favorites` (`user_id`, `recipe_id`) VALUES
(1, 1),
(2, 2),
(3, 3),
(4, 4),
(5, 5);

-- Seeding untuk tabel 'followers' (pivot table)
INSERT INTO `followers` (`from_user_id`, `to_user_id`) VALUES
(1, 2), (1, 3),
(2, 1), (2, 4),
(3, 1),
(4, 2),
(5, 1);