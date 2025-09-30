import type { NestedObject, Path } from './types.js'
import { isObject } from './is.js'

const leaf = Symbol()

type MergedObject = {
  [key: string]: MergedObject
  [leaf]?: boolean | null
}

export function collectNestedPaths<T>(array: T[]): Path[] {
  const merged: MergedObject = {}
  array.forEach((item) => {
    if (isObject(item)) {
      _mergeObject(item as NestedObject, merged)
    } else {
      _mergeValue(item, merged)
    }
  })

  const paths: Path[] = []
  _collectPaths(merged, [], paths)

  return paths
}

// internal function for collectNestedPaths
// mutates the argument `merged`
function _mergeObject(object: NestedObject, merged: MergedObject): void {
  for (const key in object) {
    const value = object[key]
    const valueMerged =
      merged[key] || (merged[key] = (Array.isArray(value) ? [] : {}) as MergedObject)

    if (isObject(value)) {
      _mergeObject(value as NestedObject, valueMerged as MergedObject)
    } else {
      _mergeValue(value, valueMerged)
    }
  }
}

// internal function for collectNestedPaths
// mutates the argument `merged`
function _mergeValue(value: unknown, merged: MergedObject) {
  if (merged[leaf] === undefined) {
    merged[leaf] = value === null || value === undefined ? null : true
  }
}

// internal function for collectNestedPaths
// mutates the argument `paths`
function _collectPaths(merged: MergedObject, parentPath: Path, paths: Path[]): void {
  if (merged[leaf] === true || (merged[leaf] === null && isEmpty(merged))) {
    paths.push(parentPath)
  } else if (Array.isArray(merged)) {
    merged.forEach((item, index) => _collectPaths(item, parentPath.concat(index), paths))
  } else if (isObject(merged)) {
    for (const key in merged) {
      _collectPaths(merged[key], parentPath.concat(key), paths)
    }
  }
}

function isEmpty(object: NestedObject): boolean {
  return Object.keys(object).length === 0
}
