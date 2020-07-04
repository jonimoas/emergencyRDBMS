# emergencyRDBMS
 
Small RDBMS consisting of a frontend and backend, assuming that they are hosted on the same server.
Each database connection gets a unique session ID which gets destroyed on logout. 
From the UI, the user can perform basic selects, joins and write sql queries to be performed.

The following libraries were used:

SequelizeORM   - https://sequelize.org/
ExpressJS      - https://expressjs.com/
sequelize-auto - https://github.com/sequelize/sequelize-auto
Vuecidity      - https://vuecidity.wemakesites.net/
