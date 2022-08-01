// Error logging class.
class LogError {
  constructor(customMsg, error, states, uiMsg, errorID, handle) {
    this.customMsg = customMsg || null;
    this.error = error || null;
    this.states = states;
    this.uiMsg = uiMsg || null;
    this.errorID = errorID;
    this.errorOrigin = "Extension";
    this.timestamp = this.getDate();
    handle();
    this.logError();
  }

  getDate() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const hh = String(today.getHours()).padStart(2, "0");
    const nn = String(today.getMinutes()).padStart(2, "0");
    const ss = String(today.getSeconds()).padStart(2, "0");

    return `${yyyy}/${mm}/${dd}T${hh}:${nn}:${ss}`;
  }

  logError() {
    chrome.runtime.sendMessage({
      from: "cart",
      subject: "logError",
      body: { logError: this },
    });
    // TODO: Logs error to database
  }
}

module.exports = {
  LogError,
};
