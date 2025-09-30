/**
 * Compare the difference in file size of JSON and CSV
 */

import { readFileSync } from 'node:fs'
import AdmZip from 'adm-zip'
import { stringify } from '../lib/index.js'

const indentation = 2

console.log()
console.log('made up example with a few columns')
const example1 = JSON.parse(String(readFileSync('./data/example1.json')))
index(example1)

console.log()
console.log('made up example with many columns and nesting')
const example2 = JSON.parse(String(readFileSync('./data/example2.json')))
index(example2)

{
  const data = JSON.parse(String(readFileSync('./data/unece_country_overview.json')))
  console.log()
  console.log(
    'unece_country_overview.json (flat data, very long key names, repetitive country names)'
  )
  index(data)
}

{
  const data = JSON.parse(String(readFileSync('./data/Biodiversity_by_County.json')))
  console.log()
  console.log('Biodiversity_by_County.json')
  index(data)
}

function index(data) {
  const jsonFormatted = JSON.stringify(data, null, indentation)
  const jsonCompact = JSON.stringify(data)
  const tabularFormatted = stringify(data, { indentation: 2 })
  const tabularCompact = stringify(data)

  console.table([
    {
      description: 'JSON formatted',
      size: jsonFormatted.length,
      'size (%)': '',
      zipped: gzip(jsonFormatted).length,
      'zipped (%)': percentage(gzip(jsonFormatted).length, jsonFormatted.length)
    },
    {
      description: 'JSON compact',
      size: jsonCompact.length,
      'size (%)': percentage(jsonCompact.length, jsonFormatted.length),
      zipped: gzip(jsonCompact).length,
      'zipped (%)': percentage(gzip(jsonCompact).length, jsonCompact.length)
    },
    {
      description: 'Tabular-JSON formatted',
      size: tabularFormatted.length,
      'size (%)': percentage(tabularFormatted.length, jsonFormatted.length),
      zipped: gzip(tabularFormatted).length,
      'zipped (%)': percentage(gzip(tabularFormatted).length, tabularFormatted.length)
    },
    {
      description: 'Tabular-JSON compacted',
      size: tabularCompact.length,
      'size (%)': percentage(tabularCompact.length, jsonFormatted.length),
      zipped: gzip(tabularCompact).length,
      'zipped (%)': percentage(gzip(tabularCompact).length, tabularCompact.length)
    }
  ])
}

function gzip(text) {
  const zip = new AdmZip()
  zip.addFile('data.json', text)
  return zip.toBuffer()
}

function percentage(a, b) {
  return Math.round((100 * a) / b) + '%'
}
