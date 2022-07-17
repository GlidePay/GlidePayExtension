class LogError {
  constructor(generic, message, states, handle) {
    this.generic = generic;
    this.message = message;
    this.states = states;
    this.handle = handle;
  }
}

class UserError {
  constructor(message, handle) {
    this.message = message;
    this.handle = handle;
  }
}

module.exports = {
  LogError,
  UserError,
};
