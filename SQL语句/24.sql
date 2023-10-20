SELECT Student.Sno,Sname,Cname,Grade
FROM Student,SC,Course,
(SELECT Sno,MAX(Grade) FROM SC
GROUP BY Sno HAVING AVG(Grade) > 80 )
AS mxg(mxgsno,mxgrade)
WHERE Student.Sno=SC.Sno AND  Course.Cno=SC.Cno
AND Student.Sno=mxg.mxgsno AND Grade=mxg.mxgrade;
