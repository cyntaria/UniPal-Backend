 <!-- find all -->

SELECT A.activity_id,`title`, SQ.activity_status_id, SQ.reaction_count
FROM activities AS A
LEFT OUTER JOIN (
    SELECT activity_id, activity_status_id, COUNT(activity_status_id) AS reaction_count,
             ROW_NUMBER() OVER (PARTITION BY activity_id ORDER BY reaction_count DESC) as rank
	FROM student_interests
    GROUP BY activity_id, activity_status_id
) AS SQ
ON A.activity_id = SQ.activity_id
WHERE SQ.activity_status_id IS NULL OR SQ.rank <= 3
ORDER BY A.activity_id, SQ.reaction_count DESC;

 <!-- find one -->

SELECT A.activity_id,`title`, SQ.activity_status_id, COUNT(SQ.activity_status_id) AS reaction_count
FROM activities AS A
LEFT OUTER JOIN student_interests AS SQ
ON A.activity_id = SQ.activity_id
WHERE A.activity_id = 2
GROUP BY SQ.activity_status_id
ORDER BY reaction_count DESC
LIMIT 3;