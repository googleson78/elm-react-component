
'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./component.cjs.production.min.js')
} else {
  module.exports = require('./component.cjs.development.js')
}
