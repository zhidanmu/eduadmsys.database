SELECT Sname,Sage FROM Student
WHERE Sage<ALL(
	SELECT Sage FROM Student
    WHERE Sdept='CS')
AND Sdept<>'CS';