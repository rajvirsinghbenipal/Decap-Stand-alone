// This loads your .env file secrets
require("dotenv").config();

const express = require("express");
const path = require("path");
const apiHandler = require("./api/github.js");

const app = express();
const port = 3000;

// This middleware correctly handles the data for publishing
app.use(express.json());

// This tells Express to use your github.js code for any /api/github requests
app.use("/api/github", apiHandler);

// This tells Express to serve your website's files from the 'public' folder
app.use(express.static(path.join(__dirname, "public")));

// This handles page reloads in the CMS
app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(port, () => {
  console.log(`✅ Server is working! Listening at http://localhost:${port}`);
});
