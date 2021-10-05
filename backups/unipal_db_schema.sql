-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 05, 2021 at 05:34 PM
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
-- Database: `unipal_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `activities`
--

CREATE TABLE `activities` (
  `activity_id` int(10) UNSIGNED NOT NULL,
  `location` enum('on_campus','external') NOT NULL,
  `privacy` enum('public','private','limited') NOT NULL,
  `frequency` enum('daily','weekly','one_time','combo') NOT NULL,
  `monday` tinyint(1) NOT NULL DEFAULT 0,
  `tuesday` tinyint(1) NOT NULL DEFAULT 0,
  `wednesday` tinyint(1) NOT NULL DEFAULT 0,
  `thursday` tinyint(1) NOT NULL DEFAULT 0,
  `friday` tinyint(1) NOT NULL DEFAULT 0,
  `saturday` tinyint(1) NOT NULL DEFAULT 0,
  `sunday` tinyint(1) NOT NULL DEFAULT 0,
  `month_number` tinyint(2) UNSIGNED NOT NULL,
  `group_size` smallint(5) UNSIGNED NOT NULL DEFAULT 1,
  `happens_at` time NOT NULL,
  `additional_directions` varchar(100) DEFAULT NULL,
  `activity_type_id` int(10) UNSIGNED NOT NULL,
  `activity_status_id` int(10) UNSIGNED NOT NULL,
  `campus_spot_id` int(10) UNSIGNED DEFAULT NULL,
  `organizer_erp` varchar(5) NOT NULL,
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `activity_attendees`
--

CREATE TABLE `activity_attendees` (
  `student_erp` varchar(5) NOT NULL,
  `activity_id` int(10) UNSIGNED NOT NULL,
  `involvement_type` enum('going','interested','will_try') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `activity_statuses`
--

CREATE TABLE `activity_statuses` (
  `activity_status_id` int(10) UNSIGNED NOT NULL,
  `activity_status` varchar(45) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `activity_types`
--

CREATE TABLE `activity_types` (
  `activity_type_id` int(10) UNSIGNED NOT NULL,
  `activity_type` varchar(45) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `campuses`
--

CREATE TABLE `campuses` (
  `campus_id` int(10) UNSIGNED NOT NULL,
  `campus` varchar(45) NOT NULL,
  `location_url` varchar(500) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `campus_spots`
--

CREATE TABLE `campus_spots` (
  `campus_spot_id` int(10) UNSIGNED NOT NULL,
  `campus_spot` varchar(45) NOT NULL,
  `campus_id` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `classes`
--

CREATE TABLE `classes` (
  `class_erp` varchar(5) NOT NULL,
  `semester` varchar(45) NOT NULL,
  `classroom_id` int(10) UNSIGNED NOT NULL,
  `subject_code` varchar(10) NOT NULL,
  `teacher_id` int(10) UNSIGNED NOT NULL,
  `parent_class_erp` varchar(5) DEFAULT NULL,
  `timeslot_1` int(10) UNSIGNED NOT NULL,
  `timeslot_2` int(10) UNSIGNED NOT NULL,
  `day_1` enum('monday','tuesday','wednesday','thursday','friday','saturday','sunday') NOT NULL,
  `day_2` enum('monday','tuesday','wednesday','thursday','friday','saturday','sunday') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `classrooms`
--

CREATE TABLE `classrooms` (
  `classroom_id` int(10) UNSIGNED NOT NULL,
  `name` varchar(10) NOT NULL,
  `campus_id` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `hangout_requests`
--

CREATE TABLE `hangout_requests` (
  `sender_erp` varchar(5) NOT NULL,
  `receiver_erp` varchar(5) NOT NULL,
  `meeting_at` datetime NOT NULL,
  `meetup_spot` int(10) UNSIGNED NOT NULL,
  `purpose` int(10) UNSIGNED NOT NULL,
  `is_accepted` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `hobbies`
--

CREATE TABLE `hobbies` (
  `hobby_id` int(10) UNSIGNED NOT NULL,
  `hobby` varchar(45) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `interests`
--

CREATE TABLE `interests` (
  `interest_id` int(10) UNSIGNED NOT NULL,
  `interest` varchar(45) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `otp_codes`
--

CREATE TABLE `otp_codes` (
  `erp` varchar(5) NOT NULL,
  `OTP` text NOT NULL,
  `expiration_datetime` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `posts`
--

CREATE TABLE `posts` (
  `post_id` int(10) UNSIGNED NOT NULL,
  `body` text NOT NULL,
  `privacy` enum('public','private','limited') NOT NULL,
  `posted_at` datetime NOT NULL,
  `author_erp` varchar(5) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `post_reactions`
--

CREATE TABLE `post_reactions` (
  `post_id` int(10) UNSIGNED NOT NULL,
  `reaction_type_id` int(10) UNSIGNED NOT NULL,
  `student_erp` varchar(5) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `post_uploads`
--

CREATE TABLE `post_uploads` (
  `post_id` int(10) UNSIGNED NOT NULL,
  `resource_id` int(10) UNSIGNED NOT NULL,
  `resource_type` enum('image','video') NOT NULL,
  `resource_url` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `programs`
--

CREATE TABLE `programs` (
  `program_id` int(10) UNSIGNED NOT NULL,
  `program` varchar(45) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `reaction_types`
--

CREATE TABLE `reaction_types` (
  `reaction_type_id` int(10) UNSIGNED NOT NULL,
  `reaction_type` varchar(45) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `saved_activities`
--

CREATE TABLE `saved_activities` (
  `student_erp` varchar(5) NOT NULL,
  `activity_id` int(10) UNSIGNED NOT NULL,
  `saved_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

CREATE TABLE `students` (
  `erp` varchar(5) NOT NULL,
  `first_name` varchar(45) NOT NULL,
  `last_name` varchar(45) NOT NULL,
  `gender` enum('male','female') NOT NULL,
  `contact` varchar(45) NOT NULL,
  `email` varchar(45) DEFAULT NULL,
  `birthday` date NOT NULL,
  `password` text NOT NULL,
  `profile_picture_url` text NOT NULL,
  `graduation_year` year(4) NOT NULL,
  `uni_email` varchar(45) NOT NULL,
  `hobby_1` int(10) UNSIGNED DEFAULT NULL,
  `hobby_2` int(10) UNSIGNED DEFAULT NULL,
  `hobby_3` int(10) UNSIGNED DEFAULT NULL,
  `interest_1` int(10) UNSIGNED DEFAULT NULL,
  `interest_2` int(10) UNSIGNED DEFAULT NULL,
  `interest_3` int(10) UNSIGNED DEFAULT NULL,
  `program_id` int(10) UNSIGNED NOT NULL,
  `campus_id` int(10) UNSIGNED NOT NULL,
  `favourite_campus_hangout_spot` varchar(45) DEFAULT NULL,
  `favourite_campus_activity` varchar(45) DEFAULT NULL,
  `current_status` int(10) UNSIGNED DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `role` enum('admin','api_user','moderator') NOT NULL DEFAULT 'api_user'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `student_connections`
--

CREATE TABLE `student_connections` (
  `student_connection_id` int(11) NOT NULL,
  `sender_erp` varchar(5) NOT NULL,
  `receiver_erp` varchar(5) NOT NULL,
  `connection_status` enum('friends','request_pending') NOT NULL DEFAULT 'request_pending',
  `sent_at` datetime NOT NULL,
  `accepted_at` datetime DEFAULT NULL,
  `student_1_erp` varchar(5) NOT NULL,
  `student_2_erp` varchar(5) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `student_statuses`
--

CREATE TABLE `student_statuses` (
  `student_status_id` int(10) UNSIGNED NOT NULL,
  `student_status` varchar(45) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `subjects`
--

CREATE TABLE `subjects` (
  `subject_code` varchar(10) NOT NULL,
  `subject` varchar(45) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `teachers`
--

CREATE TABLE `teachers` (
  `teacher_id` int(10) UNSIGNED NOT NULL,
  `full_name` varchar(45) NOT NULL,
  `average_rating` decimal(2,1) UNSIGNED NOT NULL,
  `total_reviews` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `teacher_reviews`
--

CREATE TABLE `teacher_reviews` (
  `review_id` int(10) UNSIGNED NOT NULL,
  `learning` tinyint(1) NOT NULL,
  `grading` tinyint(1) NOT NULL,
  `attendance` tinyint(1) NOT NULL,
  `strictness` tinyint(1) NOT NULL,
  `toughness` tinyint(1) NOT NULL,
  `overall_rating` decimal(2,1) NOT NULL,
  `comment` text NOT NULL,
  `reviewed_at` datetime NOT NULL,
  `subject_code` varchar(10) NOT NULL,
  `teacher_id` int(10) UNSIGNED NOT NULL,
  `reviewed_by_erp` varchar(5) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `timeslots`
--

CREATE TABLE `timeslots` (
  `start_time` time NOT NULL,
  `timeslot_id` int(10) UNSIGNED NOT NULL,
  `end_time` time NOT NULL,
  `slot_number` tinyint(2) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `timetables`
--

CREATE TABLE `timetables` (
  `timetable_id` int(10) UNSIGNED NOT NULL,
  `student_erp` varchar(5) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `timetable_classes`
--

CREATE TABLE `timetable_classes` (
  `timetable_id` int(10) UNSIGNED NOT NULL,
  `class_erp` varchar(5) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `timetable_share_rooms`
--

CREATE TABLE `timetable_share_rooms` (
  `tsr_id` int(10) UNSIGNED NOT NULL,
  `owner_erp` varchar(5) NOT NULL,
  `name` varchar(45) NOT NULL,
  `timetable_id` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `tsr_members`
--

CREATE TABLE `tsr_members` (
  `tsr_id` int(10) UNSIGNED NOT NULL,
  `student_erp` varchar(5) NOT NULL,
  `timetable_id` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activities`
--
ALTER TABLE `activities`
  ADD PRIMARY KEY (`activity_id`),
  ADD KEY `fk_activities_activity_status_id_idx` (`activity_status_id`),
  ADD KEY `fk_activities_activity_type_id_idx` (`activity_type_id`),
  ADD KEY `fk_activities_campus_spot_id_idx` (`campus_spot_id`),
  ADD KEY `fk_activities_student_erp_idx` (`organizer_erp`);

--
-- Indexes for table `activity_attendees`
--
ALTER TABLE `activity_attendees`
  ADD PRIMARY KEY (`student_erp`,`activity_id`),
  ADD KEY `fk_activity_attendees_activity_id_idx` (`activity_id`),
  ADD KEY `fk_activity_attendees_student_erp_idx` (`student_erp`);

--
-- Indexes for table `activity_statuses`
--
ALTER TABLE `activity_statuses`
  ADD PRIMARY KEY (`activity_status_id`);

--
-- Indexes for table `activity_types`
--
ALTER TABLE `activity_types`
  ADD PRIMARY KEY (`activity_type_id`);

--
-- Indexes for table `campuses`
--
ALTER TABLE `campuses`
  ADD PRIMARY KEY (`campus_id`);

--
-- Indexes for table `campus_spots`
--
ALTER TABLE `campus_spots`
  ADD PRIMARY KEY (`campus_spot_id`),
  ADD KEY `fk_campus_spots_campus_id_idx` (`campus_id`);

--
-- Indexes for table `classes`
--
ALTER TABLE `classes`
  ADD PRIMARY KEY (`class_erp`),
  ADD KEY `fk_classes_classroom_id_idx` (`classroom_id`),
  ADD KEY `fk_classes_parent_class_erp_idx` (`parent_class_erp`),
  ADD KEY `fk_classes_subject_code_idx` (`subject_code`),
  ADD KEY `fk_classes_teacher_id_idx` (`teacher_id`),
  ADD KEY `fk_classes_timeslot_1_id_idx` (`timeslot_1`) USING BTREE,
  ADD KEY `fk_classes_timeslot_2_id_idx` (`timeslot_2`) USING BTREE;

--
-- Indexes for table `classrooms`
--
ALTER TABLE `classrooms`
  ADD PRIMARY KEY (`classroom_id`),
  ADD KEY `fk_class_rooms_campus_id_idx` (`campus_id`);

--
-- Indexes for table `hangout_requests`
--
ALTER TABLE `hangout_requests`
  ADD PRIMARY KEY (`sender_erp`,`receiver_erp`,`meeting_at`),
  ADD KEY `fk_hangout_requests_activity_type_id_idx` (`purpose`),
  ADD KEY `fk_hangout_requests_campus_spot_id_idx` (`meetup_spot`),
  ADD KEY `fk_hangout_requests_receiver_erp_idx` (`receiver_erp`),
  ADD KEY `fk_hangout_requests_sender_erp_idx` (`sender_erp`);

--
-- Indexes for table `hobbies`
--
ALTER TABLE `hobbies`
  ADD PRIMARY KEY (`hobby_id`);

--
-- Indexes for table `interests`
--
ALTER TABLE `interests`
  ADD PRIMARY KEY (`interest_id`);

--
-- Indexes for table `otp_codes`
--
ALTER TABLE `otp_codes`
  ADD PRIMARY KEY (`erp`);

--
-- Indexes for table `posts`
--
ALTER TABLE `posts`
  ADD PRIMARY KEY (`post_id`),
  ADD KEY `fk_posts_student_erp_idx` (`author_erp`);

--
-- Indexes for table `post_reactions`
--
ALTER TABLE `post_reactions`
  ADD PRIMARY KEY (`post_id`,`student_erp`) USING BTREE,
  ADD KEY `fk_post_reactions_post_id_idx` (`post_id`),
  ADD KEY `fk_post_reactions_student_erp_idx` (`student_erp`),
  ADD KEY `fk_post_reactions_reaction_type_id` (`reaction_type_id`);

--
-- Indexes for table `post_uploads`
--
ALTER TABLE `post_uploads`
  ADD PRIMARY KEY (`post_id`,`resource_id`) USING BTREE,
  ADD KEY `fk_post_uploads_post_id_idx` (`post_id`);

--
-- Indexes for table `programs`
--
ALTER TABLE `programs`
  ADD PRIMARY KEY (`program_id`);

--
-- Indexes for table `reaction_types`
--
ALTER TABLE `reaction_types`
  ADD PRIMARY KEY (`reaction_type_id`);

--
-- Indexes for table `saved_activities`
--
ALTER TABLE `saved_activities`
  ADD PRIMARY KEY (`student_erp`,`activity_id`),
  ADD KEY `fk_saved_activities_activity_id_idx` (`activity_id`),
  ADD KEY `fk_saved_activities_student_erp_idx` (`student_erp`);

--
-- Indexes for table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`erp`),
  ADD UNIQUE KEY `uni_email` (`uni_email`),
  ADD KEY `fk_students_campus_id_idx` (`campus_id`),
  ADD KEY `fk_students_hobby_id_1_idx` (`hobby_1`),
  ADD KEY `fk_students_hobby_id_2_idx` (`hobby_2`),
  ADD KEY `fk_students_hobby_id_3_idx` (`hobby_3`),
  ADD KEY `fk_students_interest_id_1_idx` (`interest_1`),
  ADD KEY `fk_students_interest_id_2_idx` (`interest_2`),
  ADD KEY `fk_students_interest_id_3_idx` (`interest_3`),
  ADD KEY `fk_students_program_id_idx` (`program_id`),
  ADD KEY `fk_students_student_status_id_idx` (`current_status`) USING BTREE;

--
-- Indexes for table `student_connections`
--
ALTER TABLE `student_connections`
  ADD PRIMARY KEY (`student_connection_id`),
  ADD UNIQUE KEY `unique_sender_receiver` (`student_1_erp`,`student_2_erp`) USING BTREE,
  ADD KEY `search_by_sender_erp` (`sender_erp`,`receiver_erp`) USING BTREE,
  ADD KEY `search_by_receiver_erp` (`receiver_erp`,`sender_erp`) USING BTREE;

--
-- Indexes for table `student_statuses`
--
ALTER TABLE `student_statuses`
  ADD PRIMARY KEY (`student_status_id`);

--
-- Indexes for table `subjects`
--
ALTER TABLE `subjects`
  ADD PRIMARY KEY (`subject_code`);

--
-- Indexes for table `teachers`
--
ALTER TABLE `teachers`
  ADD PRIMARY KEY (`teacher_id`);

--
-- Indexes for table `teacher_reviews`
--
ALTER TABLE `teacher_reviews`
  ADD PRIMARY KEY (`review_id`),
  ADD UNIQUE KEY `unique_review` (`teacher_id`,`reviewed_by_erp`) USING BTREE,
  ADD KEY `fk_teacher_reviews_student_erp_idx` (`reviewed_by_erp`),
  ADD KEY `fk_teacher_reviews_teacher_id_idx` (`teacher_id`),
  ADD KEY `fk_teacher_reviews_subject_code` (`subject_code`);

--
-- Indexes for table `timeslots`
--
ALTER TABLE `timeslots`
  ADD PRIMARY KEY (`timeslot_id`),
  ADD UNIQUE KEY `ind_383` (`end_time`,`start_time`);

--
-- Indexes for table `timetables`
--
ALTER TABLE `timetables`
  ADD PRIMARY KEY (`timetable_id`),
  ADD KEY `fk_timetables_student_erp_idx` (`student_erp`);

--
-- Indexes for table `timetable_classes`
--
ALTER TABLE `timetable_classes`
  ADD PRIMARY KEY (`timetable_id`,`class_erp`) USING BTREE,
  ADD KEY `fk_timetable_classes_timetable_id_idx` (`timetable_id`),
  ADD KEY `fk_timetable_classes_class_erp_idx` (`class_erp`) USING BTREE;

--
-- Indexes for table `timetable_share_rooms`
--
ALTER TABLE `timetable_share_rooms`
  ADD PRIMARY KEY (`tsr_id`),
  ADD KEY `fk_timetable_share_rooms_student_erp_idx` (`owner_erp`),
  ADD KEY `fk_timetable_share_rooms_timetable_id_idx` (`timetable_id`);

--
-- Indexes for table `tsr_members`
--
ALTER TABLE `tsr_members`
  ADD PRIMARY KEY (`tsr_id`,`student_erp`),
  ADD KEY `fk_tsr_members_student_erp_idx` (`student_erp`),
  ADD KEY `fk_tsr_members_timetable_id_idx` (`timetable_id`),
  ADD KEY `fk_tsr_members_tsr_id_idx` (`tsr_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activities`
--
ALTER TABLE `activities`
  MODIFY `activity_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `activity_statuses`
--
ALTER TABLE `activity_statuses`
  MODIFY `activity_status_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `activity_types`
--
ALTER TABLE `activity_types`
  MODIFY `activity_type_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `campuses`
--
ALTER TABLE `campuses`
  MODIFY `campus_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `campus_spots`
--
ALTER TABLE `campus_spots`
  MODIFY `campus_spot_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `classrooms`
--
ALTER TABLE `classrooms`
  MODIFY `classroom_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `hobbies`
--
ALTER TABLE `hobbies`
  MODIFY `hobby_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `interests`
--
ALTER TABLE `interests`
  MODIFY `interest_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `posts`
--
ALTER TABLE `posts`
  MODIFY `post_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `programs`
--
ALTER TABLE `programs`
  MODIFY `program_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `reaction_types`
--
ALTER TABLE `reaction_types`
  MODIFY `reaction_type_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `student_connections`
--
ALTER TABLE `student_connections`
  MODIFY `student_connection_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `student_statuses`
--
ALTER TABLE `student_statuses`
  MODIFY `student_status_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `teachers`
--
ALTER TABLE `teachers`
  MODIFY `teacher_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `teacher_reviews`
--
ALTER TABLE `teacher_reviews`
  MODIFY `review_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `timeslots`
--
ALTER TABLE `timeslots`
  MODIFY `timeslot_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `timetables`
--
ALTER TABLE `timetables`
  MODIFY `timetable_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `timetable_share_rooms`
--
ALTER TABLE `timetable_share_rooms`
  MODIFY `tsr_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `activities`
--
ALTER TABLE `activities`
  ADD CONSTRAINT `fk_activities_activity_status_id` FOREIGN KEY (`activity_status_id`) REFERENCES `activity_statuses` (`activity_status_id`),
  ADD CONSTRAINT `fk_activities_activity_type_id` FOREIGN KEY (`activity_type_id`) REFERENCES `activity_types` (`activity_type_id`),
  ADD CONSTRAINT `fk_activities_campus_spot_id` FOREIGN KEY (`campus_spot_id`) REFERENCES `campus_spots` (`campus_spot_id`),
  ADD CONSTRAINT `fk_activities_student_erp` FOREIGN KEY (`organizer_erp`) REFERENCES `students` (`erp`);

--
-- Constraints for table `activity_attendees`
--
ALTER TABLE `activity_attendees`
  ADD CONSTRAINT `fk_activity_attendees_activity_id` FOREIGN KEY (`activity_id`) REFERENCES `activities` (`activity_id`),
  ADD CONSTRAINT `fk_activity_attendees_student_erp` FOREIGN KEY (`student_erp`) REFERENCES `students` (`erp`);

--
-- Constraints for table `campus_spots`
--
ALTER TABLE `campus_spots`
  ADD CONSTRAINT `fk_campus_spots_campus_id` FOREIGN KEY (`campus_id`) REFERENCES `campuses` (`campus_id`);

--
-- Constraints for table `classes`
--
ALTER TABLE `classes`
  ADD CONSTRAINT `fk_classes_classroom_id` FOREIGN KEY (`classroom_id`) REFERENCES `classrooms` (`classroom_id`),
  ADD CONSTRAINT `fk_classes_parent_class_erp` FOREIGN KEY (`parent_class_erp`) REFERENCES `classes` (`class_erp`),
  ADD CONSTRAINT `fk_classes_subject_code` FOREIGN KEY (`subject_code`) REFERENCES `subjects` (`subject_code`),
  ADD CONSTRAINT `fk_classes_teacher_id` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`teacher_id`),
  ADD CONSTRAINT `fk_classes_timeslot_1_id` FOREIGN KEY (`timeslot_1`) REFERENCES `timeslots` (`timeslot_id`),
  ADD CONSTRAINT `fk_classes_timeslot_2_id` FOREIGN KEY (`timeslot_2`) REFERENCES `timeslots` (`timeslot_id`);

--
-- Constraints for table `classrooms`
--
ALTER TABLE `classrooms`
  ADD CONSTRAINT `fk_class_rooms_campus_id` FOREIGN KEY (`campus_id`) REFERENCES `campuses` (`campus_id`);

--
-- Constraints for table `hangout_requests`
--
ALTER TABLE `hangout_requests`
  ADD CONSTRAINT `fk_hangout_requests_activity_type_id` FOREIGN KEY (`purpose`) REFERENCES `activity_types` (`activity_type_id`),
  ADD CONSTRAINT `fk_hangout_requests_campus_spot_id` FOREIGN KEY (`meetup_spot`) REFERENCES `campus_spots` (`campus_spot_id`),
  ADD CONSTRAINT `fk_hangout_requests_receiver_erp` FOREIGN KEY (`receiver_erp`) REFERENCES `students` (`erp`),
  ADD CONSTRAINT `fk_hangout_requests_sender_erp` FOREIGN KEY (`sender_erp`) REFERENCES `students` (`erp`);

--
-- Constraints for table `otp_codes`
--
ALTER TABLE `otp_codes`
  ADD CONSTRAINT `fk_otp_codes_student_erp` FOREIGN KEY (`erp`) REFERENCES `students` (`erp`) ON DELETE CASCADE;

--
-- Constraints for table `posts`
--
ALTER TABLE `posts`
  ADD CONSTRAINT `fk_posts_student_erp` FOREIGN KEY (`author_erp`) REFERENCES `students` (`erp`);

--
-- Constraints for table `post_reactions`
--
ALTER TABLE `post_reactions`
  ADD CONSTRAINT `fk_post_reactions_post_id` FOREIGN KEY (`post_id`) REFERENCES `posts` (`post_id`),
  ADD CONSTRAINT `fk_post_reactions_reaction_type_id` FOREIGN KEY (`reaction_type_id`) REFERENCES `reaction_types` (`reaction_type_id`),
  ADD CONSTRAINT `fk_post_reactions_student_erp` FOREIGN KEY (`student_erp`) REFERENCES `students` (`erp`);

--
-- Constraints for table `post_uploads`
--
ALTER TABLE `post_uploads`
  ADD CONSTRAINT `fk_post_uploads_post_id` FOREIGN KEY (`post_id`) REFERENCES `posts` (`post_id`);

--
-- Constraints for table `saved_activities`
--
ALTER TABLE `saved_activities`
  ADD CONSTRAINT `fk_saved_activities_activity_id` FOREIGN KEY (`activity_id`) REFERENCES `activities` (`activity_id`),
  ADD CONSTRAINT `fk_saved_activities_student_erp` FOREIGN KEY (`student_erp`) REFERENCES `students` (`erp`);

--
-- Constraints for table `students`
--
ALTER TABLE `students`
  ADD CONSTRAINT `fk_students_campus_id` FOREIGN KEY (`campus_id`) REFERENCES `campuses` (`campus_id`),
  ADD CONSTRAINT `fk_students_hobby_id_1` FOREIGN KEY (`hobby_1`) REFERENCES `hobbies` (`hobby_id`),
  ADD CONSTRAINT `fk_students_hobby_id_2` FOREIGN KEY (`hobby_2`) REFERENCES `hobbies` (`hobby_id`),
  ADD CONSTRAINT `fk_students_hobby_id_3` FOREIGN KEY (`hobby_3`) REFERENCES `hobbies` (`hobby_id`),
  ADD CONSTRAINT `fk_students_interest_id_1` FOREIGN KEY (`interest_1`) REFERENCES `interests` (`interest_id`),
  ADD CONSTRAINT `fk_students_interest_id_2` FOREIGN KEY (`interest_2`) REFERENCES `interests` (`interest_id`),
  ADD CONSTRAINT `fk_students_interest_id_3` FOREIGN KEY (`interest_3`) REFERENCES `interests` (`interest_id`),
  ADD CONSTRAINT `fk_students_program_id` FOREIGN KEY (`program_id`) REFERENCES `programs` (`program_id`),
  ADD CONSTRAINT `fk_students_student_status_id` FOREIGN KEY (`current_status`) REFERENCES `student_statuses` (`student_status_id`);

--
-- Constraints for table `student_connections`
--
ALTER TABLE `student_connections`
  ADD CONSTRAINT `fk_friend_requests_receiver_erp_idx` FOREIGN KEY (`receiver_erp`) REFERENCES `students` (`erp`),
  ADD CONSTRAINT `fk_friend_requests_sender_erp_idx` FOREIGN KEY (`sender_erp`) REFERENCES `students` (`erp`);

--
-- Constraints for table `teacher_reviews`
--
ALTER TABLE `teacher_reviews`
  ADD CONSTRAINT `fk_teacher_reviews_student_erp` FOREIGN KEY (`reviewed_by_erp`) REFERENCES `students` (`erp`),
  ADD CONSTRAINT `fk_teacher_reviews_subject_code` FOREIGN KEY (`subject_code`) REFERENCES `subjects` (`subject_code`),
  ADD CONSTRAINT `fk_teacher_reviews_teacher_id` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`teacher_id`);

--
-- Constraints for table `timetables`
--
ALTER TABLE `timetables`
  ADD CONSTRAINT `fk_timetables_student_erp` FOREIGN KEY (`student_erp`) REFERENCES `students` (`erp`);

--
-- Constraints for table `timetable_classes`
--
ALTER TABLE `timetable_classes`
  ADD CONSTRAINT `fk_timetable_classes_class_erp` FOREIGN KEY (`class_erp`) REFERENCES `classes` (`class_erp`),
  ADD CONSTRAINT `fk_timetable_classes_timetable_id` FOREIGN KEY (`timetable_id`) REFERENCES `timetables` (`timetable_id`);

--
-- Constraints for table `timetable_share_rooms`
--
ALTER TABLE `timetable_share_rooms`
  ADD CONSTRAINT `fk_timetable_share_rooms_student_erp` FOREIGN KEY (`owner_erp`) REFERENCES `students` (`erp`),
  ADD CONSTRAINT `fk_timetable_share_rooms_timetable_id` FOREIGN KEY (`timetable_id`) REFERENCES `timetables` (`timetable_id`);

--
-- Constraints for table `tsr_members`
--
ALTER TABLE `tsr_members`
  ADD CONSTRAINT `fk_tsr_members_student_erp` FOREIGN KEY (`student_erp`) REFERENCES `students` (`erp`),
  ADD CONSTRAINT `fk_tsr_members_timetable_id` FOREIGN KEY (`timetable_id`) REFERENCES `timetables` (`timetable_id`),
  ADD CONSTRAINT `fk_tsr_members_tsr_id` FOREIGN KEY (`tsr_id`) REFERENCES `timetable_share_rooms` (`tsr_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
