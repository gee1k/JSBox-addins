/**
 * 根据 view id 设置属性
 * @param {*} id 
 * @param {*} key 
 * @param {*} value 
 */
function setValue(id, key, value) {
  if (!id || !$(id) || !key) {
    return
  }

  $(id)[key] = value
}

module.exports = {
  setValue
}