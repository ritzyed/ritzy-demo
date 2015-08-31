function localUser(ritzy) {
  let localUserEl = document.getElementById('userName')
  // initial value
  localUserEl.value = config.userName

  document.getElementById('userNameApply').onclick = () => {
    console.debug('userNameApply', localUserEl.value)
    ritzy.setUserName(localUserEl.value)
  }
}

function remoteCursorEvents(ritzy) {
  let activeUsers = {}

  let uiUpdateActiveUsers = function(activeUsers) {
    let htmlForActiveUser = function(color, name) {
      if(name === null) {
        name = '?'
      }
      return (
        `<div class="row row-pad">
          <div style="width: 20px; height: 20px; float:left; margin: 0 5px; background-color: ${color};"></div>
          <span>${name}</span>
        </div>`
      )
    }

    let activeUsersEl = document.getElementById('activeUsers')
    activeUsersEl.innerHTML = Object.values(activeUsers).reduce((html, u) => html + htmlForActiveUser(u.color, u.name), '')
  }

  ritzy.onRemoteCursorAdd(remoteCursor => {
    activeUsers[remoteCursor._id] = remoteCursor
    uiUpdateActiveUsers(activeUsers)
  })

  ritzy.onRemoteCursorChangeName((remoteCursor, oldName, newName) => {
    activeUsers[remoteCursor._id] = remoteCursor
    uiUpdateActiveUsers(activeUsers)
  })

  ritzy.onRemoteCursorRemove(remoteCursor => {
    delete activeUsers[remoteCursor._id]
    uiUpdateActiveUsers(activeUsers)
  })
}

function settings(ritzy) {
  let fontSizeEl = document.getElementById('fontSize')
  // initial value
  fontSizeEl.value = config.fontSize

  document.getElementById('fontSizeApply').onclick = () => {
    console.debug('fontSizeApply', fontSizeEl.value)
    ritzy.setFontSize(parseFloat(fontSizeEl.value))
  }

  let widthEl = document.getElementById('width')
  // initial value
  widthEl.value = config.width

  document.getElementById('widthApply').onclick = () => {
    console.debug('widthApply', widthEl.value)
    ritzy.setWidth(parseFloat(widthEl.value))
  }

  let marginHEl = document.getElementById('marginH')
  // initial value
  marginHEl.value = config.margin.horizontal

  document.getElementById('marginHApply').onclick = () => {
    console.debug('marginHApply', marginHEl.value)
    ritzy.setMarginHorizontal(parseFloat(marginHEl.value))
  }

  let marginVEl = document.getElementById('marginV')
  // initial value
  marginVEl.value = config.margin.vertical

  document.getElementById('marginVApply').onclick = () => {
    console.debug('marginVApply', marginVEl.value)
    ritzy.setMarginVertical(parseFloat(marginVEl.value))
  }
}

function contents(ritzy) {
  document.getElementById('getContents').onclick = () => {
    console.debug('getContents')
    let Contents = ritzy.getContents()
    console.debug(Contents)
  }

  document.getElementById('getContentsRich').onclick = () => {
    console.debug('getContentsRich')
    let Contents = ritzy.getContentsRich()
    console.debug(Contents)
  }

  document.getElementById('getContentsHtml').onclick = () => {
    console.debug('getContentsHtml')
    let Contents = ritzy.getContentsHtml()
    console.debug(Contents)
  }

  document.getElementById('getContentsText').onclick = () => {
    console.debug('getContentsText')
    let Contents = ritzy.getContentsText()
    console.debug(Contents)
  }
}

function selection(ritzy) {
  document.getElementById('getSelection').onclick = () => {
    console.debug('getSelection')
    let selection = ritzy.getSelection()
    console.debug(selection)
  }

  document.getElementById('getSelectionRich').onclick = () => {
    console.debug('getSelectionRich')
    let selection = ritzy.getSelectionRich()
    console.debug(selection)
  }

  document.getElementById('getSelectionHtml').onclick = () => {
    console.debug('getSelectionHtml')
    let selection = ritzy.getSelectionHtml()
    console.debug(selection)
  }

  document.getElementById('getSelectionText').onclick = () => {
    console.debug('getSelectionText')
    let selection = ritzy.getSelectionText()
    console.debug(selection)
  }
}

function events(ritzy) {
  let positionChangeCb = function(position) {
    console.debug('onPositionChange position', position)
  }
  document.getElementById('onPositionChange').onclick = (e) => {
    if(e.target.checked) {
      ritzy.onPositionChange(positionChangeCb)
    } else {
      ritzy.removeListener('position-change', positionChangeCb)
    }
  }

  let selectionChangeCb = function(selection) {
    console.debug('onSelectionChange selection', selection)
  }
  document.getElementById('onSelectionChange').onclick = (e) => {
    if(e.target.checked) {
      ritzy.onSelectionChange(selectionChangeCb)
    } else {
      ritzy.removeListener('selection-change', selectionChangeCb)
    }
  }

  let focusGainedCb = function() {
    console.debug('onFocusGained')
  }
  document.getElementById('onFocusGained').onclick = (e) => {
    if(e.target.checked) {
      ritzy.onFocusGained(focusGainedCb)
    } else {
      ritzy.removeListener('focus-gained', focusGainedCb)
    }
  }

  let focusLostCb = function() {
    console.debug('onFocusLost')
  }
  document.getElementById('onFocusLost').onclick = (e) => {
    if(e.target.checked) {
      ritzy.onFocusLost(focusLostCb)
    } else {
      ritzy.removeListener('focus-lost', focusLostCb)
    }
  }

  let remoteCursorAddCb = function(remoteCursor) {
    console.debug('onRemoteCursorAdd', remoteCursor)
  }
  document.getElementById('onRemoteCursorAdd').onclick = (e) => {
    if(e.target.checked) {
      ritzy.onRemoteCursorAdd(remoteCursorAddCb)
    } else {
      ritzy.removeListener('remote-cursor-add', remoteCursorAddCb)
    }
  }

  let remoteCursorRemoveCb = function(remoteCursor) {
    console.debug('onRemoteCursorRemove', remoteCursor)
  }
  document.getElementById('onRemoteCursorRemove').onclick = (e) => {
    if(e.target.checked) {
      ritzy.onRemoteCursorRemove(remoteCursorRemoveCb)
    } else {
      ritzy.removeListener('remote-cursor-remove', remoteCursorRemoveCb)
    }
  }

  let remoteCursorChangeNameCb = function(remoteCursor, oldName, newName) {
    console.debug('onRemoteCursorChangeName', remoteCursor, 'oldName=', oldName, 'newName=', newName)
  }
  document.getElementById('onRemoteCursorChangeName').onclick = (e) => {
    if(e.target.checked) {
      ritzy.onRemoteCursorChangeName(remoteCursorChangeNameCb)
    } else {
      ritzy.removeListener('remote-cursor-change-name', remoteCursorChangeNameCb)
    }
  }

  let textInsertCb = function(atPosition, value, attributes, newPosition) {
    console.debug('onTextInsert atPosition=', atPosition, 'value=', value, 'attributes=', attributes, 'newPosition=', newPosition)
  }
  document.getElementById('onTextInsert').onclick = (e) => {
    if(e.target.checked) {
      ritzy.onTextInsert(textInsertCb)
    } else {
      ritzy.removeListener('text-insert', textInsertCb)
    }
  }

  let textDeleteCb = function(from, to, newPosition) {
    console.debug('onTextDelete from=', from, 'to=', to, 'newPosition=', newPosition)
  }
  document.getElementById('onTextDelete').onclick = (e) => {
    if(e.target.checked) {
      ritzy.onTextDelete(textDeleteCb)
    } else {
      ritzy.removeListener('text-delete', textDeleteCb)
    }
  }
}

let controls = {
  localUser: localUser,
  remoteCursorEvents: remoteCursorEvents,
  settings: settings,
  contents: contents,
  selection: selection,
  events: events
}

export default controls
