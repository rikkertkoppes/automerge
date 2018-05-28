function getSymbol(name) {
    return (typeof Symbol !== 'undefined') ? Symbol(name) : name;
}

let propNames = {
    _OBJECT_ID: getSymbol('@@automerge/objectId'),
    _ACTOR_ID: getSymbol('@@automerge/actorId'),
    _CONFLICTS: getSymbol('@@automerge/conflicts'),
    _STATE: getSymbol('@@automerge/state'),
    _CHANGE: getSymbol('@@automerge/change'),
    _TYPE: getSymbol('@@automerge/type'),
    _INSPECT: getSymbol('@@automerge/inspect')
}

module.exports = { propNames }
