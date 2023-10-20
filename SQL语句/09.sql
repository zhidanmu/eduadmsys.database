SELECT Student.Sno,Sname,Cname,Grade
FROM Student,SC,Course
WHERE student.Sno=SC.Sno
	AND SC.Cno=Course.Cno;