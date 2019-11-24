let app = require('./scripts/app')
let update = require('./scripts/update')
app.init()
if ($app.env === $env.app) {
  update.checkUpdate()
}