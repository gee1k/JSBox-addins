let app = require('./scripts/app')
let update = require('./scripts/update')
// $ui.toast("初始化")
app.init()

if ($app.env === $env.app) {
  $app.tips("请点击右上角设置按钮配置相关信息!")
  update.checkUpdate()
}