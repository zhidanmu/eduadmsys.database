SELECT Sno,Cno FROM SC x
WHERE Grade >
(SELECT AVG(Grade) 
FROM SC y
WHERE x.Sno=y.Sno);