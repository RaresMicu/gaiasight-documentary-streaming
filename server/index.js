const express = require("express");
const cors = require("cors");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const authRoute = require("./routes/auth");
const userRoute = require("./routes/users");
const docRoute = require("./routes/documentaries");
const listRoute = require("./routes/lists");
const generatorRoute = require("./routes/generator");

dotenv.config();

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("DB connected");
  })
  .catch((err) => console.log(err));

app.use(cors());

app.use(express.json());

app.use("/api/auth", authRoute);

app.use("/api/users", userRoute);

app.use("/api/documentaries", docRoute);

app.use("/api/lists", listRoute);

app.use("/api/generate-hls", generatorRoute);

app.listen(8800, () => {
  console.log("Server is running.");
});
