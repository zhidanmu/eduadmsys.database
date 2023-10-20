SELECT Sno,Cno FROM SC,
(SELECT Sno,AVG(Grade) FROM SC GROUP BY Sno ) 
AS AVGT(avgSno,avgGrade)
WHERE SC.Sno=AVGT.avgSno AND
SC.Grade > AVGT.avgGrade;