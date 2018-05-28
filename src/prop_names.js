function getSymbol(name) {
    return (typeof Symbol !== 'undefined') ? Symbol(name) : name;
}

let propNames = {
    _OBJECT_ID: getSymbol('@@automerge/objectId'),
    _ACTOR_ID: getSymbol('@@automerge/actorId'),
    _CONFLICTS: getSymbol('@@automerge/conflicts'),
    _STATE: getSymbol('@@automerge/state')
}

module.exports = { propNames }
