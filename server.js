// server.js
require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
const axios = require("axios");
const moment = require("moment");
// const multer = require("multer");

const CronJob = require("cron").CronJob;

const app = express();
http.createServer(app);

//init middleware
app.use(express.json({ extended: false }));
app.use(cors());

app.get("/", (req, res) => res.send("Server Running1"));

// app.use(multer().array("pictures"));

//define routes
app.use("/admin", require("./routes/admin"));
app.use("/auth", require("./routes/auth"));
app.use("/author", require("./routes/author"));
app.use("/banner", require("./routes/banner"));
// app.use("/book", require("./routes/book"));
app.use("/category", require("./routes/category"));
app.use("/content", require("./routes/content"));
app.use("/home", require("./routes/home"));
app.use("/librarian", require("./routes/librarian"));
app.use("/library", require("./routes/library"));
app.use("/material", require("./routes/material"));
app.use("/notification", require("./routes/notification"));
app.use("/order", require("./routes/order"));
app.use("/payments", require("./routes/payments"));
app.use("/plan", require("./routes/plan"));
app.use("/product", require("./routes/product"));
app.use("/query", require("./routes/query"));
app.use("/sales", require("./routes/sales"));
app.use("/user", require("./routes/user"));

// app.use(express.static(require("path").join(__dirname, "/uploads")));

mongoose
  .connect("mongodb+srv://mlb:mfbN2H9ldlEtpoOk@cluster0.k2k69pk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    // useFindAndModify: false,
  })
  .then((result) => {
    const port = process.env.PORT || 5002;
    app.listen(port);
    console.log(`Connected to PORT ${port} `);
  })
  .catch((err) => {
    console.log(err);
  });

//   mongoose.connect("mongodb://mlb:HQR09yOle9zxf7BS@ac-ymuavmm-shard-00-00.k2k69pk.mongodb.net:27017,ac-ymuavmm-shard-00-01.k2k69pk.mongodb.net:27017,ac-ymuavmm-shard-00-02.k2k69pk.mongodb.net:27017/?authSource=admin&replicaSet=atlas-urxcpl-shard-0&retryWrites=true&w=majority&ssl=true", {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// });
