require("dotenv").config();
const FormData = require("form-data");
const fs = require("fs");
const axios = require("axios");
const path = require("path");

const ytdl = require("ytdl-core");
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function getYoutubeAudio(link) {
  //   let info = await ytdl.getInfo(link);
  //   let audioFormats = ytdl.filterFormats(info.formats, "audioonly");

  //   console.log("Formats with only audio: " + audioFormats.length);
  const audioFile = ytdl(link, { filter: "audioonly" }).pipe(
    fs.createWriteStream("audio.mp4")
  );

  console.log("audioFile", audioFormats);
}

module.exports = { getYoutubeAudio };
