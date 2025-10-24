export class DatabaseError extends Error {
  constructor(message: string, public originalError?: any) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export class NotFoundError extends DatabaseError {
  constructor(resource: string, id: number | string) {
    super(`${resource} with id ${id} not found`);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends DatabaseError {
  constructor(message: string, public validationErrors?: any) {
    super(message);
    this.name = 'ValidationError';
  }
}
