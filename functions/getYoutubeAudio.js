const ytdl = require('ytdl-core');
const fs = require('fs').promises;
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');

async function downloadAudioFiles(link) {
  try {
    if (!link) throw new Error('No link provided');
    const outputDir = './output/';

    await fs.rmdir(outputDir, { recursive: true });
    console.log('Cleared the content of ./output directory');
    await fs.mkdir(outputDir);
    console.log('Created output directory');

    console.log('running getInfo');
    const info = await ytdl.getInfo(link);
    const audio = ytdl.chooseFormat(info.formats, {
      filter: (format) =>
        format.hasAudio && !format.hasVideo && format.itag === 140,
    });

    console.log('AUDIO: ', audio);

    const fileName = `${info.videoDetails.title.replace(
      /[^a-z0-9]/gi,
      '_'
    )}.mp3`;
    const duration = 120;

    console.log('Processing Audio...');
    const processAudio = async (currentIndex, time) => {
      const outputName = `${outputDir}${currentIndex}_${fileName}.mp3`;

      await new Promise((resolve, reject) => {
        ffmpeg(audio.url)
          .inputOptions('-ss', time.toString())
          .duration(duration)
          .audioCodec('libmp3lame')
          .toFormat('mp3')
          .on('error', reject)
          .on('progress', (progress) => {
            const percentage = Math.floor(progress.percent * 10);

            if (
              percentage % 5 === 0 &&
              percentage !== 0 &&
              percentage !== 100
            ) {
              console.log(`${outputName} progress: ${percentage}%`);
            }
          })
          .on('end', () => {
            console.log(`Finished chunk ${currentIndex}`);
            resolve();
          })
          .save(outputName);
      });
    };

    const totalDuration = parseInt(info.videoDetails.lengthSeconds);
    const chunkCount = Math.ceil(totalDuration / duration);
    const chunkIndexes = Array.from({ length: chunkCount }, (_, i) => i + 1);

    await Promise.all(
      chunkIndexes.map((index) => processAudio(index, (index - 1) * duration))
    );
  } catch (error) {
    console.log(error);
  }
}

module.exports = { downloadAudioFiles };
