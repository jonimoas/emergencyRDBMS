# emergencyRDBMS
 
Small dockerized web RDBMS consisting of a frontend and backend, hosted on the same server.
Each database connection gets a unique session ID which gets destroyed on logout. 
From the UI, the user can perform basic selects, joins, write sql queries to be performed,
and easy inserts using the foreign keys of each table.

The two docker variables that are required are the PORT which is the port that the container
hosts, and the EXT_PORT which is the port that shows outside, after a possible redirect

![Login](/login.PNG)
![Join](/join.PNG)
![TableView](/tableview.PNG)

The following libraries were used:

SequelizeORM   - https://sequelize.org/
ExpressJS      - https://expressjs.com/
sequelize-auto - https://github.com/sequelize/sequelize-auto
Vuecidity      - https://vuecidity.wemakesites.net/
