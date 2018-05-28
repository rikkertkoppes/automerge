const { Map, List, fromJS } = require('immutable')
const { propNames } = require('./prop_names')
const OpSet = require('./op_set')
const FreezeAPI = require('./freeze_api')
const ImmutableAPI = require('./immutable_api')

function isObject(obj) {
  return typeof obj === 'object' && obj !== null
}

// TODO when we move to Immutable.js 4.0.0, this function is provided by Immutable.js itself
function isImmutable(obj) {
  return isObject(obj) && !!obj['@@__IMMUTABLE_ITERABLE__@@']
}

function checkTarget(funcName, target, needMutable) {
  if (!target || !target[propNames._STATE] || !target[propNames._OBJECT_ID] ||
      !target[propNames._STATE].hasIn(['opSet', 'byObject', target[propNames._OBJECT_ID]])) {
    throw new TypeError('The first argument to Automerge.' + funcName +
                        ' must be the object to modify, but you passed ' + JSON.stringify(target))
  }
  if (needMutable && (!target._change || !target._change.mutable)) {
    throw new TypeError('Automerge.' + funcName + ' requires a writable object as first argument, ' +
                        'but the one you passed is read-only. Please use Automerge.change() ' +
                        'to get a writable version.')
  }
}

function makeChange(root, newState, message) {
  // If there are multiple assignment operations for the same object and key,
  // keep only the most recent
  let assignments = Map()
  const ops = List().withMutations(ops => {
    for (let op of newState.getIn(['opSet', 'local']).reverse()) {
      if (['set', 'del', 'link'].includes(op.get('action'))) {
        if (!assignments.getIn([op.get('obj'), op.get('key')])) {
          assignments = assignments.setIn([op.get('obj'), op.get('key')], true)
          ops.unshift(op)
        }
      } else {
        ops.unshift(op)
      }
    }
  })

  const actor = root[propNames._STATE].get('actorId')
  const seq = root[propNames._STATE].getIn(['opSet', 'clock', actor], 0) + 1
  const deps = root[propNames._STATE].getIn(['opSet', 'deps']).remove(actor)
  const change = fromJS({actor, seq, deps, message, ops})

  if (isImmutable(root)) {
    return ImmutableAPI.applyChanges(root, List.of(change), true)
  } else {
    return FreezeAPI.applyChanges(root, List.of(change), true)
  }
}

function applyChanges(doc, changes) {
  checkTarget('applyChanges', doc)
  if (isImmutable(doc)) {
    return ImmutableAPI.applyChanges(doc, fromJS(changes), true)
  } else {
    return FreezeAPI.applyChanges(doc, fromJS(changes), true)
  }
}

function merge(local, remote) {
  checkTarget('merge', local)
  if (local[propNames._STATE].get('actorId') === remote[propNames._STATE].get('actorId')) {
    throw new RangeError('Cannot merge an actor with itself')
  }

  const clock = local[propNames._STATE].getIn(['opSet', 'clock'])
  const changes = OpSet.getMissingChanges(remote[propNames._STATE].get('opSet'), clock)
  if (isImmutable(local)) {
    return ImmutableAPI.applyChanges(local, changes, true)
  } else {
    return FreezeAPI.applyChanges(local, changes, true)
  }
}

module.exports = {
  checkTarget, isObject, isImmutable,
  makeChange,
  applyChanges,
  merge,
}
