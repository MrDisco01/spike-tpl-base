const path = require('path')
const test = require('ava')
const Sprout = require('sprout')
const Spike = require('spike-core')
const rimraf = require('rimraf-promise')
const tmpdir = require('os-tmpdir')
const W = require('when')
const node = require('when/node')
const {exec} = require('child_process')

const tplTestPath = path.join(__dirname, 'example')

test.cb.before((t) => {
  rimraf(tplTestPath, () => { t.end() })
})

test('initializes with sprout, compiles with spike', t => {
  const tplName = 'spike-tpl-base-test'
  const locals = { name: 'doge', description: 'wow', github_username: 'amaze', production: false }
  const sprout = new Sprout(tmpdir())

  t.plan(1)

  return sprout.add(tplName, path.resolve(__dirname, '..'))
    .tap(() => console.log('initializing template...'))
    .then(sprout.init.bind(sprout, tplName, tplTestPath, { locals: locals }))
    .tap(() => console.log('installing dependencies...'))
    .then(npmInstall.bind(null, tplTestPath))
    .tap(() => console.log('compiling with spike...'))
    .then(() => {
      return W.promise((resolve, reject) => {
        const project = new Spike({ root: tplTestPath })
        project.on('error', reject)
        project.on('compile', resolve)
        project.compile()
      })
    })
    .then(() => { t.is(true, true) })
    .finally(() => {
      return rimraf(tplTestPath).then(sprout.remove.bind(sprout, tplName))
    })
})

test.only('compiles with production setting', t => {
  const tplName = 'spike-tpl-base-production-test'
  const locals = { name: 'doge', description: 'wow', github_username: 'amaze', production: true }
  const sprout = new Sprout(tmpdir())

  t.plan(1)

  return sprout.add(tplName, path.resolve(__dirname, '..'))
    .tap(() => console.log('initializing template...'))
    .then(sprout.init.bind(sprout, tplName, tplTestPath, { locals: locals }))
    .tap(() => console.log('installing dependencies...'))
    .then(npmInstall.bind(null, tplTestPath))
    .tap(() => console.log('compiling with spike...'))
    .then(() => {
      return W.promise((resolve, reject) => {
        const project = new Spike({ root: tplTestPath, env: 'production' })
        project.on('error', reject)
        project.on('compile', resolve)
        project.compile()
      })
    })
    .then(() => { t.is(true, true) })
    .finally(() => {
      return rimraf(tplTestPath).then(sprout.remove.bind(sprout, tplName))
    })
})

function npmInstall (dir) {
  return node.call(exec, 'npm install', { cwd: dir })
}
