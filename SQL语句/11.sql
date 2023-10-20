SELECT Sno,Sname 
FROM Student
WHERE Sdept=
(
	SELECT Sdept FROM Student
	WHERE Sname='刘晨'
);