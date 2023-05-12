require("dotenv").config();
const FormData = require("form-data");
const fs = require("fs");
const axios = require("axios");
const path = require("path");

const ytdl = require("ytdl-core");
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const filePath = path.join(__dirname, "audio.mp4");
const model = "whisper-1";

async function getYoutubeAudio(link) {
  const audioFile = await writeToFile(link);

  console.log("After writeToFile");

  const stats = fs.statSync(filePath);
  const fileSizeInBytes = stats.size;
  const fileExtension = path.extname(filePath).toLowerCase();

  if (fileExtension !== ".mp4") {
    console.error(`Invalid file extension: ${fileExtension}`);
    return;
  }

  if (fileSizeInBytes > 100 * 1024 * 1024) {
    console.error(`File size is too large: ${fileSizeInBytes} bytes`);
    return;
  }

  console.log("audioFile: ", audioFile);

  // send audio file to openai
  const formData = new FormData();
  formData.append("model", model);
  console.log("filePath: ", filePath);
  formData.append("file", fs.createReadStream(filePath));
  //   return;
  const openaiRes = await axios
    .post("https://api.openai.com/v1/audio/transcriptions", formData, {
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
      },
    })
    .catch((err) => {
      console.log("err: ", err.response.data);
    });

  console.log("openaiRes: ", openaiRes);

  // delete audio file
  fs.unlinkSync(filePath);
}

function writeToFile(link) {
  return new Promise((resolve, reject) => {
    const audioFile = ytdl(link, {
      filter: (format) => {
        return format.container === "mp4" && format.hasVideo === false;
      },
    })
      .pipe(fs.createWriteStream(filePath))
      .on("finish", () => resolve("complete"));
    // console.log("after resolve");
    audioFile.on("error", reject);
  });
}

module.exports = { getYoutubeAudio };
