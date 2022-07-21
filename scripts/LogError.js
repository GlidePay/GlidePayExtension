class LogError {
  constructor(error, customMsg, states, handle) {
    this.error = error;
    this.customMsg = customMsg;
    this.states = states;
    this.timestamp = Date.now();
    this.handle = handle();
    this.logError();
  }

  logError() {
    // TODO: Logs error to database
  }
}

module.exports = {
  LogError,
};
