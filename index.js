var keymaster = require('./lib/keymaster.js')
var inherits = require('inherits')
var events = require('events')
var elementClass = require('element-class')

var keyTable = require('./lib/keytable.js')

module.exports = function(opts) {
  return new HUD(opts)
}

function HUD(opts) {
  if (!(this instanceof HUD)) return new HUD(opts)
  var self = this
  if (!opts) opts = {}
  if (opts instanceof HTMLElement) opts = {el: opts}
  this.opts = opts
  this.el = opts.el || 'nav'
  if (typeof this.el !== 'object') this.el = document.querySelector(this.el)
  // setup toolbar if provided only a container
  if (this.el.getElementsByClassName('tab-inner').length===0) this.createTabInner()
  this.toolbarKeys = opts.toolbarKeys || ['1','2','3','4','5','6','7','8','9','0']
  this.bindEvents()
}

inherits(HUD, events.EventEmitter)

HUD.prototype.onKeyDown = function() {
  var self = this
  keymaster.getPressedKeyCodes().map(function(keyCode) {
    var pressed = keyTable[keyCode]
    var idx = self.toolbarKeys.indexOf(pressed)
    if (idx > -1) return self.switchToolbar(idx)
  })
}

HUD.prototype.bindEvents = function() {
  var self = this
  if (!this.opts.noKeydown) window.addEventListener('keydown', this.onKeyDown.bind(this))
  var list = this.el.querySelectorAll('li')
  list = Array.prototype.slice.call(list);
  list.map(function(li) { 
    li.addEventListener('click', self.onItemClick.bind(self))
  })
}

HUD.prototype.onItemClick = function(ev) {
  ev.preventDefault()
  var idx = this.toolbarIndexOf(ev.currentTarget)
  if (idx > -1) this.switchToolbar(idx)
}

HUD.prototype.addClass = function(el, className) {
  if (!el) return
  return elementClass(el).add(className)
}

HUD.prototype.removeClass = function(el, className) {
  if (!el) return
  return elementClass(el).remove(className)
}

HUD.prototype.toolbarIndexOf = function(li) {
  var list = this.el.querySelectorAll('.tab-item') 
  list = Array.prototype.slice.call(list)
  var idx = list.indexOf(li)
  return idx
}

HUD.prototype.switchToolbar = function(num) {
  this.removeClass(this.el.querySelector('.active'), 'active')
  var selected = this.el.querySelectorAll('.tab-item')[num]
  this.addClass(selected, 'active')
  var active = this.el.querySelector('.active .tab-label')
  if (!active) return
  var dataID = active.getAttribute('data-id')
  this.emit('select', dataID ? dataID : active.innerText)
}

HUD.prototype.emptyContent = function() {
  this.el.removeChild(this.el.getElementsByClassName('tab-inner')[0])
  this.createTabInner()
}

HUD.prototype.createTabInner = function() {
  var tabInner = document.createElement('ul')
  tabInner.className = 'tab-inner'
  this.el.appendChild(tabInner)
}

HUD.prototype.setContent = function(content) {
  var self = this
  // remove any previous content
  this.emptyContent()
  // add new content
  return content.map(function(item){
    return self.addContent(item)
  }) 
}

HUD.prototype.addContent = function(item) {
  var self = this
  // create new tab
  var tabItem = document.createElement('li')
  tabItem.className = 'tab-item'
  // create the icon, if provided
  if (item.icon) {
    var tabIcon = document.createElement('img')
    tabIcon.className = 'tab-icon'
    tabIcon.src = item.icon
    tabItem.appendChild(tabIcon)
  }
  // create the label
  var tabLabel = document.createElement('div')
  tabLabel.className = 'tab-label'
  if (item.label) tabLabel.innerText = item.label
  if (item.id !== undefined) tabLabel.setAttribute('data-id',item.id)
  tabItem.appendChild(tabLabel)
  // add item to toolbar
  this.el.getElementsByClassName('tab-inner')[0].appendChild(tabItem)
  // bind click event for new item
  tabItem.addEventListener('click', self.onItemClick.bind(self))
  return tabItem
}
