SELECT Student.Sno,Sname
FROM Student,SC
WHERE Student.Sno=SC.Sno
	AND SC.Cno='2'
    AND SC.Grade>90;