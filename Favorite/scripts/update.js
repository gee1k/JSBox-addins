let ui = require('./ui')

let appInfo = $file.exists("app.json") ? JSON.parse($file.read("app.json").string) : {}

function getCurVersion() {
  let version = appInfo.version || "0.0.0"
  return version;
}

function getCurBuild() {
  let build = appInfo.build || "0";
  return build;
}

function getCurDate() {
  let date = appInfo.date || "000000";
  return date;
}

function getLatestBuild(now) {
  $http.download({
    url: "https://raw.githubusercontent.com/gee1k/JSBox-addins/master/Favorite/app.json",
    showsProgress: false,
    timeout: 5,
    handler: function(resp) {
      if(resp.data) {
        let appJson = JSON.parse(resp.data.string)
        let updateBuild = parseInt(appJson.build)
        let updateVersion = appJson.version
        let currentBuild = parseInt(getCurBuild())
        console.info(`当前 Build：${currentBuild}`)
        console.info(`最新 Build：${updateBuild}`)
        let force = appJson.force
        if(updateBuild > currentBuild) {
          $http.download({
            url: "https://raw.githubusercontent.com/gee1k/JSBox-addins/master/Favorite/updateDetail.md",
            showsProgress: false,
            timeout: 5,
            handler: function(resp) {
              if(resp.data) {
                sureToUpdate(updateVersion, resp.data.string, force)
              }
            }
          })
        } else {
          if(now && $("superView")) {
            ui.showToastView($("superView"), "blue", "当前版本已是最新")
          }
        }
      }
    }
  })
}

//确定升级？
function sureToUpdate(version, des, force) {
  let actions = (force)?[{
    title: "立即更新",
    handler: function() {
      $ui.popToRoot();
      updateScript()
    }
  }]:[{
    title: "否",
    handler: function() {
      
    }
  },
  {
    title: "是",
    handler: function() {
      $ui.popToRoot();
      updateScript()
    }
  }]
  $ui.alert({
    title: "发现新版本 V" + version,
    message: "\n" + des + "\n\n是否更新？",
    actions: actions
  })
}

function updateScript() {
  let url =
    "https://github.com/gee1k/JSBox-addins/raw/master/Favorite/.output/Favorite.box?raw=true";
  const scriptName = $addin.current.name;
  if($("superView")) {
    ui.addProgressView($("superView"), "开始更新...")
  }
  $http.download({
    url: url,
    showsProgress: false,
    timeout: 5,
    progress: function(bytesWritten, totalBytes) {
      var percentage = bytesWritten * 1.0 / totalBytes
      if($("myProgress")) {
        $("myProgress").locations = [0.0, percentage, percentage]
      }
    },
    handler: function(resp) {
      let box = resp.data
      $addin.save({
        name: scriptName,
        data: box,
        handler: success => {
          if (success) {
            $cache.remove("lastCT")
            $device.taptic(2)
            $delay(0.2, function() {
              $device.taptic(2)
            })
            if($("myProgressText")) {
              $("myProgressText").text = "更新完成"
            }
            $delay(1, ()=>{
              $addin.restart()
            })
          }
        }
      });
    }
  })
}

function needUpdate(nv, ov) {
  let getVersionWeight = i => {
    return i
      .split(".")
      .map(i => i * 1)
      .reduce((s, i) => s * 100 + i);
  };
  return getVersionWeight(nv) > getVersionWeight(ov);
}

function checkUpdate(now) {
  if(needCheckup() || now) {
    getLatestBuild(now)
  }
}

//需要检查更新？
function needCheckup() {
  let nDate = new Date()
  let lastCT = $cache.get("lastCT")
  if (lastCT == undefined) {
    $cache.set("lastCT", nDate)
    return true
  } else {
    let tdoa = (nDate.getTime() - lastCT.getTime()) / (60 * 1000)
    let interval = 1440
    if ($app.env == $env.app) {
      interval = 1
    }
    $console.info("离下次检测更新: " + (interval - tdoa) + "  分钟")
    if (tdoa > interval) {
      $cache.set("lastCT", nDate)
      return true
    } else {
      return false
    }
  }
}

module.exports = {
  checkUpdate: checkUpdate,
  getCurVersion: getCurVersion,
  getCurBuild: getCurBuild,
  getCurDate: getCurDate,
}
