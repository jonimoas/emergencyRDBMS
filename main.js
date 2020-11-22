//libs
var express = require("express");
var sql = require("sequelize");
var sqla = require("sequelize-auto");
var db = [];
var cors = require("cors");
var exec = require("child_process").exec;
const bodyParser = require("body-parser");

//inits
const app = express();
const port = process.env["PORT"] ? process.env["PORT"] : 80;
const ext_port = process.env["EXT_PORT"] ? process.env["EXT_PORT"] : 80;
const options = {
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "X-Access-Token",
  ],
  credentials: true,
  methods: "GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE",
  origin: "*",
  preflightContinue: false,
};

app.use(cors(options));
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

//ui stuff
child = exec("npm run build").stderr.pipe(process.stderr);
app.use("/", (req, res, next) => {
  res.cookie("rdbmsport", ext_port);
  next();
});
app.use("/", express.static("dist"));
app.use("/js", express.static("dist/js"));
app.use("/css", express.static("dist/css"));

//db stuff
app.get("/api/createSession", async function(req, res, next) {
  try {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    let auto;
    let thisdb = new sql(req.query.db, req.query.user, req.query.password, {
      dialect: req.query.dialect,
      host: req.query.host,
      port: req.query.port,
    });
    auto = new sqla(req.query.db, req.query.user, req.query.password, {
      host: req.query.host,
      dialect: req.query.dialect,
      port: req.query.port,
      directory: false,
    });
    auto.run(async function(err) {
      if (err) throw err;
      let sessionid =
        "_" +
        Math.random()
          .toString(36)
          .substr(2, 9);
      db.push({
        db: thisdb,
        session: sessionid,
        tables: auto.tables,
        keys: auto.foreignKeys,
        time: new Date().getTime(),
      });
      console.log("new session: " + sessionid);
      res.send({
        tables: auto.tables,
        session: sessionid,
        keys: auto.foreignKeys,
      });
    });
  } catch (e) {
    res.send(400);
  }
});
app.get("/api/getTable", async function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  let thisdb = db.find((r) => r.session == req.query.session);
  if (thisdb == undefined) {
    res.send({ status: 404 });
    return;
  }
  thisdb.time = new Date().getTime();
  res.send((await thisdb.db.query("select * from " + req.query.table))[0]);
});
app.post("/api/runQuery", async function(req, res, next) {
  try {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    console.log(req.body);
    let thisdb = db.find((r) => r.session == req.body.session);
    if (thisdb == undefined) {
      res.send({ status: 404 });
      return;
    }
    thisdb.time = new Date().getTime();
    res.send((await thisdb.db.query(req.body.query))[0]);
  } catch (e) {
    res.send({ exception: e });
  }
});
app.get("/api/endSession", async function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  await closeConnection(req.query.session);
  res.send({ status: 200 });
});

//helper functions
setInterval(() => checkExpired(), 10 * 60 * 1000);
async function checkExpired() {
  for (const d of db) {
    if (new Date().getTime() - 10 * 60 * 1000 > d.time) {
      await closeConnection(d.session);
    }
  }
}
async function closeConnection(session) {
  let thisdb = db.find((r) => r.session == session);
  await thisdb.db.close();
  console.log("Session Ended: " + session);
  db = db.filter((r) => r.session != session);
}
app.listen(port, () => console.log(`RDBMS BACKEND ON ${port}!`));
