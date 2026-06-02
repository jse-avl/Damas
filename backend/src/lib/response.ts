export function success<T>(data: T, message?: string) {
  return { success: true, data, message }
}

export function error(code: string, message: string) {
  return { success: false, error: { code, message } }
}
