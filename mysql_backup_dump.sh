DBNAME=unipal_db
TESTDBNAME=unipal_test_db
DBUSER=root

read -sp "Enter password for ${DBUSER} user: " DBPASS


echo "======= STARTING MAIN DB EXPORT ======="

echo "Dumping (FULL SQL) for MAIN database"
mysqldump --opt --user=$DBUSER --password=$DBPASS $DBNAME > backups/$DBNAME.sql

echo "Dumping (SCHEMA ONLY) for MAIN database"
mysqldump --opt --user=$DBUSER --password=$DBPASS --no-data $DBNAME > backups/$DBNAME_schema.sql # -d also works the same

echo "Dumping (DATA ONLY) for MAIN database"
mysqldump --opt --user=$DBUSER --password=$DBPASS --no-create-info $DBNAME > backups/$DBNAME_data.sql # -t also works the same

echo "========== EXPORT COMPLETE =========="\n

echo "======= STARTING TEST DB EXPORT ======="

echo "Dumping (FULL SQL) for TEST database"
mysqldump --opt --user=$DBUSER --password=$DBPASS $DBNAME > backups/$TESTDBNAME.sql

echo "Dumping (DATA ONLY) for TEST database"
mysqldump --opt --user=$DBUSER --password=$DBPASS --no-create-info $DBNAME > backups/$TESTDBNAME_data.sql # -t also works the same

echo "========== EXPORT COMPLETE =========="\n