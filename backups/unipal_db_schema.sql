-- MariaDB dump 10.19  Distrib 10.4.20-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: unipal_db
-- ------------------------------------------------------
-- Server version	10.4.20-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `activities`
--

DROP TABLE IF EXISTS `activities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `activities` (
  `activity_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(50) NOT NULL,
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
  `month_number` tinyint(2) unsigned NOT NULL,
  `group_size` smallint(5) unsigned NOT NULL DEFAULT 1,
  `happens_at` time NOT NULL,
  `additional_instructions` varchar(100) DEFAULT NULL,
  `activity_type_id` int(10) unsigned NOT NULL,
  `activity_status_id` int(10) unsigned NOT NULL,
  `campus_spot_id` int(10) unsigned DEFAULT NULL,
  `organizer_erp` varchar(5) NOT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`activity_id`),
  KEY `fk_activities_activity_status_id_idx` (`activity_status_id`),
  KEY `fk_activities_activity_type_id_idx` (`activity_type_id`),
  KEY `fk_activities_campus_spot_id_idx` (`campus_spot_id`),
  KEY `fk_activities_student_erp_idx` (`organizer_erp`),
  CONSTRAINT `fk_activities_activity_status_id` FOREIGN KEY (`activity_status_id`) REFERENCES `activity_statuses` (`activity_status_id`),
  CONSTRAINT `fk_activities_activity_type_id` FOREIGN KEY (`activity_type_id`) REFERENCES `activity_types` (`activity_type_id`),
  CONSTRAINT `fk_activities_campus_spot_id` FOREIGN KEY (`campus_spot_id`) REFERENCES `campus_spots` (`campus_spot_id`),
  CONSTRAINT `fk_activities_student_erp` FOREIGN KEY (`organizer_erp`) REFERENCES `students` (`erp`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `activity_attendees`
--

DROP TABLE IF EXISTS `activity_attendees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `activity_attendees` (
  `student_erp` varchar(5) NOT NULL,
  `activity_id` int(10) unsigned NOT NULL,
  `involvement_type` enum('going','interested','will_try') NOT NULL,
  PRIMARY KEY (`student_erp`,`activity_id`),
  KEY `fk_activity_attendees_activity_id_idx` (`activity_id`),
  KEY `fk_activity_attendees_student_erp_idx` (`student_erp`),
  CONSTRAINT `fk_activity_attendees_activity_id` FOREIGN KEY (`activity_id`) REFERENCES `activities` (`activity_id`),
  CONSTRAINT `fk_activity_attendees_student_erp` FOREIGN KEY (`student_erp`) REFERENCES `students` (`erp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `activity_statuses`
--

DROP TABLE IF EXISTS `activity_statuses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `activity_statuses` (
  `activity_status_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `activity_status` varchar(45) NOT NULL,
  PRIMARY KEY (`activity_status_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `activity_types`
--

DROP TABLE IF EXISTS `activity_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `activity_types` (
  `activity_type_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `activity_type` varchar(45) NOT NULL,
  PRIMARY KEY (`activity_type_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `campus_spots`
--

DROP TABLE IF EXISTS `campus_spots`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `campus_spots` (
  `campus_spot_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `campus_spot` varchar(45) NOT NULL,
  `campus_id` int(10) unsigned NOT NULL,
  PRIMARY KEY (`campus_spot_id`),
  KEY `fk_campus_spots_campus_id_idx` (`campus_id`),
  CONSTRAINT `fk_campus_spots_campus_id` FOREIGN KEY (`campus_id`) REFERENCES `campuses` (`campus_id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `campuses`
--

DROP TABLE IF EXISTS `campuses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `campuses` (
  `campus_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `campus` varchar(45) NOT NULL,
  `location_url` varchar(500) NOT NULL,
  PRIMARY KEY (`campus_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `classes`
--

DROP TABLE IF EXISTS `classes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `classes` (
  `class_erp` varchar(5) NOT NULL,
  `semester` varchar(45) NOT NULL,
  `classroom_id` int(10) unsigned NOT NULL,
  `subject_code` varchar(6) NOT NULL,
  `teacher_id` int(10) unsigned NOT NULL,
  `parent_class_erp` varchar(5) DEFAULT NULL,
  `timeslot_1` int(10) unsigned NOT NULL,
  `timeslot_2` int(10) unsigned NOT NULL,
  `day_1` enum('monday','tuesday','wednesday','thursday','friday','saturday','sunday') NOT NULL,
  `day_2` enum('monday','tuesday','wednesday','thursday','friday','saturday','sunday') NOT NULL,
  PRIMARY KEY (`class_erp`),
  KEY `fk_classes_classroom_id_idx` (`classroom_id`),
  KEY `fk_classes_parent_class_erp_idx` (`parent_class_erp`),
  KEY `fk_classes_subject_code_idx` (`subject_code`),
  KEY `fk_classes_teacher_id_idx` (`teacher_id`),
  KEY `fk_classes_timeslot_1_id_idx` (`timeslot_1`) USING BTREE,
  KEY `fk_classes_timeslot_2_id_idx` (`timeslot_2`) USING BTREE,
  CONSTRAINT `fk_classes_classroom_id` FOREIGN KEY (`classroom_id`) REFERENCES `classrooms` (`classroom_id`),
  CONSTRAINT `fk_classes_parent_class_erp` FOREIGN KEY (`parent_class_erp`) REFERENCES `classes` (`class_erp`),
  CONSTRAINT `fk_classes_subject_code` FOREIGN KEY (`subject_code`) REFERENCES `subjects` (`subject_code`),
  CONSTRAINT `fk_classes_teacher_id` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`teacher_id`),
  CONSTRAINT `fk_classes_timeslot_1_id` FOREIGN KEY (`timeslot_1`) REFERENCES `timeslots` (`timeslot_id`),
  CONSTRAINT `fk_classes_timeslot_2_id` FOREIGN KEY (`timeslot_2`) REFERENCES `timeslots` (`timeslot_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `classrooms`
--

DROP TABLE IF EXISTS `classrooms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `classrooms` (
  `classroom_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `classroom` varchar(10) NOT NULL,
  `campus_id` int(10) unsigned NOT NULL,
  PRIMARY KEY (`classroom_id`),
  KEY `fk_class_rooms_campus_id_idx` (`campus_id`),
  CONSTRAINT `fk_class_rooms_campus_id` FOREIGN KEY (`campus_id`) REFERENCES `campuses` (`campus_id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `hangout_requests`
--

DROP TABLE IF EXISTS `hangout_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `hangout_requests` (
  `hangout_request_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `sender_erp` varchar(5) NOT NULL,
  `receiver_erp` varchar(5) NOT NULL,
  `request_status` enum('request_pending','accepted','rejected') NOT NULL DEFAULT 'request_pending',
  `purpose` varchar(150) NOT NULL,
  `meetup_at` datetime NOT NULL,
  `meetup_spot_id` int(10) unsigned NOT NULL,
  `accepted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`hangout_request_id`),
  KEY `fk_hangout_requests_campus_spot_id_idx` (`meetup_spot_id`),
  KEY `fk_hangout_requests_receiver_erp_idx` (`receiver_erp`),
  KEY `fk_hangout_requests_sender_erp_idx` (`sender_erp`),
  CONSTRAINT `fk_hangout_requests_campus_spot_id` FOREIGN KEY (`meetup_spot_id`) REFERENCES `campus_spots` (`campus_spot_id`),
  CONSTRAINT `fk_hangout_requests_receiver_erp` FOREIGN KEY (`receiver_erp`) REFERENCES `students` (`erp`),
  CONSTRAINT `fk_hangout_requests_sender_erp` FOREIGN KEY (`sender_erp`) REFERENCES `students` (`erp`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `hobbies`
--

DROP TABLE IF EXISTS `hobbies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `hobbies` (
  `hobby_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `hobby` varchar(45) NOT NULL,
  PRIMARY KEY (`hobby_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `interests`
--

DROP TABLE IF EXISTS `interests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `interests` (
  `interest_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `interest` varchar(45) NOT NULL,
  PRIMARY KEY (`interest_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `otp_codes`
--

DROP TABLE IF EXISTS `otp_codes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `otp_codes` (
  `erp` varchar(5) NOT NULL,
  `OTP` text NOT NULL,
  `expiration_datetime` datetime NOT NULL,
  PRIMARY KEY (`erp`),
  CONSTRAINT `fk_otp_codes_student_erp` FOREIGN KEY (`erp`) REFERENCES `students` (`erp`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `post_reactions`
--

DROP TABLE IF EXISTS `post_reactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `post_reactions` (
  `post_id` int(10) unsigned NOT NULL,
  `reaction_type_id` int(10) unsigned NOT NULL,
  `student_erp` varchar(5) NOT NULL,
  `reacted_at` datetime NOT NULL,
  PRIMARY KEY (`post_id`,`student_erp`) USING BTREE,
  KEY `fk_post_reactions_post_id_idx` (`post_id`),
  KEY `fk_post_reactions_student_erp_idx` (`student_erp`),
  KEY `fk_post_reactions_reaction_type_id` (`reaction_type_id`),
  CONSTRAINT `fk_post_reactions_post_id` FOREIGN KEY (`post_id`) REFERENCES `posts` (`post_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_post_reactions_reaction_type_id` FOREIGN KEY (`reaction_type_id`) REFERENCES `reaction_types` (`reaction_type_id`),
  CONSTRAINT `fk_post_reactions_student_erp` FOREIGN KEY (`student_erp`) REFERENCES `students` (`erp`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `post_resources`
--

DROP TABLE IF EXISTS `post_resources`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `post_resources` (
  `post_id` int(10) unsigned NOT NULL,
  `resource_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `resource_type` enum('image','video') NOT NULL,
  `resource_url` text NOT NULL,
  PRIMARY KEY (`resource_id`),
  KEY `fk_post_uploads_post_id_idx` (`post_id`),
  CONSTRAINT `fk_post_uploads_post_id` FOREIGN KEY (`post_id`) REFERENCES `posts` (`post_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `posts`
--

DROP TABLE IF EXISTS `posts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `posts` (
  `post_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `body` text NOT NULL,
  `privacy` enum('public','private','limited') NOT NULL,
  `posted_at` datetime NOT NULL,
  `author_erp` varchar(5) NOT NULL,
  PRIMARY KEY (`post_id`),
  KEY `fk_posts_student_erp_idx` (`author_erp`),
  CONSTRAINT `fk_posts_student_erp` FOREIGN KEY (`author_erp`) REFERENCES `students` (`erp`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `programs`
--

DROP TABLE IF EXISTS `programs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `programs` (
  `program_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `program` varchar(45) NOT NULL,
  PRIMARY KEY (`program_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `reaction_types`
--

DROP TABLE IF EXISTS `reaction_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `reaction_types` (
  `reaction_type_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `reaction_type` varchar(45) NOT NULL,
  PRIMARY KEY (`reaction_type_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `saved_activities`
--

DROP TABLE IF EXISTS `saved_activities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `saved_activities` (
  `student_erp` varchar(5) NOT NULL,
  `activity_id` int(10) unsigned NOT NULL,
  `saved_at` datetime NOT NULL,
  PRIMARY KEY (`student_erp`,`activity_id`),
  KEY `fk_saved_activities_activity_id_idx` (`activity_id`),
  KEY `fk_saved_activities_student_erp_idx` (`student_erp`),
  CONSTRAINT `fk_saved_activities_activity_id` FOREIGN KEY (`activity_id`) REFERENCES `activities` (`activity_id`),
  CONSTRAINT `fk_saved_activities_student_erp` FOREIGN KEY (`student_erp`) REFERENCES `students` (`erp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `student_connections`
--

DROP TABLE IF EXISTS `student_connections`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `student_connections` (
  `student_connection_id` int(11) NOT NULL AUTO_INCREMENT,
  `sender_erp` varchar(5) NOT NULL,
  `receiver_erp` varchar(5) NOT NULL,
  `connection_status` enum('friends','request_pending') NOT NULL DEFAULT 'request_pending',
  `sent_at` datetime NOT NULL,
  `accepted_at` datetime DEFAULT NULL,
  `student_1_erp` varchar(5) NOT NULL,
  `student_2_erp` varchar(5) NOT NULL,
  PRIMARY KEY (`student_connection_id`),
  UNIQUE KEY `unique_sender_receiver` (`student_1_erp`,`student_2_erp`) USING BTREE,
  KEY `search_by_sender_erp` (`sender_erp`,`receiver_erp`) USING BTREE,
  KEY `search_by_receiver_erp` (`receiver_erp`,`sender_erp`) USING BTREE,
  KEY `fk_friend_requests_student_2_erp` (`student_2_erp`),
  CONSTRAINT `fk_friend_requests_receiver_erp_idx` FOREIGN KEY (`receiver_erp`) REFERENCES `students` (`erp`),
  CONSTRAINT `fk_friend_requests_sender_erp_idx` FOREIGN KEY (`sender_erp`) REFERENCES `students` (`erp`),
  CONSTRAINT `fk_friend_requests_student_1_erp` FOREIGN KEY (`student_1_erp`) REFERENCES `students` (`erp`),
  CONSTRAINT `fk_friend_requests_student_2_erp` FOREIGN KEY (`student_2_erp`) REFERENCES `students` (`erp`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `student_statuses`
--

DROP TABLE IF EXISTS `student_statuses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `student_statuses` (
  `student_status_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `student_status` varchar(45) NOT NULL,
  PRIMARY KEY (`student_status_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `students`
--

DROP TABLE IF EXISTS `students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
  `hobby_1` int(10) unsigned DEFAULT NULL,
  `hobby_2` int(10) unsigned DEFAULT NULL,
  `hobby_3` int(10) unsigned DEFAULT NULL,
  `interest_1` int(10) unsigned DEFAULT NULL,
  `interest_2` int(10) unsigned DEFAULT NULL,
  `interest_3` int(10) unsigned DEFAULT NULL,
  `program_id` int(10) unsigned NOT NULL,
  `campus_id` int(10) unsigned NOT NULL,
  `favourite_campus_hangout_spot` varchar(45) DEFAULT NULL,
  `favourite_campus_activity` varchar(45) DEFAULT NULL,
  `current_status` int(10) unsigned DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `role` enum('admin','api_user','moderator') NOT NULL DEFAULT 'api_user',
  PRIMARY KEY (`erp`),
  UNIQUE KEY `uni_email` (`uni_email`),
  KEY `fk_students_campus_id_idx` (`campus_id`),
  KEY `fk_students_hobby_id_1_idx` (`hobby_1`),
  KEY `fk_students_hobby_id_2_idx` (`hobby_2`),
  KEY `fk_students_hobby_id_3_idx` (`hobby_3`),
  KEY `fk_students_interest_id_1_idx` (`interest_1`),
  KEY `fk_students_interest_id_2_idx` (`interest_2`),
  KEY `fk_students_interest_id_3_idx` (`interest_3`),
  KEY `fk_students_program_id_idx` (`program_id`),
  KEY `fk_students_student_status_id_idx` (`current_status`) USING BTREE,
  CONSTRAINT `fk_students_campus_id` FOREIGN KEY (`campus_id`) REFERENCES `campuses` (`campus_id`),
  CONSTRAINT `fk_students_hobby_id_1` FOREIGN KEY (`hobby_1`) REFERENCES `hobbies` (`hobby_id`),
  CONSTRAINT `fk_students_hobby_id_2` FOREIGN KEY (`hobby_2`) REFERENCES `hobbies` (`hobby_id`),
  CONSTRAINT `fk_students_hobby_id_3` FOREIGN KEY (`hobby_3`) REFERENCES `hobbies` (`hobby_id`),
  CONSTRAINT `fk_students_interest_id_1` FOREIGN KEY (`interest_1`) REFERENCES `interests` (`interest_id`),
  CONSTRAINT `fk_students_interest_id_2` FOREIGN KEY (`interest_2`) REFERENCES `interests` (`interest_id`),
  CONSTRAINT `fk_students_interest_id_3` FOREIGN KEY (`interest_3`) REFERENCES `interests` (`interest_id`),
  CONSTRAINT `fk_students_program_id` FOREIGN KEY (`program_id`) REFERENCES `programs` (`program_id`),
  CONSTRAINT `fk_students_student_status_id` FOREIGN KEY (`current_status`) REFERENCES `student_statuses` (`student_status_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `subjects`
--

DROP TABLE IF EXISTS `subjects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `subjects` (
  `subject_code` varchar(6) NOT NULL,
  `subject` varchar(45) NOT NULL,
  PRIMARY KEY (`subject_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `teacher_reviews`
--

DROP TABLE IF EXISTS `teacher_reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `teacher_reviews` (
  `review_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `learning` tinyint(1) NOT NULL,
  `grading` tinyint(1) NOT NULL,
  `attendance` tinyint(1) NOT NULL,
  `strictness` tinyint(1) NOT NULL,
  `toughness` tinyint(1) NOT NULL,
  `overall_rating` decimal(2,1) NOT NULL,
  `comment` text NOT NULL,
  `reviewed_at` datetime NOT NULL,
  `subject_code` varchar(6) NOT NULL,
  `teacher_id` int(10) unsigned NOT NULL,
  `reviewed_by_erp` varchar(5) NOT NULL,
  PRIMARY KEY (`review_id`),
  UNIQUE KEY `unique_review` (`teacher_id`,`reviewed_by_erp`) USING BTREE,
  KEY `fk_teacher_reviews_student_erp_idx` (`reviewed_by_erp`),
  KEY `fk_teacher_reviews_teacher_id_idx` (`teacher_id`),
  KEY `fk_teacher_reviews_subject_code` (`subject_code`),
  CONSTRAINT `fk_teacher_reviews_student_erp` FOREIGN KEY (`reviewed_by_erp`) REFERENCES `students` (`erp`),
  CONSTRAINT `fk_teacher_reviews_subject_code` FOREIGN KEY (`subject_code`) REFERENCES `subjects` (`subject_code`),
  CONSTRAINT `fk_teacher_reviews_teacher_id` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`teacher_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `teachers`
--

DROP TABLE IF EXISTS `teachers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `teachers` (
  `teacher_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `full_name` varchar(45) NOT NULL,
  `average_rating` decimal(2,1) unsigned NOT NULL,
  `total_reviews` int(10) unsigned NOT NULL,
  PRIMARY KEY (`teacher_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `timeslots`
--

DROP TABLE IF EXISTS `timeslots`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `timeslots` (
  `start_time` time NOT NULL,
  `timeslot_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `end_time` time NOT NULL,
  `slot_number` tinyint(2) unsigned NOT NULL,
  PRIMARY KEY (`timeslot_id`),
  UNIQUE KEY `ind_383` (`end_time`,`start_time`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `timetable_classes`
--

DROP TABLE IF EXISTS `timetable_classes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `timetable_classes` (
  `timetable_id` int(10) unsigned NOT NULL,
  `class_erp` varchar(5) NOT NULL,
  PRIMARY KEY (`timetable_id`,`class_erp`) USING BTREE,
  KEY `fk_timetable_classes_timetable_id_idx` (`timetable_id`),
  KEY `fk_timetable_classes_class_erp_idx` (`class_erp`) USING BTREE,
  CONSTRAINT `fk_timetable_classes_class_erp` FOREIGN KEY (`class_erp`) REFERENCES `classes` (`class_erp`),
  CONSTRAINT `fk_timetable_classes_timetable_id` FOREIGN KEY (`timetable_id`) REFERENCES `timetables` (`timetable_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `timetable_share_rooms`
--

DROP TABLE IF EXISTS `timetable_share_rooms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `timetable_share_rooms` (
  `tsr_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `owner_erp` varchar(5) NOT NULL,
  `name` varchar(45) NOT NULL,
  `timetable_id` int(10) unsigned NOT NULL,
  PRIMARY KEY (`tsr_id`),
  KEY `fk_timetable_share_rooms_student_erp_idx` (`owner_erp`),
  KEY `fk_timetable_share_rooms_timetable_id_idx` (`timetable_id`),
  CONSTRAINT `fk_timetable_share_rooms_student_erp` FOREIGN KEY (`owner_erp`) REFERENCES `students` (`erp`),
  CONSTRAINT `fk_timetable_share_rooms_timetable_id` FOREIGN KEY (`timetable_id`) REFERENCES `timetables` (`timetable_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `timetables`
--

DROP TABLE IF EXISTS `timetables`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `timetables` (
  `timetable_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `student_erp` varchar(5) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`timetable_id`),
  KEY `fk_timetables_student_erp_idx` (`student_erp`),
  CONSTRAINT `fk_timetables_student_erp` FOREIGN KEY (`student_erp`) REFERENCES `students` (`erp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tsr_members`
--

DROP TABLE IF EXISTS `tsr_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tsr_members` (
  `tsr_id` int(10) unsigned NOT NULL,
  `student_erp` varchar(5) NOT NULL,
  `timetable_id` int(10) unsigned NOT NULL,
  PRIMARY KEY (`tsr_id`,`student_erp`),
  KEY `fk_tsr_members_student_erp_idx` (`student_erp`),
  KEY `fk_tsr_members_timetable_id_idx` (`timetable_id`),
  KEY `fk_tsr_members_tsr_id_idx` (`tsr_id`),
  CONSTRAINT `fk_tsr_members_student_erp` FOREIGN KEY (`student_erp`) REFERENCES `students` (`erp`),
  CONSTRAINT `fk_tsr_members_timetable_id` FOREIGN KEY (`timetable_id`) REFERENCES `timetables` (`timetable_id`),
  CONSTRAINT `fk_tsr_members_tsr_id` FOREIGN KEY (`tsr_id`) REFERENCES `timetable_share_rooms` (`tsr_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2021-11-02  2:57:23
