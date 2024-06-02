-- phpMyAdmin SQL Dump
-- version 5.0.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 28, 2020 at 04:57 AM
-- Server version: 10.4.11-MariaDB
-- PHP Version: 7.4.2

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `spotify`
--

-- --------------------------------------------------------

--
-- Table structure for table `albums`
--

CREATE TABLE `albums` (
  `id` int(11) NOT NULL,
  `title` varchar(250) NOT NULL,
  `artist` int(11) NOT NULL,
  `genre` int(11) NOT NULL,
  `artworkPath` varchar(500) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `albums`
--

INSERT INTO `albums` (`id`, `title`, `artist`, `genre`, `artworkPath`) VALUES
(1, 'An Ode', 2, 8, 'assets/images/artwork/odeToYou.jpg'),
(2, 'Feel Special', 1, 8, 'assets/images/artwork/feelSpecial.jpg'),
(3, '[++]', 3, 8, 'assets/images/artwork/plusplus.png'),
(4, 'Head In The Clouds II', 6, 5, 'assets/images/artwork/headInTheClouds2.png'),
(5, 'Zephyr', 4, 5, 'assets/images/artwork/zephyr.jpg'),
(6, 'lowkey', 4, 5, 'assets/images/artwork/lowkey.jpg'),
(7, 'See U Never', 4, 5, 'assets/images/artwork/seeUNever.jpg'),
(8, 'Wanted', 5, 2, 'assets/images/artwork/wanted.jpg'),
(9, 'Keep You Mine', 5, 7, 'assets/images/artwork/keepYouMine.jpg'),
(10, 'Been There Done That', 5, 7, 'assets/images/artwork/beenThereDoneThat.jpg');

-- --------------------------------------------------------

--
-- Table structure for table `artists`
--

CREATE TABLE `artists` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `artists`
--

INSERT INTO `artists` (`id`, `name`) VALUES
(1, 'Twice'),
(2, 'Seventeen'),
(3, 'Loona'),
(4, 'Niki'),
(5, 'NOTD'),
(6, '88rising');

-- --------------------------------------------------------

--
-- Table structure for table `genres`
--

CREATE TABLE `genres` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `genres`
--

INSERT INTO `genres` (`id`, `name`) VALUES
(1, 'Rock'),
(2, 'Pop'),
(3, 'Hip-hop'),
(4, 'Rap'),
(5, 'R & B'),
(6, 'Classical'),
(7, 'EDM'),
(8, 'K-pop'),
(9, 'Jazz'),
(10, 'Folk');

-- --------------------------------------------------------

--
-- Table structure for table `playlists`
--

CREATE TABLE `playlists` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `owner` varchar(50) NOT NULL,
  `dateCreated` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `playlists`
--

INSERT INTO `playlists` (`id`, `name`, `owner`, `dateCreated`) VALUES
(4, 'my first playlist', 'voidcs', '2020-02-20 00:00:00'),
(5, '2020', 'voidcs', '2020-02-21 00:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `playlistsongs`
--

CREATE TABLE `playlistsongs` (
  `id` int(11) NOT NULL,
  `songId` int(11) NOT NULL,
  `playlistId` int(11) NOT NULL,
  `playlistOrder` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `playlistsongs`
--

INSERT INTO `playlistsongs` (`id`, `songId`, `playlistId`, `playlistOrder`) VALUES
(1, 2, 4, 1),
(4, 11, 4, 3),
(5, 1, 4, 4),
(6, 15, 5, 0),
(7, 6, 4, 5);

-- --------------------------------------------------------

--
-- Table structure for table `songs`
--

CREATE TABLE `songs` (
  `id` int(11) NOT NULL,
  `title` varchar(250) NOT NULL,
  `artist` int(11) NOT NULL,
  `album` int(11) NOT NULL,
  `genre` int(11) NOT NULL,
  `duration` varchar(8) NOT NULL,
  `path` varchar(500) NOT NULL,
  `albumOrder` int(11) NOT NULL,
  `plays` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `songs`
--

INSERT INTO `songs` (`id`, `title`, `artist`, `album`, `genre`, `duration`, `path`, `albumOrder`, `plays`) VALUES
(1, 'Feel Special', 1, 2, 8, '3:26', 'assets/music/feelSpecial.mp3', 1, 23),
(2, 'TRICK IT', 1, 2, 8, '3:14', 'assets/music/trickIt.mp3', 2, 23),
(3, 'LOVE FOOLISH', 1, 2, 8, '3:11', 'assets/music/loveFoolish.mp3', 3, 14),
(4, 'HIT', 2, 1, 8, '3:25', 'assets/music/hit.mp3', 1, 23),
(5, 'Fear', 2, 1, 8, '2:55', 'assets/music/fear.mp3', 2, 17),
(6, 'Snap Shoot', 2, 1, 8, '2:55', 'assets/music/snapShoot.mp3', 3, 29),
(7, 'Hi High', 3, 3, 8, '3:18', 'assets/music/hiHigh.mp3', 1, 48),
(8, 'favOriTe', 3, 3, 8, '3:12', 'assets/music/favorite.mp3', 2, 40),
(9, 'Yeolgi', 3, 3, 8, '3:30', 'assets/music/yeolgi.mp3', 3, 41),
(10, 'Perfect Love', 3, 3, 8, '3:42', 'assets/music/perfectLove.mp3', 4, 31),
(11, 'Stylish', 3, 3, 8, '3:29', 'assets/music/stylish.mp3', 5, 32),
(12, 'Indigo', 6, 4, 5, '2:53', 'assets/music/indigo.mp3', 1, 31),
(13, 'La La Lost You', 6, 4, 5, '3:20', 'assets/music/laLaLostYou.mp3', 2, 33),
(14, 'Vintage', 4, 5, 5, '2:57', 'assets/music/vintage.mp3', 1, 18),
(15, 'lowkey', 4, 6, 5, '2:51', 'assets/music/lowkey.mp3', 1, 27),
(16, 'See U Never', 4, 7, 5, '3:38', 'assets/music/seeUNever.mp3', 1, 26),
(17, 'Wanted', 5, 8, 2, '2:41', 'assets/music/wanted.mp3', 1, 37),
(18, 'Keep you Mine', 5, 9, 7, '2:56', 'assets/music/keepYouMine.mp3', 1, 38),
(19, 'Been There Done That', 5, 10, 7, '3:17', 'assets/music/beenThereDoneThat.mp3', 1, 17);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(25) NOT NULL,
  `firstName` varchar(50) NOT NULL,
  `lastName` varchar(50) NOT NULL,
  `email` varchar(200) NOT NULL,
  `password` varchar(32) NOT NULL,
  `signUpDate` datetime NOT NULL,
  `profilePic` varchar(500) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `firstName`, `lastName`, `email`, `password`, `signUpDate`, `profilePic`) VALUES
(3, 'asdasd', 'Asdasd', 'Asd', 'A@a.com', 'a8f5f167f44f4964e6c998dee827110c', '2020-02-12 00:00:00', 'assets/images/profile-pics/head_emerald.png'),
(4, 'voidcs', 'James', 'Rungsawang', 'Jameswrungsawang@yahoo.com', '7c6a180b36896a0a8c02787eeafb0e4c', '2020-02-27 00:00:00', 'assets/images/profile-pics/head_emerald.png');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `albums`
--
ALTER TABLE `albums`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `artists`
--
ALTER TABLE `artists`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `genres`
--
ALTER TABLE `genres`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `playlists`
--
ALTER TABLE `playlists`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `playlistsongs`
--
ALTER TABLE `playlistsongs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `songs`
--
ALTER TABLE `songs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `albums`
--
ALTER TABLE `albums`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `artists`
--
ALTER TABLE `artists`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `genres`
--
ALTER TABLE `genres`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `playlists`
--
ALTER TABLE `playlists`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `playlistsongs`
--
ALTER TABLE `playlistsongs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `songs`
--
ALTER TABLE `songs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
