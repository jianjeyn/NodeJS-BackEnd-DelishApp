-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 23, 2025 at 03:41 AM
-- Server version: 8.0.30
-- PHP Version: 8.1.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `provis_resep`
--

-- --------------------------------------------------------

--
-- Table structure for table `communities`
--

CREATE TABLE `communities` (
  `id` bigint UNSIGNED NOT NULL,
  `nama` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `communities`
--

INSERT INTO `communities` (`id`, `nama`, `created_at`, `updated_at`) VALUES
(1, 'Komunitas Masak Sehat', '2025-06-22 14:34:59', '2025-06-22 14:34:59'),
(2, 'Komunitas Pecinta Makanan Pedas', '2025-06-22 14:34:59', '2025-06-22 14:34:59'),
(3, 'Komunitas Vegetarian', '2025-06-22 14:34:59', '2025-06-22 14:34:59'),
(4, 'Komunitas Makanan Tradisional', '2025-06-22 14:34:59', '2025-06-22 14:34:59'),
(5, 'Komunitas Kue dan Roti', '2025-06-22 14:34:59', '2025-06-22 14:34:59');

-- --------------------------------------------------------

--
-- Table structure for table `community_users`
--

CREATE TABLE `community_users` (
  `community_id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `community_users`
--

INSERT INTO `community_users` (`community_id`, `user_id`, `created_at`) VALUES
(1, 1, '2025-06-22 14:34:59'),
(1, 2, '2025-06-22 14:34:59'),
(1, 3, '2025-06-22 14:34:59'),
(2, 1, '2025-06-22 14:34:59'),
(2, 4, '2025-06-22 14:34:59'),
(3, 2, '2025-06-22 14:34:59'),
(3, 3, '2025-06-22 14:34:59'),
(3, 5, '2025-06-22 14:34:59'),
(4, 1, '2025-06-22 14:34:59'),
(4, 4, '2025-06-22 14:34:59'),
(5, 2, '2025-06-22 14:34:59'),
(5, 5, '2025-06-22 14:34:59');

-- --------------------------------------------------------

--
-- Table structure for table `favorites`
--

CREATE TABLE `favorites` (
  `user_id` bigint UNSIGNED NOT NULL,
  `recipe_id` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `favorites`
--

INSERT INTO `favorites` (`user_id`, `recipe_id`, `created_at`) VALUES
(1, 1, '2025-06-22 14:34:59'),
(2, 2, '2025-06-22 14:34:59'),
(3, 3, '2025-06-22 14:34:59'),
(4, 4, '2025-06-22 14:34:59'),
(5, 5, '2025-06-22 14:34:59');

-- --------------------------------------------------------

--
-- Table structure for table `followers`
--

CREATE TABLE `followers` (
  `from_user_id` bigint UNSIGNED NOT NULL,
  `to_user_id` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `followers`
--

INSERT INTO `followers` (`from_user_id`, `to_user_id`, `created_at`) VALUES
(1, 2, '2025-06-22 14:34:59'),
(1, 3, '2025-06-22 14:34:59'),
(2, 1, '2025-06-22 14:34:59'),
(2, 4, '2025-06-22 14:34:59'),
(3, 1, '2025-06-22 14:34:59'),
(4, 2, '2025-06-22 14:34:59'),
(5, 1, '2025-06-22 14:34:59');

-- --------------------------------------------------------

--
-- Table structure for table `ingredients`
--

CREATE TABLE `ingredients` (
  `id` bigint UNSIGNED NOT NULL,
  `recipe_id` bigint UNSIGNED NOT NULL,
  `bahan` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `ingredients`
--

INSERT INTO `ingredients` (`id`, `recipe_id`, `bahan`) VALUES
(1, 1, 'Nasi'),
(2, 1, 'Telur'),
(3, 1, 'Bawang Merah'),
(4, 1, 'Bawang Putih'),
(5, 1, 'Kecap Manis'),
(6, 2, 'Bayam'),
(7, 2, 'Wortel'),
(8, 2, 'Bawang Putih'),
(9, 2, 'Garam'),
(10, 2, 'Air'),
(11, 3, 'Tempe'),
(12, 3, 'Tepung Terigu'),
(13, 3, 'Bawang Putih'),
(14, 3, 'Garam'),
(15, 4, 'Kangkung'),
(16, 4, 'Bawang Putih'),
(17, 4, 'Cabe Merah'),
(18, 4, 'Terasi'),
(19, 5, 'Telur'),
(20, 5, 'Daun Bawang'),
(21, 5, 'Bawang Merah'),
(22, 5, 'Garam');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` bigint UNSIGNED NOT NULL,
  `judul` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `deskripsi` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `judul`, `deskripsi`, `created_at`, `updated_at`) VALUES
(1, 'Selamat Datang di DelishApp!', 'Terima kasih telah bergabung dengan komunitas DelishApp. Mari mulai berbagi resep favoritmu!', '2025-06-22 23:11:37', '2025-06-22 23:11:37'),
(2, 'Resep Trending Minggu Ini', 'Jangan lewatkan resep \"Nasi Goreng Telur\" yang sedang trending! Sudah 50+ orang yang mencoba resep ini.', '2025-06-22 23:11:37', '2025-06-22 23:11:37'),
(3, 'Update Fitur Baru', 'Fitur komunitas telah tersedia! Sekarang kamu bisa bergabung dengan komunitas kuliner favoritmu.', '2025-06-22 23:11:37', '2025-06-22 23:11:37'),
(4, 'Resep Terpopuler Bulan Ini', 'Resep \"Sayur Bening Bayam\" menjadi resep terpopuler bulan ini dengan rating 4.8/5!', '2025-06-22 23:11:37', '2025-06-22 23:11:37'),
(5, 'Tips Memasak Sehat', 'Ingin memasak lebih sehat? Coba tambahkan lebih banyak sayuran dan kurangi penggunaan minyak berlebih.', '2025-06-22 23:11:37', '2025-06-22 23:11:37'),
(6, 'Reminder: Coba Resep Baru', 'Sudah lama tidak mencoba resep baru? Yuk explore kategori \"Dessert\" untuk menu penutup yang manis!', '2025-06-22 23:11:37', '2025-06-22 23:11:37'),
(7, 'Komunitas Masak Sehat', 'Ada diskusi menarik di komunitas \"Masak Sehat\" tentang resep diet. Join sekarang!', '2025-06-22 23:11:37', '2025-06-22 23:11:37'),
(8, 'Resep dari Chef Terkenal', 'Chef Jihan baru saja membagikan resep \"Tumis Kangkung\" special edition. Jangan sampai terlewat!', '2025-06-22 23:11:37', '2025-06-22 23:11:37'),
(9, 'Event Cooking Challenge', 'Ikuti cooking challenge minggu ini dengan tema \"Makanan Tradisional\". Hadiah menarik menanti!', '2025-06-22 23:11:37', '2025-06-22 23:11:37'),
(10, 'Review Terbaru', 'Resepmu \"Telur Dadar\" mendapat review bintang 5 dari pengguna lain. Selamat!', '2025-06-22 23:11:37', '2025-06-22 23:11:37');

-- --------------------------------------------------------

--
-- Table structure for table `notification_users`
--

CREATE TABLE `notification_users` (
  `notification_id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `read_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notification_users`
--

INSERT INTO `notification_users` (`notification_id`, `user_id`, `read_at`) VALUES
(1, 1, '2025-06-22 03:30:00'),
(1, 2, '2025-06-22 04:15:00'),
(1, 3, NULL),
(1, 4, '2025-06-22 07:20:00'),
(1, 5, NULL),
(1, 6, '2025-06-22 09:45:00'),
(2, 1, '2025-06-22 02:00:00'),
(2, 2, NULL),
(2, 3, '2025-06-22 05:30:00'),
(2, 4, NULL),
(3, 1, NULL),
(3, 2, '2025-06-22 06:45:00'),
(3, 3, '2025-06-22 08:20:00'),
(3, 4, NULL),
(3, 5, '2025-06-22 10:10:00'),
(3, 6, NULL),
(4, 2, '2025-06-22 01:30:00'),
(4, 3, NULL),
(4, 5, '2025-06-22 12:15:00'),
(5, 1, '2025-06-22 00:45:00'),
(5, 2, '2025-06-22 04:30:00'),
(5, 3, NULL),
(6, 1, NULL),
(6, 4, '2025-06-22 11:20:00'),
(6, 5, NULL),
(6, 6, '2025-06-22 13:00:00'),
(7, 1, '2025-06-22 09:30:00'),
(7, 2, NULL),
(7, 3, '2025-06-22 11:45:00'),
(8, 1, NULL),
(8, 2, '2025-06-22 14:15:00'),
(9, 1, '2025-06-21 23:00:00'),
(9, 2, '2025-06-22 00:30:00'),
(9, 3, NULL),
(9, 4, '2025-06-22 02:45:00'),
(9, 5, NULL),
(10, 5, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `recipes`
--

CREATE TABLE `recipes` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `nama` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `foto` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `detail` text COLLATE utf8mb4_unicode_ci,
  `durasi` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `kategori` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `jenis_hidangan` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estimasi_waktu` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tingkat_kesulitan` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `recipes`
--

INSERT INTO `recipes` (`id`, `user_id`, `nama`, `foto`, `detail`, `durasi`, `kategori`, `jenis_hidangan`, `estimasi_waktu`, `tingkat_kesulitan`, `created_at`, `updated_at`) VALUES
(1, 1, 'Nasi Goreng Telur', '/uploads/food/nasi-goreng.png', 'Menu cepat dan mudah untuk sarapan atau makan malam.', '15 Menit', 'Breakfast', 'Makanan Sederhana', '<15 Min', 'Mudah', '2025-06-22 14:34:59', '2025-06-22 14:34:59'),
(2, 2, 'Sayur Bening Bayam', '/uploads/food/sayur-bening-bayam.png', 'Sayur sehat untuk makan siang keluarga.', '20 Menit', 'Lunch', 'Makanan Sehat', '<30 Min', 'Mudah', '2025-06-22 14:34:59', '2025-06-22 14:34:59'),
(3, 3, 'Tempe Goreng Tepung', '/uploads/food/tempe-goreng-tepung.png', 'Lauk favorit semua kalangan.', '15 Menit', 'Lunch', 'Makanan Sederhana', '<15 Min', 'Mudah', '2025-06-22 14:34:59', '2025-06-22 14:34:59'),
(4, 4, 'Tumis Kangkung', '/uploads/food/tumis-kangkung.png', 'Sayuran praktis dan cepat disajikan.', '10 Menit', 'Dinner', 'Makanan Sederhana', '<15 Min', 'Mudah', '2025-06-22 14:34:59', '2025-06-22 14:34:59'),
(5, 5, 'Telur Dadar', '/uploads/food/telur-dadar.png', 'Lauk serba guna dan favorit semua orang.', '10 Menit', 'Dinner', 'Makanan Sederhana', '<15 Min', 'Mudah', '2025-06-22 14:34:59', '2025-06-22 14:34:59');

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `id` bigint UNSIGNED NOT NULL,
  `recipe_id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `deskripsi` text COLLATE utf8mb4_unicode_ci,
  `bintang` tinyint NOT NULL,
  `foto` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `reviews`
--

INSERT INTO `reviews` (`id`, `recipe_id`, `user_id`, `deskripsi`, `bintang`, `foto`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'Nasi Goreng Telur sangat gurih. Favorit banget!', 5, NULL, '2025-06-22 14:34:59', '2025-06-22 14:34:59'),
(2, 1, 2, 'Bumbunya pas, tapi kurang pedas untuk seleraku.', 3, NULL, '2025-06-22 14:34:59', '2025-06-22 14:34:59'),
(3, 1, 3, 'Sangat mudah untuk di recook!.', 5, NULL, '2025-06-22 14:34:59', '2025-06-22 14:34:59'),
(4, 1, 4, 'Nasi Goreng Telur ini enak banget, tapi aku tambahin cabe biar lebih pedas.', 4, NULL, '2025-06-22 14:34:59', '2025-06-22 14:34:59'),
(5, 2, 3, 'Sayur Bening Bayam ini segar dan sehat. Cocok untuk diet.', 5, NULL, '2025-06-22 14:34:59', '2025-06-22 14:34:59'),
(6, 2, 4, 'Sayur Bening Bayam ini enak, tapi aku tambahkan sedikit garam lagi.', 4, NULL, '2025-06-22 14:34:59', '2025-06-22 14:34:59'),
(7, 2, 2, 'Menu sehat yang mudah dibuat. Aku suka!', 5, NULL, '2025-06-22 14:34:59', '2025-06-22 14:34:59'),
(8, 3, 5, 'Tempe Goreng Tepung ini renyah dan gurih. Suka banget!', 5, NULL, '2025-06-22 14:34:59', '2025-06-22 14:34:59'),
(9, 3, 6, 'Kurang asin menurutku, tapi teksturnya oke.', 3, NULL, '2025-06-22 14:34:59', '2025-06-22 14:34:59'),
(10, 4, 1, 'Tumis Kangkung ini cepat dan mudah. Cocok untuk makan malam.', 4, NULL, '2025-06-22 14:34:59', '2025-06-22 14:34:59'),
(11, 4, 2, 'Sangat lezat, tapi aku tambahkan sedikit cabe untuk rasa pedas.', 5, NULL, '2025-06-22 14:34:59', '2025-06-22 14:34:59'),
(12, 4, 3, 'Tumis Kangkung ini enak, tapi aku lebih suka kalau ada udangnya.', 4, NULL, '2025-06-22 14:34:59', '2025-06-22 14:34:59'),
(13, 5, 3, 'Telur Dadar ini enak dan mudah dibuat. Suka!', 5, NULL, '2025-06-22 14:34:59', '2025-06-22 14:34:59'),
(14, 5, 2, 'Telur Dadar ini enak, tapi aku tambahkan sedikit sayuran.', 4, NULL, '2025-06-22 14:34:59', '2025-06-22 14:34:59'),
(15, 5, 4, 'Telur Dadar ini enak, tapi aku tambahkan sedikit keju.', 4, NULL, '2025-06-22 14:34:59', '2025-06-22 14:34:59');

-- --------------------------------------------------------

--
-- Table structure for table `steps`
--

CREATE TABLE `steps` (
  `id` bigint UNSIGNED NOT NULL,
  `recipe_id` bigint UNSIGNED NOT NULL,
  `no` int NOT NULL,
  `deskripsi` text COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `steps`
--

INSERT INTO `steps` (`id`, `recipe_id`, `no`, `deskripsi`) VALUES
(1, 1, 1, 'Panaskan sedikit minyak di wajan, lalu tumis bawang merah dan bawang putih yang telah diiris tipis hingga harum dan agak kecokelatan.'),
(2, 1, 2, 'Masukkan telur ke dalam wajan, kemudian orak-arik hingga matang dan tercampur merata dengan bumbu.'),
(3, 1, 3, 'Tambahkan nasi putih dingin ke dalam wajan, lalu aduk secara merata dengan telur dan bumbu yang sudah ditumis.'),
(4, 1, 4, 'Tuangkan kecap manis, garam, dan merica secukupnya, lalu aduk dan masak hingga nasi goreng terasa kering dan matang merata.'),
(5, 1, 5, 'Angkat dan sajikan selagi hangat dengan tambahan kerupuk dan irisan mentimun sebagai pelengkap.'),
(6, 2, 1, 'Didihkan air dalam panci bersih untuk digunakan sebagai kuah sayur bening.'),
(7, 2, 2, 'Setelah mendidih, masukkan bawang putih yang telah digeprek dan irisan wortel, lalu rebus hingga wortel mulai lunak.'),
(8, 2, 3, 'Masukkan bayam yang telah dicuci bersih bersama jagung manis pipil (jika ada), dan masak hingga bayam layu.'),
(9, 2, 4, 'Tambahkan garam dan sedikit gula pasir untuk menyeimbangkan rasa, lalu koreksi rasa sebelum mematikan api.'),
(10, 2, 5, 'Tuang ke dalam mangkuk saji dan sajikan segera selagi hangat agar kesegaran bayam tetap terjaga.'),
(11, 3, 1, 'Potong tempe tipis-tipis sesuai selera, kemudian rendam sebentar dalam air garam agar terasa lebih gurih.'),
(12, 3, 2, 'Siapkan adonan tepung dengan mencampurkan tepung terigu, bawang putih halus, garam, ketumbar bubuk, dan air secukupnya hingga kental.'),
(13, 3, 3, 'Celupkan potongan tempe ke dalam adonan tepung hingga seluruh permukaannya tertutup rata.'),
(14, 3, 4, 'Panaskan minyak dalam jumlah cukup banyak, lalu goreng tempe yang sudah dilapisi tepung hingga kuning keemasan dan garing.'),
(15, 3, 5, 'Angkat tempe goreng dan tiriskan minyaknya di atas tisu dapur, lalu sajikan hangat dengan sambal atau cabai rawit.'),
(16, 4, 1, 'Panaskan minyak goreng dalam wajan, lalu tumis bawang putih dan cabai merah besar yang telah diiris hingga harum.'),
(17, 4, 2, 'Tambahkan terasi yang sudah dibakar ke dalam tumisan, lalu aduk rata hingga terasi larut bersama bumbu.'),
(18, 4, 3, 'Masukkan kangkung yang telah dicuci bersih, aduk cepat agar semua bagian terkena bumbu dan tidak layu berlebihan.'),
(19, 4, 4, 'Tambahkan sedikit air, garam, dan gula pasir untuk memperkaya rasa, lalu masak sebentar hingga bumbu meresap.'),
(20, 4, 5, 'Angkat dan sajikan selagi panas sebagai pendamping nasi hangat.'),
(21, 5, 1, 'Kocok telur dalam mangkuk bersama irisan daun bawang, bawang merah, cabai (jika suka pedas), dan garam hingga berbusa.'),
(22, 5, 2, 'Panaskan sedikit minyak dalam wajan anti lengket, lalu tuangkan adonan telur secara merata ke permukaan wajan.'),
(23, 5, 3, 'Masak dengan api kecil hingga bagian bawah matang kecokelatan, lalu balik dan masak sisi satunya hingga matang.'),
(24, 5, 4, 'Angkat telur dadar dan potong sesuai selera sebelum disajikan bersama nasi hangat dan sambal favorit.');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `no_hp` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tanggal_lahir` date DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `gender` char(1) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `foto` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `presentation` text COLLATE utf8mb4_unicode_ci,
  `add_link` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `username`, `no_hp`, `tanggal_lahir`, `password`, `gender`, `foto`, `presentation`, `add_link`, `created_at`, `updated_at`) VALUES
(1, 'Alifa Salsabila', 'alifa1@example.com', 'alifabee', '081234567890', '2002-05-15', '$2a$12$eyAmZQThBEOz/BBBn/H18O8alngb/XXBdppaigsHL3HhMplyRXx3m', 'P', '/uploads/avatars/alifa.png', NULL, NULL, '2025-06-22 14:34:59', '2025-06-22 14:34:59'),
(2, 'Klara Oliviera', 'klara1@example.com', 'klarakeren', '081298765432', '2001-11-25', '$2a$12$qylmw4WQ9ZatnqB4AMq7X.MmVe3xzpOhe8f2V/QaQ63YDybg1sCCi', 'P', '/uploads/avatars/klara.png', NULL, NULL, '2025-06-22 14:34:59', '2025-06-22 14:34:59'),
(3, 'Naeya Adeani', 'naeya1@example.com', 'notnaex', '082112345678', '2003-02-10', '$2a$12$qHZ9801mAm3YGnntPCGemeofmeOgGwohvRVhV1FbM1gpzH18HgdWm', 'P', '/uploads/avatars/naeya.png', NULL, NULL, '2025-06-22 14:34:59', '2025-06-22 14:34:59'),
(4, 'Jihan Aqilah', 'jihan1@example.com', 'jianjeyn', '082234567890', '2004-02-10', '$2a$12$5UpKopDFqU35RCMFoPNTueszM5V.HEFi8iiBJPH52k0Ii/abhtCFe', 'P', '/uploads/avatars/jihan.png', NULL, NULL, '2025-06-22 14:34:59', '2025-06-22 14:34:59'),
(5, 'Ririn Marcelina', 'ririn1@example.com', 'marchrin', '082345678901', '2002-03-15', '$2a$12$ZZkLk9Lnnzt.nL8UvFOuE.3BxzU5dapalpx3lYbZaTNWTNKK1Hbzy', 'P', '/uploads/avatars/ririn.png', NULL, NULL, '2025-06-22 14:34:59', '2025-06-22 14:34:59'),
(6, 'Yahyo Abdulozoda', 'yahyo1@example.com', 'yahyocoolguy', '081234567890', '2000-01-01', '$2a$12$YbO2u6Cgo0dSXTP.Dez1tOHzrm00OgaM4EdQ3f4GLVt1oLtwI/.86', 'L', '/uploads/avatars/yahyo.png', NULL, NULL, '2025-06-22 14:34:59', '2025-06-22 14:34:59');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `communities`
--
ALTER TABLE `communities`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `community_users`
--
ALTER TABLE `community_users`
  ADD PRIMARY KEY (`community_id`,`user_id`),
  ADD KEY `community_users_user_id_fkey` (`user_id`);

--
-- Indexes for table `favorites`
--
ALTER TABLE `favorites`
  ADD PRIMARY KEY (`user_id`,`recipe_id`),
  ADD KEY `favorites_recipe_id_fkey` (`recipe_id`);

--
-- Indexes for table `followers`
--
ALTER TABLE `followers`
  ADD PRIMARY KEY (`from_user_id`,`to_user_id`),
  ADD KEY `followers_to_user_id_fkey` (`to_user_id`);

--
-- Indexes for table `ingredients`
--
ALTER TABLE `ingredients`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ingredients_recipe_id_fkey` (`recipe_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `notification_users`
--
ALTER TABLE `notification_users`
  ADD PRIMARY KEY (`notification_id`,`user_id`),
  ADD KEY `notification_users_user_id_fkey` (`user_id`);

--
-- Indexes for table `recipes`
--
ALTER TABLE `recipes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `recipes_user_id_fkey` (`user_id`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `reviews_recipe_id_fkey` (`recipe_id`),
  ADD KEY `reviews_user_id_fkey` (`user_id`);

--
-- Indexes for table `steps`
--
ALTER TABLE `steps`
  ADD PRIMARY KEY (`id`),
  ADD KEY `steps_recipe_id_fkey` (`recipe_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_key` (`email`),
  ADD UNIQUE KEY `users_username_key` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `communities`
--
ALTER TABLE `communities`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `ingredients`
--
ALTER TABLE `ingredients`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `recipes`
--
ALTER TABLE `recipes`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `steps`
--
ALTER TABLE `steps`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `community_users`
--
ALTER TABLE `community_users`
  ADD CONSTRAINT `community_users_community_id_fkey` FOREIGN KEY (`community_id`) REFERENCES `communities` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `community_users_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `favorites`
--
ALTER TABLE `favorites`
  ADD CONSTRAINT `favorites_recipe_id_fkey` FOREIGN KEY (`recipe_id`) REFERENCES `recipes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `favorites_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `followers`
--
ALTER TABLE `followers`
  ADD CONSTRAINT `followers_from_user_id_fkey` FOREIGN KEY (`from_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `followers_to_user_id_fkey` FOREIGN KEY (`to_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `ingredients`
--
ALTER TABLE `ingredients`
  ADD CONSTRAINT `ingredients_recipe_id_fkey` FOREIGN KEY (`recipe_id`) REFERENCES `recipes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `notification_users`
--
ALTER TABLE `notification_users`
  ADD CONSTRAINT `notification_users_notification_id_fkey` FOREIGN KEY (`notification_id`) REFERENCES `notifications` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `notification_users_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `recipes`
--
ALTER TABLE `recipes`
  ADD CONSTRAINT `recipes_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_recipe_id_fkey` FOREIGN KEY (`recipe_id`) REFERENCES `recipes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `reviews_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `steps`
--
ALTER TABLE `steps`
  ADD CONSTRAINT `steps_recipe_id_fkey` FOREIGN KEY (`recipe_id`) REFERENCES `recipes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
