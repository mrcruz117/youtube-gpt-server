const express = require("express");
const cors = require("cors");
const multer = require("multer");
// const formidable = require("formidable");
// var bodyParser = require("body-parser");
const multipart = require("connect-multiparty");
const { getYoutubeAudio } = require("./functions/getYoutubeAudio");
const multipartMiddleware = multipart();
const app = express();
const upload = multer();

const PORT = 8889;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "no message" });
});

app.get("/audio-file", (req, res) => {
  const { link } = req.query;
  console.log("req.query: ", req.query);
  console.log("req.body: ", req.body);
  if (!link) {
    res.status(400).json({ message: "No link provided" });
  }

  const audioFileRes = getYoutubeAudio(link);

  res.json({ message: "Hello from server!" });
});

// part multipart/form-data
// app.use(upload.array("files"));
// app.use(express.static("public"));

// app.post("/upload", multipartMiddleware, async (req, res) => {
//   console.log("req.body: ", req.body);
//   console.log("req.files: ", req.files);
//   //   console.log("req: ", req);
//   await uploadFilesToBlobStorage(req.files, req.body).catch((err) => {
//     console.error("Error occurred:", err);
//   });

//   res.json({ message: "uploaded" });
// });

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}.`);
});
