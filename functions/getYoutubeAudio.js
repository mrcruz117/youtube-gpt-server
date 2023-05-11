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
  //   let info = await ytdl.getInfo(link);
  //   let audioFormats = ytdl.filterFormats(info.formats, "audioonly");

  //   console.log("Formats with only audio: " + audioFormats.length);
  const audioFile = await writeToFile(link);
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
//   fs.unlinkSync(filePath);
}

function writeToFile(link) {
  return new Promise((resolve, reject) => {
    // const audioFile = ytdl(link, { filter: "audioonly" })
    const audioFile = ytdl(link, {
      filter: (format) => {
        // console.log("format: ", format);
        return format.container === "mp4" && format.hasVideo === false;
      },
    })
      .pipe(fs.createWriteStream(filePath))
      .on("finish", resolve("complete"));
    console.log("after resolve");
    audioFile.end();
    audioFile.on("finish", () => {
      resolve("complete");
    }); // not sure why you want to pass a boolean
    audioFile.on("error", reject); // don't forget this!
  });
}

module.exports = { getYoutubeAudio };
