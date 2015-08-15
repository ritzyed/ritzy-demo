import 'babel/polyfill'
import Ritzy from 'ritzy'

// font support is baking (so configuration is left at the OpenSans default)
// the most often used config values are shown below

document.addEventListener('DOMContentLoaded', function() {
  let ritzy = new Ritzy(config)

  const renderTarget = document.getElementById('editor')
  ritzy.render(renderTarget)
  // ritzy.on, etc.
})
