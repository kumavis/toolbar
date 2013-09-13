var toolbar = require('../index.js')
var toolbar = window.toolbar = toolbar('.bar-tab')
toolbar.on('select', function(selected) {
  console.log(selected)
})
