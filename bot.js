import http from "http"
import { MongoDb } from "./mango.js"
import { ToadScheduler, SimpleIntervalJob, Task } from "toad-scheduler"
import schedule from "node-schedule"
import dotenv from "dotenv"
import child_process from "child_process"
import { FTX } from "./FTX.js"

/**
 * Load .env file
 */

dotenv.config()
/**
 * Simple HTTP server (so Heroku and other free SaaS will not bother on killing the app on free plans)
 * Can always use something like Kaffeine to keep it alive
 */
;(async () => {
  const key = process.env.KEY
  const secret = process.env.SECRET

  /**
   * MongoDb Integration
   */
  const MONGODB_URI = process.env.MONGODB_URI || null
  const mongoDb = new MongoDb(MONGODB_URI)

  const ftx = new FTX(key, secret)

  const PORT = 1129
  const requestListener = function (req, res) {
    res.writeHead(200)
    res.end("Hello, Traders!")
  }
  const server = http.createServer(requestListener)
  server.listen(PORT)

  async function start() {
    if (!(await ftx.getAccount()).success) errorOut()

    const { exec } = child_process

    exec(
      `notify-send -i ~/Documents/github/binance-dca-bot/btcIcon.png 'Starting FTX DCA'  "${new Date().toLocaleString()}"`,
      (err, stdout, stderr) => {
        if (err) {
          exec(
            `notify-send -u critical "Something went wrong" "Please check your DCA bot"`
          )
          return
        }
      }
    )
    const fearAndGreecdIndex = await ftx.getFearAndGreedIndex()
    const indexValue = 30 / fearAndGreecdIndex.data[0].value
    const balance = await ftx.getBalance()
    let buyValue = balance.free * indexValue
    if (buyValue > balance.free) buyValue = balance.free
    console.log(buyValue)
    const res = await ftx.placeOrder({
      market: "BTC/EUR",
      side: "buy",
      price: null,
      type: "market",
      size: 20,  // unfortunetly i need to find a way to convert EUR amount to btc
      reduceOnly: false,
      ioc: false,
      postOnly: false,
      clientId: null,
    })

    console.log(res)
  }

  function errorOut() {
    const { exec } = child_process

    exec(
      `notify-send -u critical -i ~/Documents/github/binance-dca-bot/btcIcon.png 'FTX DCA' "ERRORED OUT"`,
      (err, stdout, stderr) => {
        if (err) {
          exec(
            `notify-send -u critical "Something went wrong" "Please check your DCA bot"`
          )
          return
        }
      }
    )
    process.exit()
  }

  // const scheduler = new ToadScheduler()

  // const task = new Task("simple task", () => {
  start()
  // })
  // const job = new SimpleIntervalJob({ hours: 1 }, task)
  // scheduler.addSimpleIntervalJob(job)
})()
