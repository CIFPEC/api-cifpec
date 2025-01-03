export class ErrorHandler extends Error {
  constructor(status, message, errors = []) {
    super();
    this.status = status;
    this.message = message;
    this.errors = errors;
  }
}
