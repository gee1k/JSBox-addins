const moment = require('moment')
// 默认配置
const defaultImage = "assets/logo.png"
// 日期选择器默认日期
let defaultPickDate = new Date()

let renderingFailed = false

function runSettings(refreshUI) {

  $ui.toast("加载配置中...", 0.8);

  $ui.push({
    props: {
      title: "设置",
      pageSheet: true,
      navButtons: [
        {
          icon: "027",
          handler: function() {
            clearData(refreshUI)
          }
        }
      ]
    },
    events: {
      appeared: function() {
        if (renderingFailed) {
          renderData()
          renderingFailed = false
        }
      }
    },
    views: [
      {
        type: "view",
        props: {
        },
        layout: $layout.fill,
        views: [
          // 选择图片
          {
            type: "view",
            props: {
              id: "settings_imageView",
              bgcolor: $color("white"),
              radius: 10,
              borderWidth: 0.5,
              borderColor: $color("lightGray"),
              multipleTouchEnabled: false
            },
            layout: function(make, view) {
              make.top.equalTo(50)
              make.size.equalTo($size(150, 112))
              make.centerX.equalTo(view.super)
            },
            events: {
              tapped(sender) {
                blurAllInput()
                $photo.pick({
                  handler: function(resp) {
                    $('settings_image').image = resp.image
                  }
                })
              }
            },
            views: [
              {
                type: "image",
                props: {
                  id: "settings_image",
                  src: defaultImage,
                  contentMode: $contentMode.scaleAspectFill,
                  userInteractionEnabled: false
                },
                layout: function(make, view) {
                  make.size.equalTo(view.super)
                  make.centerX.equalTo(view.super)
                }
              }
            ]
          }
        ]
      },
      {
        type: "input",
        props: {
          id: "settings_commemorationDayText",
          darkKeyboard: true,
          placeholder: "纪念日文本. eg: uPic 诞生 🤓"
        },
        layout: function(make, view) {
          make.left.right.inset(20) 
          make.top.equalTo($("settings_imageView").bottom).offset(20) 
          make.height.equalTo(50)
        },
        events: {
          returned: function(sender) {
            sender.blur()
          }
        }
      },
      {
        type: "button",
        props: {
          id: "settings_commemorationDayButton",
          title: "纪念日开始日期",
          bgcolor: $color("#EEF1F1"),
          titleColor: $color("#333333")
        },
        layout: function(make) {
          make.left.right.inset(20) 
          make.top.equalTo($("settings_commemorationDayText").bottom).offset(20) 
          make.height.equalTo(50)
        },
        events: {
          tapped: function(sender) {
            blurAllInput()

            $pick.date({
              props: {
                  mode: 1,
                  min: new Date("1700/1/1"),
                  max: new Date("2999/12/31"),
                  date: defaultPickDate
              },
              handler: function(date) {
                defaultPickDate = date
                let dateStr = moment(date).format('YYYY-MM-DD')
                $('settings_commemorationDayButton').title = dateStr
                $('settings_commemorationDayButton').info = {date: dateStr}
              }
            })
          }
        }
      },
      {
        type: "view",
        props: {
          id: "weather_switch_view"
        },
        layout: function(make, view) {
          make.left.right.inset(20)
          make.height.equalTo(30)
          make.top.equalTo($("settings_commemorationDayButton").bottom).offset(15) 
        },
        views: [
          {
            type: "label",
            props: {
              id: "weather_switch_label",
              text: "启用天气:",
              font: $font(14),
              userInteractionEnabled: false
            },
            layout: function(make, view) {
              make.left.inset(0)
              make.centerY.equalTo(view.super)
            }
          },
          {
            type: "switch",
            props: {
              id: "weather_switch",
              on: true,
              onColor: $color("green"),
              text: "天气",
              userInteractionEnabled: true
            },
            layout: function(make, view) {
              make.left.equalTo($("weather_switch_label").right).offset(5) 
              make.centerY.equalTo(view.super)
            },
            events: {
              changed: function(sender) {
                refreshWeatherFormVisible()
              }
            }
          }
        ]
      },
      {
        type: "label",
        props: {
          id: "settings_heweatherKey_label",
          text: "前往和风天气获取 Key",
          align: $align.right,
          textColor: $color("blue"),
          font: $font(12)
        },
        layout: function(make, view) {
          make.right.inset(20) 
          make.top.equalTo($("weather_switch_view").bottom).offset(5) 
        },
        events: {
          tapped: function(sender) {
            $app.openBrowser({
              url: "https://dev.heweather.com/docs/getting-started/get-api-key"
            })
          }
        }
      },
      {
        type: "input",
        props: {
          id: "settings_heweatherKey",
          darkKeyboard: true,
          placeholder: "和风天气 Key"
        },
        layout: function(make, view) {
          make.left.right.inset(20) 
          make.top.equalTo($("settings_heweatherKey_label").bottom).offset(4) 
          make.height.equalTo(50)
        },
        events: {
          returned: function(sender) {
            sender.blur()
          }
        }
      },
      {
        type: "button",
        props: {
          id: "settings_saveButton",
          title: "保存",
          enabled: false
        },
        layout: function(make, view) {
          make.left.right.inset(20) 
          make.top.equalTo($("settings_heweatherKey").bottom).offset(50) 
          make.height.equalTo(50)
          view._originBgcolor = view.bgcolor
          view.bgcolor = $color("lightGray")
        },
        events: {
          tapped: function(sender) {
            saveData(refreshUI)
          }
        }
      }
    ]
  })

  renderData()
}

// 读取配置并渲染
function renderData() {
  if (!$('settings_image')) {
    renderingFailed = true
    return
  }
  // 读取配置缓存
  let cacheData = $cache.get("data")

  if (cacheData) {
    if (cacheData.image) {
      $('settings_image').image = cacheData.image
    }

    if (cacheData.commemorationDayText && cacheData.commemorationDayText.length) {
      $('settings_commemorationDayText').text = cacheData.commemorationDayText
    }

    if (cacheData.commemorationDate && cacheData.commemorationDate.length) {
      $('settings_commemorationDayButton').title = cacheData.commemorationDate
      defaultPickDate = new Date(cacheData.commemorationDate)
      $('settings_commemorationDayButton').info = {date: cacheData.commemorationDate}
    }

    $('weather_switch').on = !cacheData.weatherDisabled

    refreshWeatherFormVisible()

    if (cacheData.heweatherKey && cacheData.heweatherKey.length) {
      $('settings_heweatherKey').text = cacheData.heweatherKey
    }
  }

  // 启用保存按钮
  $("settings_saveButton").enabled = true
  $("settings_saveButton").bgcolor = $("settings_saveButton")._originBgcolor
}

function refreshWeatherFormVisible() {
  let switchOn = $('weather_switch').on
  $('settings_heweatherKey_label').hidden = !switchOn
  $('settings_heweatherKey').hidden = !switchOn
}

/**
 * 结束所有 input 的焦点
 */
function blurAllInput() {
  $("settings_commemorationDayText").blur() 
  $("settings_heweatherKey").blur()
}

/**
 * 保存配置
 */
function saveData(refreshUI) {
  blurAllInput()
  if (!isValidForm()) {
    $device.taptic(2)
    return
  }

  let originalImage = $('settings_image').image
  let resizeWidth = 400
  let resizeHeight = originalImage.size.height / (originalImage.size.width / resizeWidth)
  var resizedImage = originalImage.resized($size(resizeWidth, resizeHeight))
  let res = {
    image: resizedImage,
    commemorationDayText: $('settings_commemorationDayText').text,
    commemorationDate: $('settings_commemorationDayButton').info.date,
    heweatherKey: $('settings_heweatherKey').text,
    weatherDisabled: !$('weather_switch').on
  }

  $ui.loading(true)
  $cache.setAsync({
    key: "data",
    value: res,
    handler: function(object) {
      $ui.loading(false)

      refreshUI()
      $ui.pop()
      $ui.toast("保存成功!")
    }
  })
}

function clearData(refreshUI) {
  $ui.alert({
    title: "提示",
    message: "你确定要清除配置信息吗？",
    actions: [
      {
        title: "确定",
        handler: function() {
          $ui.loading(true)
          $cache.removeAsync({
            key: "data",
            handler: function() {
              $ui.loading(false)
              refreshUI()
              $ui.pop()
              $ui.toast("清除缓存成功!")
            }
          })
        }
      },
      {
        title: "取消"
      }
    ]
  })
  
}

function isValidForm() {
  if (!$('settings_image').image) {
    $ui.error("请选择图片!")
    return false
  }
  if (!$('settings_commemorationDayText').text) {
    $ui.error("请填写纪念日文字!")
    return false
  }
  if (!$('settings_commemorationDayButton').info || !$('settings_commemorationDayButton').info.date) {
    $ui.error("请选择纪念日开始日期!")
    return false
  }
  if ($('weather_switch').on && !$('settings_heweatherKey').text) {
    $ui.error("请填写和风天气Key，用于获取天气信息!")
    return false
  }
  return true
}

module.exports = {
  runSettings
}