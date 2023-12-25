import ffmpeg from './handlers/ffmpeg.js'

const path = '../video/video1.mp4'
const ex = async (path) => {
    await ffmpeg.convertToHls(path)
}

ex(path)