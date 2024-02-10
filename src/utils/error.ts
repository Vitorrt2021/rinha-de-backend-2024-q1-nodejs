export class ApiError extends Error {
  public status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

export class BadRequest extends ApiError {
  constructor(message: string) {
    super(message, 400)
  }
}

export class NotFound extends ApiError {
  constructor(message: string) {
    super(message, 404)
  }
}

export class UnprocessableEntity extends ApiError {
  constructor(message: string) {
    super(message, 422)
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err, _req, res, _next) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({
      status: err.status,
      message: err.message,
    })
  }
  console.log(err)
  res.status(500).json({
    status: 500,
    message: 'internal server error',
  })
}
