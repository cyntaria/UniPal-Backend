DBNAME=unipal_db
TESTDBNAME=unipal_test_db
DBUSER=root
TEMP_FILE_PATH='drop_all_tables.sql'

read -sp "Enter password for ${DBUSER} user: " DBPASS

echo
echo "======= STARTING TEST DB DROP ======="

echo
echo "Dropping all tables for TEST database"

echo "SET FOREIGN_KEY_CHECKS = 0;" > $TEMP_FILE_PATH
( mysqldump --add-drop-table --no-data --user=$DBUSER --password=$DBPASS $TESTDBNAME | findstr "DROP" ) >> $TEMP_FILE_PATH
echo "SET FOREIGN_KEY_CHECKS = 1;" >> $TEMP_FILE_PATH
mysql --user=$DBUSER --password=$DBPASS $TESTDBNAME < $TEMP_FILE_PATH
del $TEMP_FILE_PATH

echo "========== DROP COMPLETE =========="
echo
echo "======= STARTING TEST DB INIT ======="

echo
echo "Loading (FULL SQL) for TEST database"
mysql --user=$DBUSER --password=$DBPASS --database=$TESTDBNAME --init-command="SET SESSION FOREIGN_KEY_CHECKS=0;" < "backups/${DBNAME}.sql"

echo
echo "========== INIT COMPLETE =========="
read