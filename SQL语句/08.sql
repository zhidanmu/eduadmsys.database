SELECT Student.Sno,Sname,Cno,Grade
FROM student
LEFT OUTER JOIN SC ON 
(Student.Sno=SC.Sno);