-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 26, 2021 at 05:25 PM
-- Server version: 10.4.20-MariaDB
-- PHP Version: 8.0.9

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `unipal_test_db`
--

--
-- Dumping data for table `activities`
--

INSERT INTO `activities` (`activity_id`, `location`, `privacy`, `frequency`, `monday`, `tuesday`, `wednesday`, `thursday`, `friday`, `saturday`, `sunday`, `month_number`, `group_size`, `happens_at`, `additional_directions`, `activity_type_id`, `activity_status_id`, `campus_spot_id`, `organizer_erp`, `created_at`) VALUES
(1, 'on_campus', 'public', 'daily', 1, 1, 1, 1, 1, 1, 1, 10, 100, '04:30:00', NULL, 1, 1, 2, '17855', '2021-09-17 15:53:40'),
(2, 'on_campus', 'public', 'one_time', 1, 0, 0, 0, 0, 0, 0, 10, 3, '05:30:00', NULL, 1, 1, 2, '17855', '2021-09-17 15:53:40'),
(3, 'on_campus', 'limited', 'combo', 1, 0, 0, 0, 1, 0, 0, 10, 3, '05:30:00', NULL, 1, 1, 2, '15030', '2021-09-17 15:53:40');

--
-- Dumping data for table `activity_attendees`
--

INSERT INTO `activity_attendees` (`student_erp`, `activity_id`, `involvement_type`) VALUES
('15030', 1, 'interested'),
('17855', 1, 'going');

--
-- Dumping data for table `activity_statuses`
--

INSERT INTO `activity_statuses` (`activity_status_id`, `activity_status`) VALUES
(1, 'Happening'),
(2, 'Scheduled'),
(3, 'Cancelled'),
(4, 'Completed');

--
-- Dumping data for table `activity_types`
--

INSERT INTO `activity_types` (`activity_type_id`, `activity_type`) VALUES
(1, 'Sports'),
(4, 'Jamming'),
(5, 'Food'),
(6, 'Games');

--
-- Dumping data for table `campuses`
--

INSERT INTO `campuses` (`campus_id`, `campus`, `location_url`) VALUES
(1, 'MAIN', 'https://maps.app.goo.gl/LvH61VeZZVfyggHw6'),
(2, 'CITY', 'https://maps.app.goo.gl/LvH61VeZZVfyggHw6');

--
-- Dumping data for table `campus_spots`
--

INSERT INTO `campus_spots` (`campus_spot_id`, `campus_spot`, `campus_id`) VALUES
(2, 'Tabba 1st Floor (Lab Wing)', 1),
(3, 'Tabba Ground Floor (Lab Wing)', 1),
(4, 'Tabba Ground Floor (Offices Wing)', 1),
(5, 'Tabba 1st Floor (Offices Wing)', 1),
(6, 'Courtyard', 1),
(7, 'Student Center (SC)', 1),
(8, 'Auditorium', 1),
(9, 'Auditorium', 2);

--
-- Dumping data for table `hobbies`
--

INSERT INTO `hobbies` (`hobby_id`, `hobby`) VALUES
(1, 'painting'),
(2, 'singing'),
(3, 'reading'),
(4, 'coding');

--
-- Dumping data for table `interests`
--

INSERT INTO `interests` (`interest_id`, `interest`) VALUES
(1, 'sports'),
(2, 'art'),
(3, 'history'),
(4, 'technology');

--
-- Dumping data for table `programs`
--

INSERT INTO `programs` (`program_id`, `program`) VALUES
(1, 'BSCS'),
(2, 'BSACF');

--
-- Dumping data for table `saved_activities`
--

INSERT INTO `saved_activities` (`student_erp`, `activity_id`, `saved_at`) VALUES
('17855', 1, '2021-09-17 15:53:40'),
('17855', 3, '2021-09-17 15:53:40');

--
-- Dumping data for table `students`
--

INSERT INTO `students` (`erp`, `first_name`, `last_name`, `gender`, `contact`, `email`, `birthday`, `password`, `profile_picture_url`, `graduation_year`, `uni_email`, `hobby_1`, `hobby_2`, `hobby_3`, `interest_1`, `interest_2`, `interest_3`, `program_id`, `campus_id`, `favourite_campus_hangout_spot`, `favourite_campus_activity`, `current_status`, `is_active`, `role`) VALUES
('15030', 'Mohammad Rafay', 'Siddiqui', 'male', '+923009999999', 'rafaysiddiqui58@gmail.com', '1999-09-18', '$2a$08$rN26l6b2CRlSxp0jvCf/4u4WXJ85upOty4t73LR2b419wu/5.22ga', 'https://i.pinimg.com/564x/8d/e3/89/8de389c84e919d3577f47118e2627d95.jpg', 2022, 'm.rafay.15030@iba.khi.edu.pk', 1, 2, 3, 1, 2, 3, 1, 1, 'CED', 'Lifting', 1, 1, 'admin'),
('17855', 'Abdur Rafay', 'Saleem', 'male', '+923009999999', 'arafaysaleem@gmail.com', '1999-09-18', '$2a$08$ae56kqYKrC.0WFsB5oTKxOL4l9hVB5tLCAEYfE5AdF8iVncG7OEQe', 'https://i.pinimg.com/564x/8d/e3/89/8de389c84e919d3577f47118e2627d95.jpg', 2022, 'a.rafay.17855@iba.khi.edu.pk', 1, 2, 3, 1, 2, 3, 1, 1, 'CED', 'Lifting', 1, 1, 'api_user');

--
-- Dumping data for table `student_statuses`
--

INSERT INTO `student_statuses` (`student_status_id`, `student_status`) VALUES
(1, 'Looking for a friend'),
(2, 'Looking for transport');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
