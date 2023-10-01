const util = require('util');
require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const readdir = util.promisify(fs.readdir);
const writeFile = util.promisify(fs.writeFile);

const OPEN_AI_TRANSCRIBE_URL = 'https://api.openai.com/v1/audio/transcriptions';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OUTPUT_DIR = './output';
const TRANSCRIPTS_DIR = './transcripts';

async function transcribeAudio(fileStr) {
  const file = fs.createReadStream(`${fileStr}`);
  console.log('Begin transcription...');
  try {
    const params = {
      file,
      model: 'whisper-1',
      // prompt: "Provide a 1 paragraph summary of the audio. Have the last sentence be a short conclusion in German.",
      // temperature: 0.9,
      // language: "en",
    };

    const headers = {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
    };

    const openai_res = await axios.post(
      OPEN_AI_TRANSCRIBE_URL,
      params,
      headers
    );

    console.log('openai_res.data: ', openai_res.data);
    return openai_res.data.text;
  } catch (error) {
    console.log(
      error.response
        ? `${error.response.status}: ${error.response.statusText}`
        : error.toString()
    );
  }
}

async function transcribeAndConcatAudioFiles() {
  try {
    const files = await readdir(OUTPUT_DIR);
    console.log('files: ', files);

    let transcriptions = '';

    for (const file of files) {
      let transcription = await transcribeAudio(path.join(OUTPUT_DIR, file));
      transcriptions += transcription + ' ';
      // sleeping for a second after each transcribe request to respect Rate Limits
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    console.log('transcriptions: ', transcriptions);

    await writeFile(
      path.join(TRANSCRIPTS_DIR, 'transcriptions.txt'),
      transcriptions.trim()
    );
  } catch (error) {
    console.error(`Error in transcribeAndConcatAudioFiles: ${error}`);
  }

  console.log('Finished transcription!');
}

module.exports = { transcribeAudio, transcribeAndConcatAudioFiles };
