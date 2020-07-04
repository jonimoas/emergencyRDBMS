var express = require("express");
var sql = require("sequelize");
var sqla = require("sequelize-auto");
var db = [];
var cors = require("cors");
const app = express();
const port = 16000;
const bodyParser = require("body-parser");
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
app.get("/api/createSession", async function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  let auto;
  let tablenames = [];
  let tables = [];
  let thisdb = new sql(req.query.db, req.query.user, req.query.password, {
    dialect: req.query.dialect,
  });
  auto = new sqla(req.query.db, req.query.user, req.query.password, {
    host: req.query.host,
    dialect: req.query.dialect,
    port: req.query.port,
    directory: false,
  });
  auto.run(async function (err) {
    if (err) throw err;
    for (t in auto.tables) {
      tablenames.push(t);
      tables.push(await thisdb.define(auto[t]));
    }
    let sessionid = "_" + Math.random().toString(36).substr(2, 9);
    db.push({ db: thisdb, session: sessionid });
    console.log("new session: " + sessionid);
    res.send({ tables: tablenames, session: sessionid });
  });
});
app.get("/api/getTable", async function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  let thisdb = db.find((r) => r.session == req.query.session).db;
  res.send((await thisdb.query("select * from " + req.query.table))[0]);
});
app.post("/api/runQuery", async function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  console.log(req.body);
  let thisdb = db.find((r) => r.session == req.body.session).db;
  res.send((await thisdb.query(req.body.query))[0]);
});
app.get("/api/endSession", async function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  console.log("Session Ended: " + req.query.session);
  db = db.filter((r) => r.session != req.query.session);
  res.send({ status: 200 });
});
app.listen(port, () => console.log(`RDBMS BACKEND ON ${port}!`));
