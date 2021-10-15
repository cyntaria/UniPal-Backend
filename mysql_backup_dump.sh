DBNAME=unipal_db
TESTDBNAME=unipal_test_db
DBUSER=root

read -sp "Enter password for ${DBUSER} user: " DBPASS

echo
echo "======= STARTING MAIN DB EXPORT ======="

echo
echo "Dumping (FULL SQL) for MAIN database"
mysqldump --user=$DBUSER --password=$DBPASS --single-transaction $DBNAME > "backups/${DBNAME}.sql"

echo
echo "Dumping (SCHEMA ONLY) for MAIN database"
mysqldump --user=$DBUSER --password=$DBPASS --single-transaction --no-data $DBNAME > "backups/${DBNAME}_schema.sql" # -d also works the same

echo
echo "Dumping (DATA ONLY) for MAIN database"
mysqldump --user=$DBUSER --password=$DBPASS --single-transaction --no-create-info $DBNAME > "backups/${DBNAME}_data.sql" # -t also works the same

echo
echo "========== EXPORT COMPLETE =========="

echo
echo "======= STARTING TEST DB EXPORT ======="

echo
echo "Dumping (FULL SQL) for TEST database"
mysqldump --user=$DBUSER --password=$DBPASS --single-transaction $DBNAME > "backups/${TESTDBNAME}.sql"

echo
echo "Dumping (DATA ONLY) for TEST database"
mysqldump --user=$DBUSER --password=$DBPASS --single-transaction --no-create-info $DBNAME > "backups/${TESTDBNAME}_data.sql" # -t also works the same

echo
echo "========== EXPORT COMPLETE =========="
read