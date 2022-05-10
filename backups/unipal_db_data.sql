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
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Dumping data for table `activities`
--

LOCK TABLES `activities` WRITE;
/*!40000 ALTER TABLE `activities` DISABLE KEYS */;
INSERT INTO `activities` VALUES (1,'Daily Campus Activity','on_campus','public','daily',1,1,1,1,1,1,1,10,100,'04:30:00',NULL,1,1,2,'17855','2021-09-17 15:53:40'),(2,'One Time Campus Activity','on_campus','public','one_time',1,0,0,0,0,0,0,10,3,'05:30:00',NULL,1,1,2,'17855','2021-09-17 15:53:40'),(3,'Custom Campus Activity','on_campus','limited','combo',1,0,0,0,1,0,0,10,3,'05:30:00',NULL,1,1,2,'15030','2021-09-17 15:53:40');
/*!40000 ALTER TABLE `activities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `activity_attendees`
--

LOCK TABLES `activity_attendees` WRITE;
/*!40000 ALTER TABLE `activity_attendees` DISABLE KEYS */;
INSERT INTO `activity_attendees` VALUES ('15030',1,'interested'),('17855',1,'going');
/*!40000 ALTER TABLE `activity_attendees` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `activity_statuses`
--

LOCK TABLES `activity_statuses` WRITE;
/*!40000 ALTER TABLE `activity_statuses` DISABLE KEYS */;
INSERT INTO `activity_statuses` VALUES (1,'Happening'),(2,'Scheduled'),(3,'Cancelled'),(4,'Completed');
/*!40000 ALTER TABLE `activity_statuses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `activity_types`
--

LOCK TABLES `activity_types` WRITE;
/*!40000 ALTER TABLE `activity_types` DISABLE KEYS */;
INSERT INTO `activity_types` VALUES (1,'Sports'),(4,'Jamming'),(5,'Food'),(6,'Games');
/*!40000 ALTER TABLE `activity_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `campus_spots`
--

LOCK TABLES `campus_spots` WRITE;
/*!40000 ALTER TABLE `campus_spots` DISABLE KEYS */;
INSERT INTO `campus_spots` VALUES (2,'Tabba 1st Floor (Lab Wing)',1),(3,'Tabba Ground Floor (Lab Wing)',1),(4,'Tabba Ground Floor (Offices Wing)',1),(5,'Tabba 1st Floor (Offices Wing)',1),(6,'Courtyard',1),(7,'Student Center (SC)',1),(8,'Auditorium',1),(9,'Auditorium',2);
/*!40000 ALTER TABLE `campus_spots` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `campuses`
--

LOCK TABLES `campuses` WRITE;
/*!40000 ALTER TABLE `campuses` DISABLE KEYS */;
INSERT INTO `campuses` VALUES (1,'MAIN','https://maps.app.goo.gl/LvH61VeZZVfyggHw6'),(2,'CITY','https://maps.app.goo.gl/LvH61VeZZVfyggHw6');
/*!40000 ALTER TABLE `campuses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `classes`
--

LOCK TABLES `classes` WRITE;
/*!40000 ALTER TABLE `classes` DISABLE KEYS */;
INSERT INTO `classes` VALUES ('5755','CS-7',2,'CSE452',4,NULL,5,5,'tuesday','thursday',1),('5756','CS-3',1,'CSE555',5,NULL,2,2,'monday','wednesday',1),('5757','CS-3',4,'CSE555',5,'5756',3,3,'monday','wednesday',1),('5758','ACF-2',3,'SCI102',1,NULL,2,2,'tuesday','thursday',2),('5759','ECO-2',5,'HUM201',2,NULL,2,2,'tuesday','thursday',2),('5760','ECO-2',5,'HUM201',2,NULL,3,3,'tuesday','thursday',2);
/*!40000 ALTER TABLE `classes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `classrooms`
--

LOCK TABLES `classrooms` WRITE;
/*!40000 ALTER TABLE `classrooms` DISABLE KEYS */;
INSERT INTO `classrooms` VALUES (1,'MTC1',1),(2,'MAC1',1),(3,'MCC1',1),(4,'MTL4',1),(5,'MTS2',1),(6,'MTC21-A',1),(7,'AUDITORIUM',1),(8,'EVENT HALL',1);
/*!40000 ALTER TABLE `classrooms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `hangout_requests`
--

LOCK TABLES `hangout_requests` WRITE;
/*!40000 ALTER TABLE `hangout_requests` DISABLE KEYS */;
INSERT INTO `hangout_requests` VALUES (1,'17855','15030','request_pending','Some purpose','2021-10-04 17:24:40',7,NULL),(2,'17855','15030','accepted','Some other purpose','2021-10-04 17:24:40',2,'2021-10-04 17:24:40'),(4,'15030','17855','request_pending','Let\'s grab lunch','2021-10-04 17:24:40',7,NULL),(5,'15030','17855','request_pending','Let\'s go for a movie','2022-05-10 17:24:40',6,NULL),(6,'15030','17855','request_pending','I wanna discuss the AUDIT project','2022-05-15 17:24:40',4,NULL),(8,'15030','17855','request_pending','Playing cards','2022-05-11 13:00:00',2,NULL);
/*!40000 ALTER TABLE `hangout_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `hobbies`
--

LOCK TABLES `hobbies` WRITE;
/*!40000 ALTER TABLE `hobbies` DISABLE KEYS */;
INSERT INTO `hobbies` VALUES (1,'painting'),(2,'singing'),(3,'reading'),(4,'coding');
/*!40000 ALTER TABLE `hobbies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `interests`
--

LOCK TABLES `interests` WRITE;
/*!40000 ALTER TABLE `interests` DISABLE KEYS */;
INSERT INTO `interests` VALUES (1,'sports'),(2,'art'),(3,'history'),(4,'technology');
/*!40000 ALTER TABLE `interests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `otp_codes`
--

LOCK TABLES `otp_codes` WRITE;
/*!40000 ALTER TABLE `otp_codes` DISABLE KEYS */;
/*!40000 ALTER TABLE `otp_codes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `post_reactions`
--

LOCK TABLES `post_reactions` WRITE;
/*!40000 ALTER TABLE `post_reactions` DISABLE KEYS */;
INSERT INTO `post_reactions` VALUES (1,2,'15030','2021-09-17 15:53:40'),(1,2,'17619','2021-09-17 15:53:40'),(2,4,'15030','2021-09-17 15:53:40'),(2,4,'17619','2021-09-17 15:53:40'),(2,2,'17855','2021-09-17 15:53:40'),(3,2,'15030','2021-09-17 15:53:40'),(3,2,'17855','2021-09-17 15:53:40'),(4,1,'17619','2021-09-17 15:53:40'),(4,2,'17855','2021-09-17 15:53:40'),(5,2,'15030','2021-09-17 15:53:40'),(6,2,'15030','2021-09-17 15:53:40'),(6,4,'17619','2021-09-17 15:53:40'),(6,2,'17855','2021-09-17 15:53:40'),(7,5,'15030','2021-09-17 15:53:40'),(7,5,'17619','2021-09-17 15:53:40'),(7,5,'17855','2021-09-17 15:53:40'),(8,2,'15030','2021-09-17 15:53:40'),(8,1,'17619','2021-09-17 15:53:40'),(8,2,'17855','2021-09-17 15:53:40');
/*!40000 ALTER TABLE `post_reactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `post_resources`
--

LOCK TABLES `post_resources` WRITE;
/*!40000 ALTER TABLE `post_resources` DISABLE KEYS */;
INSERT INTO `post_resources` VALUES (1,1,'image','www.google.com/images'),(1,2,'video','www.youtube.com'),(2,3,'image','www.google.com/images'),(2,4,'video','www.youtube.com'),(3,5,'image','www.google.com/images'),(3,6,'video','www.youtube.com'),(5,7,'image','www.google.com/images'),(5,8,'video','www.youtube.com'),(6,9,'image','www.google.com/images'),(6,10,'video','www.youtube.com'),(7,11,'image','www.google.com/images'),(7,12,'video','www.youtube.com'),(8,13,'image','www.google.com/images'),(8,14,'video','www.youtube.com');
/*!40000 ALTER TABLE `post_resources` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `posts`
--

LOCK TABLES `posts` WRITE;
/*!40000 ALTER TABLE `posts` DISABLE KEYS */;
INSERT INTO `posts` VALUES (1,'Some post content body','public','2021-09-17 15:53:40','17855'),(2,'Some post content body','public','2021-09-17 16:53:40','17855'),(3,'Some post content body','public','2021-09-17 17:53:40','17855'),(4,'Some post content body','private','2021-09-17 15:55:40','15030'),(5,'Some post content body','public','2021-09-17 17:55:40','15030'),(6,'Some post content body','limited','2021-09-17 18:55:40','15030'),(7,'Some post content body','public','2021-09-17 16:56:40','17619'),(8,'Some post content body','public','2021-09-17 18:58:40','17619'),(9,'Some post content body','public','2021-09-17 18:58:40','17619');
/*!40000 ALTER TABLE `posts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `programs`
--

LOCK TABLES `programs` WRITE;
/*!40000 ALTER TABLE `programs` DISABLE KEYS */;
INSERT INTO `programs` VALUES (1,'BSCS'),(2,'BSACF'),(3,'MSCS'),(4,'BBA'),(5,'BSSS'),(6,'BSECO'),(7,'BSEM');
/*!40000 ALTER TABLE `programs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `reaction_types`
--

LOCK TABLES `reaction_types` WRITE;
/*!40000 ALTER TABLE `reaction_types` DISABLE KEYS */;
INSERT INTO `reaction_types` VALUES (1,'Laugh'),(2,'Sad'),(3,'Angry'),(4,'Like'),(5,'Love'),(6,'Care');
/*!40000 ALTER TABLE `reaction_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `saved_activities`
--

LOCK TABLES `saved_activities` WRITE;
/*!40000 ALTER TABLE `saved_activities` DISABLE KEYS */;
INSERT INTO `saved_activities` VALUES ('17855',1,'2021-09-17 15:53:40'),('17855',3,'2021-09-17 15:53:40');
/*!40000 ALTER TABLE `saved_activities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `student_connections`
--

LOCK TABLES `student_connections` WRITE;
/*!40000 ALTER TABLE `student_connections` DISABLE KEYS */;
INSERT INTO `student_connections` VALUES (5,'17855','15030','request_pending','2021-10-04 17:24:40',NULL,'15030','17855'),(6,'15030','17619','friends','2021-10-10 18:38:15','2021-10-10 18:38:15','15030','17619'),(9,'17847','17855','request_pending','2022-05-10 19:40:00',NULL,'17847','17855');
/*!40000 ALTER TABLE `student_connections` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `student_statuses`
--

LOCK TABLES `student_statuses` WRITE;
/*!40000 ALTER TABLE `student_statuses` DISABLE KEYS */;
INSERT INTO `student_statuses` VALUES (1,'Looking for a friend'),(2,'Looking for transport');
/*!40000 ALTER TABLE `student_statuses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `students`
--

LOCK TABLES `students` WRITE;
/*!40000 ALTER TABLE `students` DISABLE KEYS */;
INSERT INTO `students` VALUES ('15030','Mohammad Rafay','Siddiqui','male','+923009999999','rafaysiddiqui58@gmail.com','1999-09-18','$2a$08$rN26l6b2CRlSxp0jvCf/4u4WXJ85upOty4t73LR2b419wu/5.22ga','https://i.pinimg.com/564x/8d/e3/89/8de389c84e919d3577f47118e2627d95.jpg',2022,'m.rafay.15030@iba.khi.edu.pk',1,2,3,1,2,3,1,1,'CED','Lifting',1,1,'admin'),('17619','Test','User','male','+923009999999','testuser3@gmail.com','1999-09-18','$2a$08$rN26l6b2CRlSxp0jvCf/4u4WXJ85upOty4t73LR2b419wu/5.22ga','https://i.pinimg.com/564x/8d/e3/89/8de389c84e919d3577f47118e2627d95.jpg',2022,'test.user.17619@iba.khi.edu.pk',1,2,3,1,2,3,1,1,'CED','Lifting',1,1,'api_user'),('17847','Bakhtawar','Sharif','female','+923009999999',NULL,'1999-05-31','$2a$08$tW3gAJcox/aE33Sjc4KsDehde33eOJ7X1t0t0cpWGNDxOLfULeZsi','https://i.pinimg.com/564x/8d/e3/89/8de389c84e919d3577f47118e2627d95.jpg',2022,'b.sharif.17847@iba.khi.edu.pk',NULL,NULL,NULL,NULL,NULL,NULL,4,1,NULL,NULL,NULL,1,'api_user'),('17855','Abdur Rafay','Saleem','male','+923009999999','arafaysaleem@gmail.com','1999-09-18','$2a$08$GOxUY8wR5qIE.fA.q9DdVuyLrdQYLHUFcmt1ibwNeXmIsJvgefwWu','https://i.pinimg.com/564x/8d/e3/89/8de389c84e919d3577f47118e2627d95.jpg',2022,'a.rafay.17855@iba.khi.edu.pk',1,2,3,1,2,3,1,1,'CED','Lifting',1,1,'api_user');
/*!40000 ALTER TABLE `students` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `subjects`
--

LOCK TABLES `subjects` WRITE;
/*!40000 ALTER TABLE `subjects` DISABLE KEYS */;
INSERT INTO `subjects` VALUES ('',''),('CSE452','Data Warehousing'),('CSE555','Data Structures'),('FIN201','Introduction to Business Finance'),('HUM201','Speech Communication'),('MKT201','Principles of Marketing'),('MTS101','Calculus 1'),('MTS232','Calculus 2'),('SCI102','Physics');
/*!40000 ALTER TABLE `subjects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `teacher_reviews`
--

LOCK TABLES `teacher_reviews` WRITE;
/*!40000 ALTER TABLE `teacher_reviews` DISABLE KEYS */;
INSERT INTO `teacher_reviews` VALUES (1,3,4,3,5,3.800,'Overall amazing teacher. Worth it!','2021-11-22 21:20:40','MKT201',2,'17855'),(2,5,5,5,5,5.000,'Overall amazing teacher. Worth it!','2021-11-22 21:20:40','FIN201',1,'17855'),(3,3,4,4,2,3.300,'Not worth it. Poor experience','2021-11-22 21:20:40','MKT201',2,'15030');
/*!40000 ALTER TABLE `teacher_reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `teachers`
--

LOCK TABLES `teachers` WRITE;
/*!40000 ALTER TABLE `teachers` DISABLE KEYS */;
INSERT INTO `teachers` VALUES (1,'Waseem Arain',5.000,1),(2,'Faisal Iradat',3.600,2),(4,'Anwar-Ul-Haq',0.000,0),(5,'Imran Khan',0.000,0);
/*!40000 ALTER TABLE `teachers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `terms`
--

LOCK TABLES `terms` WRITE;
/*!40000 ALTER TABLE `terms` DISABLE KEYS */;
INSERT INTO `terms` VALUES (1,'Fall 2021'),(2,'Spring 2021'),(3,'Fall 2020'),(4,'Spring 2020'),(5,'Summer 2020');
/*!40000 ALTER TABLE `terms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `timeslots`
--

LOCK TABLES `timeslots` WRITE;
/*!40000 ALTER TABLE `timeslots` DISABLE KEYS */;
INSERT INTO `timeslots` VALUES ('08:30:00',1,'09:45:00',1),('10:00:00',2,'11:15:00',2),('11:30:00',3,'12:45:00',3),('13:00:00',4,'14:15:00',4),('14:30:00',5,'15:45:00',5),('16:00:00',6,'17:15:00',6),('17:30:00',7,'18:45:00',7);
/*!40000 ALTER TABLE `timeslots` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `timetable_classes`
--

LOCK TABLES `timetable_classes` WRITE;
/*!40000 ALTER TABLE `timetable_classes` DISABLE KEYS */;
INSERT INTO `timetable_classes` VALUES (1,'5755'),(1,'5756'),(1,'5757'),(1,'5758'),(1,'5760'),(2,'5755'),(2,'5756'),(2,'5757'),(2,'5759'),(5,'5755'),(5,'5756'),(5,'5757'),(5,'5759');
/*!40000 ALTER TABLE `timetable_classes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `timetable_share_rooms`
--

LOCK TABLES `timetable_share_rooms` WRITE;
/*!40000 ALTER TABLE `timetable_share_rooms` DISABLE KEYS */;
/*!40000 ALTER TABLE `timetable_share_rooms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `timetables`
--

LOCK TABLES `timetables` WRITE;
/*!40000 ALTER TABLE `timetables` DISABLE KEYS */;
INSERT INTO `timetables` VALUES (1,'17855',1,1),(2,'17855',1,0),(5,'15030',2,0);
/*!40000 ALTER TABLE `timetables` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `tsr_members`
--

LOCK TABLES `tsr_members` WRITE;
/*!40000 ALTER TABLE `tsr_members` DISABLE KEYS */;
/*!40000 ALTER TABLE `tsr_members` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2022-05-10 20:28:50
