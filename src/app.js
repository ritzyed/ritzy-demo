import 'babel/polyfill'
import Ritzy from 'ritzy'
import controls from './controls'

document.addEventListener('DOMContentLoaded', function() {
  const renderTarget = document.getElementById('editor')
  let ritzy = new Ritzy(config, renderTarget)

  ritzy.load((err) => {
    document.getElementById('editor').innerHTML = 'Oops, I couldn\'t load the editor:\n\n' + err
  })

  // setup API controls
  controls.localUser(ritzy)
  controls.remoteCursorEvents(ritzy)
  controls.settings(ritzy)
  controls.contents(ritzy)
  controls.selection(ritzy)
  controls.events(ritzy)

  // for access to ritzy via the console
  window.ritzy = ritzy
})
