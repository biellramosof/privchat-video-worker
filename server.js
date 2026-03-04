import express from "express"
import { exec } from "child_process"
import fs from "fs"
import fetch from "node-fetch"

const app = express()
app.use(express.json())

const SECRET = process.env.VIDEO_WORKER_SECRET

app.post("/process", async (req, res) => {
  try {

    const { videoUrl } = req.body

    const inputFile = `input-${Date.now()}.mov`
    const outputFile = `output-${Date.now()}.mp4`

    const response = await fetch(videoUrl)
    const buffer = await response.arrayBuffer()

    fs.writeFileSync(inputFile, Buffer.from(buffer))

    const cmd = `
    ffmpeg -i ${inputFile} -vcodec libx264 -acodec aac -preset fast -crf 23 -movflags +faststart ${outputFile}
    `

    exec(cmd, (err) => {

      if (err) {
        console.error(err)
        return res.status(500).send("conversion failed")
      }

      res.send({
        status: "ok",
        file: outputFile
      })

    })

  } catch (e) {

    console.error(e)
    res.status(500).send("worker error")

  }
})

app.listen(3000, () => {
  console.log("PrivChat video worker running")
})
