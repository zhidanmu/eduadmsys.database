SELECT Student.Sno,Sname,Cname,Grade FROM Student,Course,SC
WHERE Student.Sno=SC.Sno AND Course.Cno=SC.Cno 
AND Student.Sno IN
(SELECT DISTINCT Sno FROM SC 
GROUP BY Sno
HAVING AVG(SC.Grade) > 80)
ORDER BY Sno;