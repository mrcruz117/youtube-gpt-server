require("dotenv").config();
const ytdl = require("ytdl-core");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");

async function downloadAudioFiles(link) {
  try {
    if (!link) throw new Error("No link provided");

    console.log('running getInfo')
    const info = await ytdl.getInfo(link);

    // console.log("info: ", info.formats);
    const audio = ytdl.chooseFormat(info.formats, {
      itag: 140,
    });

    console.log("AUDIO: ", audio);

    const fileName = `${info.videoDetails.title.replace(
      /[^a-z0-9]/gi,
      "_"
    )}.mp3`;

    let currentIndex = 0;
    const duration = 300;
    const outputDir = "./output/";

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }

    const processAudio = (time) => {
      return new Promise((resolve, reject) => {
        currentIndex += 1;
        const outputName = `${outputDir}${fileName}_${currentIndex}.mp3`;

        ffmpeg(audio.url)
          .inputOptions("-ss", time.toString())
          .duration(duration)
          .audioCodec("libmp3lame")
          .toFormat("mp3")
          .on("error", (error) => {
            console.log(error);
            reject(error);
          })
          .save(outputName)
          .on("end", () => {
            console.log(`Finished chunk ${currentIndex}`);
            resolve();
          });
      });
    };

    let time = 0;
    while (time < parseInt(info.videoDetails.lengthSeconds)) {
      await processAudio(time);
      time += duration;
    }
  } catch (error) {
    console.log(error);
  }
}

module.exports = { downloadAudioFiles };
