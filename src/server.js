import 'babel/polyfill'

import _ from 'lodash'
import fs from 'fs'
import path from 'path'
import express from 'express'
import http from 'http'
import url from 'url'
import WebSocket from 'ws'
import shortid from 'shortid'
//import compression from 'compression'

import SwarmServer from 'ritzy/lib/core/swarmserver'

import createReplica from './createReplica'
import randomName from './names'

let redisConfig = {
  port: process.env.OPENSHIFT_REDIS_PORT || 6379,
  host: process.env.OPENSHIFT_REDIS_HOST || '127.0.0.1',
  options: {
    auth_pass: process.env.REDIS_PASSWORD || null
  }
}

shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_~')

let swarmServer = new SwarmServer(redisConfig)
let Swarm = swarmServer.Swarm

let server = express()
let port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 5000
let ip = process.env.IP || process.env.OPENSHIFT_NODEJS_IP || 'localhost'
server.set('port', port)
server.set('ip', ip)
//server.use(compression())
server.use(express.static(path.join(__dirname)))

let compiledTemplateCache = {}

server.engine('html', function(filePath, options, callback) {
  fs.readFile(filePath, function(err, content) {
    if (err) return callback(new Error(err))
    let template
    if(filePath in compiledTemplateCache) {
      template = compiledTemplateCache[filePath]
    } else {
      template = _.template(content, 'utf8')
      compiledTemplateCache[filePath] = template
    }
    return callback(null, template(options))
  })
})
server.set('views', path.join(__dirname, 'templates'))
server.set('view engine', 'html')

server.get('/', (req, res) => {
  res.render('index', {
    title: 'Ritzy Editor Demo'
  })
})

server.get('/editor/create', (req, res) => {
  let id = shortid.generate()
  createReplica(Swarm, id)
  res.redirect(`/editor/${id}`)
})

server.get('/editor/:id', (req, res) => {
  let id = req.params.id
  let userId = shortid.generate()
  res.render('editor', {
    id: id,
    userId: userId,
    userName: randomName(),
    title: `Ritzy Editor ${id}`
  })
})

// example of calling this:
// http://localhost:5000/sapi/Text%2310 to return a Text replica 10
// http://localhost:5000/sapi/CursorSet%2310 to return a set of Cursors for editor 10
// http://localhost:5000/sapi/Cursor%2310_A0017r to return the state of Cursor for user id A0017r in editor 10
/*
let apiHandler = require('swarm-restapi').createHandler({
  route: '/sapi',
  host: Swarm.host,
  authenticate: function(req, cb) {cb(null, null)} // no auth, to implement see sample auth function in swarm-restapi/index.js
})
server.get(/^\/sapi\//, apiHandler)
server.post(/^\/sapi\//, apiHandler)
server.put(/^\/sapi\//, apiHandler)
*/

let httpServer = http.createServer(server)

httpServer.listen(server.get('port'), server.get('ip'), function(err) {
  if (err) {
    console.warn('Can\'t start HTTP server. Error: ', err, err.stack)
    return
  }

  // integration with parent process e.g. gulp
  // process.send is available if we are a child process (https://nodejs.org/api/child_process.html)
  if (process.send) {
    process.send('online')
  }
  console.log('The HTTP server is listening on port ' + server.get('ip') + '/' + server.get('port'))
})

// start WebSocket server
let wsServer = new WebSocket.Server({
  server: httpServer
})

// accept pipes on connection
wsServer.on('connection', function(ws) {
  let params = url.parse(ws.upgradeReq.url, true)
  console.log('Incoming websocket %s', params.path, ws.upgradeReq.connection.remoteAddress)
  if (!Swarm.host) {
    return ws.close()
  }
  Swarm.host.accept(new Swarm.EinarosWSStream(ws), {delay: 50})
})

/* eslint-disable no-process-exit */
function onExit(exitCode) {
  console.log('Shutting down http-server...')
  httpServer.close(function(err) {
    if(err) console.warn('HTTP server close failed: %s', err)
    else console.log('HTTP server closed.')
  })

  if (!Swarm.host) {
    console.log('Swarm host not created yet...')
    return process.exit(exitCode)
  }

  console.log('Closing swarm host...')
  let forcedExit = setTimeout(function() {
    console.log('Swarm host close timeout, forcing exit.')
    process.exit(exitCode)
  }, 5000)

  Swarm.host.close(function() {
    console.log('Swarm host closed.')
    clearTimeout(forcedExit)
    process.exit(exitCode)
  })
}
/* eslint-enable no-process-exit */

process.on('SIGTERM', onExit)
process.on('SIGINT', onExit)
process.on('SIGQUIT', onExit)

process.on('uncaughtException', function(err) {
  console.error('Uncaught Exception: ', err, err.stack)
  onExit(2)
})
