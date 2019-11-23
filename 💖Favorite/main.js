let app = require('./scripts/app')
let update = require('./scripts/update')
app.init()

update.checkForUpdates()