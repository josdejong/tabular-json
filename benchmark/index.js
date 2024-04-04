/**
 * Compare the difference in file size of JSON and CSV
 */

import { readFileSync } from 'node:fs'
import { json2csv } from 'csv42'
import AdmZip from 'adm-zip'
import { example1 } from '../data/example1.js'
import { example2 } from '../data/example2.js'

const indentation = 2

console.log()
console.log('made up example with a few columns')
index(example1)

console.log()
console.log('made up example with many columns and nesting')
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
  const csvQuotes = json2csv(data, { formatValue: (value) => `"${value}"` })
  const csvNoQuotes = json2csv(data)

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
      description: 'CSV quotes',
      size: csvQuotes.length,
      'size (%)': percentage(csvQuotes.length, jsonFormatted.length),
      zipped: gzip(csvQuotes).length,
      'zipped (%)': percentage(gzip(csvQuotes).length, csvQuotes.length)
    },
    {
      description: 'CSV no quotes',
      size: csvNoQuotes.length,
      'size (%)': percentage(csvNoQuotes.length, jsonFormatted.length),
      zipped: gzip(csvNoQuotes).length,
      'zipped (%)': percentage(gzip(csvNoQuotes).length, csvNoQuotes.length)
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

function pad(text, length = 32) {
  return text + ' '.repeat(length - text.length)
}
