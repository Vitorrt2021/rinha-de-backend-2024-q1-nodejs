import { ApiError } from './error'

export class R<T> {
  constructor(private success, private error, private value?: T) {}

  static ok<U>(value?: U) {
    return new R<U>(true, null, value)
  }

  static fail<U>(error: ApiError) {
    return new R<U>(false, error)
  }

  isFail() {
    return !this.success
  }

  getValue(): T {
    if (this.success) {
      return this.value!
    }
    throw new Error('Cannot get value from a failed Result.')
  }

  getError(): ApiError {
    if (!this.success) {
      return this.error
    }
    throw new Error('Cannot get error from a successful Result.')
  }
}
