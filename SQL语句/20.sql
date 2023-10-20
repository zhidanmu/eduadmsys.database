SELECT Sname FROM Student,
(SELECT Sno FROM SC WHERE Cno='1') AS SC1
WHERE Student.Sno=SC1.Sno;
