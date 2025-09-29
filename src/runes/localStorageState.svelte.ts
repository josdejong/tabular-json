export function loadLocalStorage<T>(key: string, defaultValue: T) {
  try {
    if (typeof window !== 'undefined' && key in window.localStorage) {
      return JSON.parse(window.localStorage[key])
    }
  } catch (err) {
    console.error(err)
  }

  return defaultValue
}

export function saveLocalStorage<T>(key: string, value: T) {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage[key] = JSON.stringify(value)
    }
  } catch (err) {
    console.error(err)
  }
}
