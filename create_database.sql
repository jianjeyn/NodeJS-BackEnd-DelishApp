-- Membuat database baru jika belum ada
CREATE DATABASE IF NOT EXISTS `provis_resep` 
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Menggunakan database yang baru dibuat
USE `provis_resep`;

-- 1. Tabel 'users'
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
  `presentation` TEXT NULL,
  `add_link` VARCHAR(255) NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

-- 2. Tabel 'communities'
CREATE TABLE `communities` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nama` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

-- 3. Tabel 'recipes'
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

-- 4. Tabel 'ingredients'
CREATE TABLE `ingredients` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `recipe_id` BIGINT UNSIGNED NOT NULL,
  `bahan` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`recipe_id`) REFERENCES `recipes`(`id`) ON DELETE CASCADE
);

-- 5. Tabel 'steps'
-- Mengubah nama kolom 'resep_id' menjadi 'recipe_id' untuk konsistensi
CREATE TABLE `steps` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `recipe_id` BIGINT UNSIGNED NOT NULL,
  `no` INT NOT NULL,
  `deskripsi` TEXT NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`recipe_id`) REFERENCES `recipes`(`id`) ON DELETE CASCADE
);

-- 6. Tabel 'reviews'
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

-- 7. Tabel 'followers' (Pivot Table)
CREATE TABLE `followers` (
  `from_user_id` BIGINT UNSIGNED NOT NULL,
  `to_user_id` BIGINT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`from_user_id`, `to_user_id`),
  FOREIGN KEY (`from_user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`to_user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

-- 8. Tabel 'favorites' (Pivot Table)
CREATE TABLE `favorites` (
  `user_id` BIGINT UNSIGNED NOT NULL,
  `recipe_id` BIGINT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`, `recipe_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`recipe_id`) REFERENCES `recipes`(`id`) ON DELETE CASCADE
);

-- 9. Tabel 'community_users' (Pivot Table)
CREATE TABLE `community_users` (
  `community_id` BIGINT UNSIGNED NOT NULL,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`community_id`, `user_id`),
  FOREIGN KEY (`community_id`) REFERENCES `communities`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

-- 10. Tabel 'notifications' (Berdasarkan model yang diimpor di seeder)
CREATE TABLE `notifications` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `judul` VARCHAR(255) NOT NULL,
  `deskripsi` TEXT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

-- 11. Tabel 'notification_users' (Pivot Table, berdasarkan model)
CREATE TABLE `notification_users` (
  `notification_id` BIGINT UNSIGNED NOT NULL,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `read_at` TIMESTAMP NULL,
  PRIMARY KEY (`notification_id`, `user_id`),
  FOREIGN KEY (`notification_id`) REFERENCES `notifications`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);