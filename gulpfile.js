/* global argv */

// Include Gulp and other build automation tools and utilities
// See: https://github.com/gulpjs/gulp/blob/master/docs/API.md
var _ = require('lodash')
var gulp = require('gulp')
var $ = require('gulp-load-plugins')()
var del = require('del')
var path = require('path')
var runSequence = require('run-sequence')
var webpack = require('webpack')

var options = require('minimist')(process.argv.slice(2), {
  alias: {
    debug: 'D',
    verbose: 'V'
  },
  boolean: ['debug', 'verbose'],
  default: {
    debug: false,
    verbose: false
  }
})

$.util.log('[args]', '   debug = ' + options.debug)
$.util.log('[args]', ' verbose = ' + options.verbose)

// https://github.com/ai/autoprefixer
options.autoprefixer = [
  'last 2 version'
]

var paths = {
  build: 'build',
  ritzy: 'node_modules/ritzy/dist',
  src: [
    'src/**/*.js',
    '!src/server.js',
    '!src/**/__tests__/**/*.js',
    '!src/**/__mocks__/**/*.js',
    '!src/assets/*',
    '!src/templates/*'
  ]
}
var src = {
  assets: [
    'src/assets/**',
    'src/templates*/**'
  ],
  server: [
    paths.build + '/app.js',
    paths.build + '/server.js',
    paths.build + '/templates/**/*',
    paths.build + '/fonts/**/*'
  ]
}
var watch = false

var webpackOpts = function(output, configs, debug) {
  return require('./webpack.config.js')(output, configs, debug, options.verbose, options.autoprefixer)
}
var webpackCompletion = function(err, stats) {
  if(err) {
    throw new $.util.PluginError('webpack', err, {showStack: true})
  }
  var jsonStats = stats.toJson()
  var statsOptions = { colors: true/*, modulesSort: 'size'*/ }
  if(jsonStats.errors.length > 0) {
    if(watch) {
      $.util.log('[webpack]', stats.toString(statsOptions))
    } else {
      throw new $.util.PluginError('webpack', stats.toString(statsOptions))
    }
  }
  if(jsonStats.warnings.length > 0 || options.verbose) {
    $.util.log('[webpack]', stats.toString(statsOptions))
  }
  if(jsonStats.errors.length === 0 && jsonStats.warnings.length === 0) {
    $.util.log('[webpack]', 'No errors or warnings.')
  }
}

// Check the version of node currently being used
gulp.task('node-version', function(cb) { // eslint-disable-line no-unused-vars
  return require('child_process').fork(null, {execArgv: ['--version']})
})

// The default task
gulp.task('default', ['serve'])

// Clean output directory
gulp.task('clean', del.bind(
  null, ['.tmp', paths.build], {dot: true}
))

gulp.task('assets:local', function() {
  return gulp.src(src.assets)
    .pipe($.changed(paths.build))
    .pipe(gulp.dest(paths.build))
    .pipe($.size({title: 'assets'}))
})

gulp.task('assets:fonts', function() {
  return gulp.src(paths.ritzy + '/fonts/**/*.ttf', {base: paths.ritzy})
    .pipe($.changed(paths.build))
    .pipe(gulp.dest(paths.build))
    .pipe($.size({title: 'fonts'}))
})

gulp.task('assets', ['assets:local', 'assets:fonts'])

var compile = function(cb, webpackConfigs) {
  var started = false
  function webpackCb(err, stats) {
    webpackCompletion(err, stats)
    if (!started) {
      started = true
      return cb()
    }
  }

  var compiler = webpack(webpackOpts(paths.build, webpackConfigs, true))
  if (watch) {
    compiler.watch(200, webpackCb)
  } else {
    compiler.run(webpackCb)
  }
}

gulp.task('compile:client', function(cb) {
  compile(cb, {client: true})
})

gulp.task('compile:server', function(cb) {
  compile(cb, {server: true})
})

// Build and run the app from source code
gulp.task('build', ['clean'], function(cb) {
  runSequence(['assets', 'compile:client', 'compile:server'], cb)
})

// Run and start watching for modifications
gulp.task('build:watch', function(cb) {
  watch = true
  runSequence('build', function(err) {
    gulp.watch(src.assets, ['assets'])
    cb(err)
  })
})

// Launch a Node.js/Express server
gulp.task('serve', ['build:watch'], function(cb) {
  var started = false
  var cp = require('child_process')
  var nodeArgs = {}
  if(options.debug) {
    $.util.log('[node]', 'Node.js debug port set to 5858.')
    nodeArgs.execArgv = ['--debug-brk=5858']
  }

  var server = (function startup() {
    var child = cp.fork(paths.build + '/server.js', nodeArgs, {
      env: _.assign({NODE_ENV: 'development'}, process.env)
    })
    child.once('message', function(message) {
      if (message.match(/^online$/)) {
        if (!started) {
          started = true
          gulp.watch(src.server, function() {
            $.util.log('Restarting demo server.')
            server.kill('SIGTERM')
            server = startup()
          })
          cb()
        }
      }
    })
    return child
  })()
})
