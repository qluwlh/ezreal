const hasJsxRuntime = (() => {
  try {
    require.resolve('react/jsx-runtime')
    return true
  } catch (e) {
    return false
  }
})()

module.exports = {
  hasJsxRuntime,
}
