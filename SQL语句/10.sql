SELECT Student.Sno,Sname,AVG(Grade)
FROM student,SC
WHERE student.Sno=SC.Sno
GROUP BY Sno
HAVING Count(Cno)=5;