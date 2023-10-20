SELECT Student.Sno,Sname,Course.Cno,Cname,Grade,TP.ranks 
FROM Student,Course,
(SELECT SC.*,RANK() OVER(
PARTITION BY Cno ORDER BY Grade DESC) 
ranks FROM SC)AS TP
WHERE TP.Sno=Student.Sno AND TP.Cno=Course.Cno;