### Activities API

- add activity_title
- change additional_directions to additional_instructions

### Students API

- add friend_request field on GET student, where it can be:

    - null (if stranger)
    - {
        student_connection_id: 1,
        sender_erp: XXXXX,
        receiver_erp: XXXXX,
        sent_at: '',
        accepted_at: '',
        connection_status: 'friends',
      }

    - we can then simply check the friend request on front end to ensure status
        - if null -> display send request option
        - if !null and is_accepted -> display unfriend option
        - if !null && !is_accepted && sender_erp === erp -> display friend request sent
        - if !null && !is_accepted && receiver_erp === erp -> display friend request received