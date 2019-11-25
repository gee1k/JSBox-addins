const util = require('./util')
let settings = require('./settings')
let _settingsConfig = $file.read('settings.json')
const $SETTINGS = JSON.parse(_settingsConfig.string)

let COLORS = $SETTINGS.colors.light
// 当允许环境为今日小组件并且系统为暗色模式时，文字颜色才采取暗色模式配置
// 否则在 JSBOX 应用内使用暗色模式配置将会看不清
if ($app.env === $env.today && $device.isDarkMode) {
  COLORS = $SETTINGS.colors.dark
}

const defaultImage = "assets/logo.png"

// 读取配置缓存
let config = getData()
// 上一次的 config
let _lastConfig = config

// 请勿修改的变量
let lastDate

const screen = $device.info["screen"]

function init() {
  render()
  
  initData()

  $timer.schedule({
    interval: 10,
    handler: function() {
      refreshTime()
      refreshBattery()
    }
  });
}

function render () {

  let imageWidth = 80
  let imageHeight = 60

  $ui.render({
    props: {
      title: "💖Favorite",
      navButtons: [
        {
          icon: "002",
          handler: function() {
            settings.runSettings(refreshUI)
          }
        }
      ]
    },
    events: {
      // 界面加载后
      appeared: function() {
        initData()
      }
    },
    views: [
      {
        type: "view",
        props: {
          id: "superView"
        },
        layout: function(make, view) {
          make.left.right.inset(0)
          make.height.equalTo(220)
        },
        views: [
          // 图片
          {
            type: "image",
            props: {
              id: "image",
              image: config.image || $data({ path: defaultImage }).image,
              radius: 10,
              contentMode: $contentMode.scaleAspectFill
            },
            layout: function(make, view) {
              make.top.equalTo(10)
              make.left.equalTo(10)
              make.size.equalTo($size(imageWidth, imageHeight))
            }
          },
          // 时间日期、纪念日 部分
          {
            type: "view",
            layout: function(make, view) {
              make.top.equalTo(10)
              make.left.equalTo(imageWidth + 20)
              make.height.equalTo(imageHeight)
              make.right.inset(15)
            },
            views: [
              // 第一行：时间、星期、农历开始
              {
                type: "label",
                props: {
                  id: "today-label",
                  text: "今天是",
                  align: $align.left,
                  font: $font("GillSans", 14),
                  textColor: $color(COLORS.timeLabel)
                },
                layout: function(make, view) {
                  make.top.equalTo(0)
                }
              },
              {
                type: "label",
                props: {
                  id: "year",
                  align: $align.left,
                  font: $font("GillSans-Italic", 13),
                  textColor: $color(COLORS.time)
                },
                layout: function(make, view) {
                  make.left.equalTo($("today-label").right)
                }
              },
              {
                type: "label",
                props: {
                  id: "year-label",
                  text: "年",
                  align: $align.left,
                  font: $font("GillSans", 14),
                  textColor: $color(COLORS.timeLabel)
                },
                layout: function(make, view) {
                  make.left.equalTo($("year").right)
                }
              },
              {
                type: "label",
                props: {
                  id: "month",
                  align: $align.left,
                  font: $font("GillSans-Italic", 13),
                  textColor: $color(COLORS.time)
                },
                layout: function(make, view) {
                  make.left.equalTo($("year-label").right)
                }
              },
              {
                type: "label",
                props: {
                  id: "month-label",
                  text: "月",
                  align: $align.left,
                  font: $font("GillSans", 14),
                  textColor: $color(COLORS.timeLabel)
                },
                layout: function(make, view) {
                  make.left.equalTo($("month").right)
                }
              },
              {
                type: "label",
                props: {
                  id: "day",
                  align: $align.left,
                  font: $font("GillSans-Italic", 13),
                  textColor: $color(COLORS.time)
                },
                layout: function(make, view) {
                  make.left.equalTo($("month-label").right)
                }
              },
              {
                type: "label",
                props: {
                  id: "day-label",
                  text: "日",
                  align: $align.left,
                  font: $font("GillSans", 14),
                  textColor: $color(COLORS.timeLabel)
                },
                layout: function(make, view) {
                  make.left.equalTo($("day").right)
                }
              },
              // 星期
              {
                type: "label",
                props: {
                  id: "dayOfWeek",
                  align: $align.left,
                  font: $font("GillSans", 13),
                  textColor: $color(COLORS.dayOfWeek),
                  autoFontSize: true
                },
                layout: function(make, view) {
                  make.width.equalTo(screen.width * 0.14)
                  make.left.equalTo($("day-label").right).offset(10)
                }
              },
              // 农历
              {
                type: "label",
                props: {
                  id: "lunar",
                  align: $align.left,
                  font: $font("GillSans", 13),
                  textColor: $color(COLORS.lunar),
                  autoFontSize: true
                },
                layout: function(make, view) {
                  make.width.equalTo(screen.width * 0.13)
                  // make.left.equalTo($("dayOfWeek").right).offset(15)
                  make.right.inset(0)
                }
              },
              // 第一行：时间、星期、农历结束
              // 第二行：纪念日信息
              {
                type: "label",
                props: {
                  id: "commemorationDayText",
                  text: config.commemorationDayText,
                  align: $align.left,
                  font: $font("GillSans-Bold", 16),
                  textColor: $color(COLORS.commemorationDayText),
                  autoFontSize: true
                },
                layout: function(make, view) {
                  make.width.equalTo(screen.width * 0.7)
                  make.bottom.inset(10)
                }
              },
              {
                type: "label",
                props: {
                  id: "commemorationDay",
                  align: $align.left,
                  font: $font("GillSans-BoldItalic", 24),
                  textColor: $color(COLORS.commemorationDay),
                  autoFontSize: true
                },
                layout: function(make, view) {
                  make.bottom.inset(5)
                  make.right.inset(0)
                }
              }
              // 第二行：纪念日信息结束
            ]
          },
          {
            type: "view",
            layout: function(make, view) {
              make.top.inset(imageHeight + 20)
              make.left.inset(10)
              make.right.inset(15)
            },
            views: [
              // 温度
              {
                type: "label",
                props: {
                  id: "tmp",
                  align: $align.left,
                  font: $font("PingFangSC", 13),
                  textColor: $color(COLORS.tmp),
                  autoFontSize: true
                },
                layout: function(make, view) {
                  make.width.equalTo(screen.width * 0.08)
                }
              },
              // 天气图标
              {
                type: "image",
                props: {
                  id: "weather-icon",
                  contentMode: $contentMode.scaleAspectFit
                },
                layout: function(make, view) {
                  let size = screen.width * 0.05
                  make.size.equalTo($size(size, size))
                  make.bottom.inset(-(size * (400 / screen.width)))
                  make.left.equalTo($("tmp").right)
                }
              },
              // 风向、空气质量
              {
                type: "label",
                props: {
                  id: "wind_air",
                  align: $align.left,
                  font: $font("PingFangSC", 13),
                  textColor: $color(COLORS.air),
                  autoFontSize: true
                },
                layout: function(make, view) {
                  make.width.equalTo(screen.width * 0.45)
                  make.left.equalTo($("weather-icon").right).offset(5)
                }
              },
              {
                type: "view",
                layout: function(make, view){
                  make.right.inset(0)
                },
                views: [
                  // 电池状态
                  {
                    type: "label",
                    props: {
                      id: "betteryState",
                      align: $align.left,
                      font: $font("PingFangSC-Regular", 13),
                      textColor: $color(COLORS.betteryState),
                      autoFontSize: true
                    },
                    layout: function(make, view) {
                      make.width.equalTo(screen.width * 0.13)
                      make.right.inset(35)
                    }
                  },
                  //电量
                  {
                    type: "label",
                    props: {
                      id: "betteryLevel",
                      align: $align.left,
                      font: $font("PingFangSC-Semibold", 14),
                      autoFontSize: true
                    },
                    layout: function(make, view) {
                      make.width.equalTo(screen.width * 0.10)
                      make.left.equalTo($("betteryState").right)
                    }
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  })
}

/**
 * 获取缓存配置
 */
function getData() {
  let data = $cache.get("data")
  return Object.assign({
    commemorationDayText: "uPic 诞生 🤓",
    commemorationDate: "2019-06-08",
    heweatherKey: ""
  }, data)
}

/**
 * 检查配置是否变化，变化即更新视图
 */
function refreshUI() {
  let tmp = getData()
  if (tmp === _lastConfig) {
    return
  }
  config = tmp

  util.setValue('image', 'image', config.image || $data({ path: defaultImage }).image)

  util.setValue('commemorationDayText', 'text', config.commemorationDayText)

  if (config.commemorationDate !== _lastConfig.commemorationDate) {
    refreshCommemorationDay()
  }
  
  if (config.heweatherKey !== _lastConfig.heweatherKey) {
    refreshWeather()
  }
  

  _lastConfig = config
}

/**
 * 更新时间日期、纪念日天数
 */
function refreshTime() {
  let date = new Date()
  let year = date.getFullYear()
  let month = date.getMonth() + 1
  let day = date.getDate()

  // 判断日期是否改变
  if (lastDate !== day) {
    util.setValue('year', 'text', year)
    util.setValue('month', 'text', month)
    util.setValue('day', 'text', day)

    // 星期数
    let dayStr = '星期'+'日一二三四五六'.charAt(date.getDay())
    util.setValue('dayOfWeek', 'text', dayStr)

    $http.get({
      url: "https://www.sojson.com/open/api/lunar/json.shtml",
      handler: function(resp) {
        let res = resp.data
        if (res.status !== 200) {
          console.info('Error -> ', res.message)
          return
        }
        let data = res.data
        util.setValue('lunar', 'text', `${data.cnmonth}月${data.cnday}`)
      }
    })

    refreshCommemorationDay()    
  }
  
  lastDate = day
}

/**
 * 刷新纪念日天数
 */
function refreshCommemorationDay() {
  let date = new Date()
  date.setHours(0,0,0,0)
  let d2 = new Date(config.commemorationDate)
  d2.setHours(0,0,0,0)
  // 纪念天数
  let commemorationDay = Math.abs(Math.floor((date - d2) / 1000 / 60 / 60 / 24))
  util.setValue('commemorationDay', 'text', `${commemorationDay}天`)
}

/**
 * 更新天气、空气质量
 */
function refreshWeather() {
  renderWeather()
  renderWindAir()

  // 天气
  $http.get({
    url: `https://free-api.heweather.net/s6/weather/now?location=auto_ip&key=${config.heweatherKey}`,
    handler: function(resp) {
      let res = resp.data
      let data = res['HeWeather6'][0]
      if (data.status !== 'ok' || !data.now) {
        return
      }
      $cache.set("last_weather", data.now)
      renderWeather()
    }
  })

  // 空气质量
  $http.get({
    url: `https://free-api.heweather.net/s6/air/now?location=auto_ip&key=${config.heweatherKey}`,
    handler: function(resp) {
      let res = resp.data
      let data = res['HeWeather6'][0]
      if (data.status !== 'ok' || !data.air_now_city) {
        return
      }
      $cache.set("last_air", data.air_now_city)
      renderWindAir()
    }
  })
}

function renderWeather() {
  let weather = $cache.get("last_weather")
  if (weather) {
    util.setValue('tmp', 'text', `${weather.tmp}°C`)
    util.setValue('weather-icon', 'src', `assets/weather/${weather.cond_code}.png`)
  }
}

function renderWindAir() {
  let str = ""
  let weather = $cache.get("last_weather")
  if (weather) {
    str += `${weather.wind_dir}  `
  }
  let air = $cache.get("last_air")
  if (air) {
    str += `${air.qlty} | AQI: ${air.aqi} | PM2.5: ${air.pm25}`
  }
  util.setValue('wind_air', 'text', str)
}

/**
 * 更新电池信息
 */
function refreshBattery() {
  let batteryInfo = $device.info['battery']

  let betteryState = ''
  switch(batteryInfo.state) {
    case 3:
        betteryState = '已充满'
        break
    case 2:
        betteryState = '正在充电'
        break
    case 1:
        betteryState = '正在放电'
        break
    default:
        betteryState = '未知'
  }
  let batteryPower = COLORS.batteryPower

  let betteryLevel = Math.round(batteryInfo.level * 100)
  let batteryColor = batteryPower.high
  // 判断是否是充电状态。state 为 2 时表示充电中
  if (batteryInfo.state !== 2) {
    if (betteryLevel <= 20) {
      batteryColor = batteryPower.low
    } else if (betteryLevel < 50) {
      batteryColor = $app.env === $env.today ? batteryPower.medium : 'black'
    }
  }

  util.setValue('betteryState', 'text', `${betteryState}: `)
  util.setValue('betteryLevel', 'text', `${betteryLevel}%`)
  util.setValue('betteryLevel', 'textColor', $color(batteryColor))
}

function initData() {
  // 初始化信息
  refreshTime()
  refreshWeather() 
  refreshBattery()
}

module.exports = {
  init: init 
}