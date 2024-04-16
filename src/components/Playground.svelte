<script lang="ts">
  import { stringify, parse } from '../scripts/lib'

  const example1 = {
    name: 'rob',
    hobbies: ['swimming', 'biking'],
    friends: [
      { id: 2, name: 'joe', address: { city: 'New York', street: '1st Ave' } },
      { id: 3, name: 'sarah', address: { city: 'Washington', street: '18th Street NW' } }
    ],
    address: { city: 'New York', street: '1st Ave' }
  }

  const example2 = {
    name: 'Richard',
    age: 33,
    hobbies: ['Biking', 'Gaming', 'Squash'],
    city: 'Port Land',
    friends: [
      { name: 'Chris', age: 23, city: 'New York' },
      { name: 'Emily', age: 19, city: 'Atlanta' },
      { name: 'Joe', age: 32, city: 'San Diego' },
      { name: 'Kevin', age: 19, city: 'Indianapolis' },
      { name: 'Michelle', age: 27, city: 'Los Angeles' },
      { name: 'Robert', age: 45, city: 'Manhattan' },
      { name: 'Sarah', age: 31, city: 'Chicago' },
      { name: 'Brandon', age: 42, city: 'Houston' },
      { name: 'Rachel', age: 55, city: 'Philadelphia' },
      { name: 'Christina', age: 22, city: 'Denver' }
    ]
  }

  const example3 = [
    { name: 'Chris', age: 23, city: 'New York' },
    { name: 'Emily', age: 19, city: 'Atlanta' },
    { name: 'Joe', age: 32, city: 'San Diego' },
    { name: 'Kevin', age: 19, city: 'Indianapolis' },
    { name: 'Michelle', age: 27, city: 'Los Angeles' },
    { name: 'Robert', age: 45, city: 'Manhattan' },
    { name: 'Sarah', age: 31, city: 'Chicago' },
    { name: 'Brandon', age: 42, city: 'Houston' },
    { name: 'Rachel', age: 55, city: 'Philadelphia' },
    { name: 'Christina', age: 22, city: 'Denver' }
  ]

  const indentation = 2
  let json = ''
  let jsonError: string | undefined
  let tabularJson = ''
  let tabularJsonError: string | undefined

  let size: { jsonSize: string; tabularJsonSize: string }
  $: size = updateSize({ json, jsonError, tabularJson, tabularJsonError })

  initialize(example1)

  function initialize(newJson: unknown) {
    json = JSON.stringify(newJson, null, indentation)
    tabularJson = stringify(newJson, { indentation })
  }

  function percentage(a: number, b: number) {
    return Math.round((a / b) * 100) + '%'
  }

  function updateJson() {
    jsonError = undefined
    tabularJsonError = undefined

    try {
      if (json.trim() !== '') {
        const parsed = JSON.parse(json)
        tabularJson = stringify(parsed, { indentation })
      } else {
        tabularJson = ''
      }
    } catch (err) {
      jsonError = err.toString()
    }
  }

  function updateTabularJson() {
    jsonError = undefined
    tabularJsonError = undefined

    try {
      if (tabularJson.trim() !== '') {
        const parsed = parse(tabularJson)
        json = JSON.stringify(parsed, null, indentation)
      } else {
        json = ''
      }
    } catch (err) {
      tabularJsonError = err.toString()
    }
  }

  function updateSize({
    json,
    jsonError,
    tabularJson,
    tabularJsonError
  }: {
    json: string
    jsonError: string | undefined
    tabularJson: string
    tabularJsonError: string | undefined
  }): { jsonSize: string; tabularJsonSize: string } {
    const jsonLength = json.length
    const jsonLineCount = json.split('\n').length
    const tabularJsonLength = tabularJson.length
    const tabularJsonLineCount = tabularJson.split('\n').length

    const hasJson = jsonLength > 0 && !jsonError
    const hasTabularJson = tabularJsonLength > 0 && !tabularJsonError

    const jsonSize = hasJson ? `Size: ${jsonLength} bytes, ${jsonLineCount} lines` : ''
    const tabularJsonSize =
      hasJson && hasTabularJson
        ? `Size: ${tabularJsonLength} bytes (${percentage(tabularJsonLength, jsonLength)}), ` +
          `${tabularJsonLineCount} lines (${percentage(tabularJsonLineCount, jsonLineCount)})`
        : hasTabularJson
          ? `Size: ${tabularJsonLength} bytes, ${tabularJsonLineCount} lines`
          : ''

    return {
      jsonSize,
      tabularJsonSize
    }
  }

  export async function smartFormat(
    text: string,
    indentation: number | string,
    maxLineLength: number
  ) {
    const { Formatter, FracturedJsonOptions, NumberListAlignment } = await import('fracturedjsonjs')

    const options = new FracturedJsonOptions()
    options.MaxTotalLineLength = maxLineLength
    options.CommaPadding = true
    options.OmitTrailingWhitespace = true
    options.UseTabToIndent = indentation === '\t'
    options.IndentSpaces = typeof indentation === 'number' ? indentation : indentation?.length || 2
    options.MaxInlineComplexity = 1
    options.NumberListAlignment = NumberListAlignment.Decimal // we do not want to alter the formatting of numbers

    const formatter = new Formatter()
    formatter.Options = options

    return formatter.Reformat(text)
  }

  function beautifyJson() {
    try {
      const parsed = JSON.parse(json)
      json = JSON.stringify(parsed, null, indentation)
    } catch (err) {
      alert(err.toString())
    }
  }

  async function smartBeautifyJson() {
    try {
      json = await smartFormat(json, indentation, 80)
    } catch (err) {
      alert(err.toString())
    }
  }

  function minifyJson() {
    try {
      const parsed = JSON.parse(json)
      json = JSON.stringify(parsed)
    } catch (err) {
      alert(err.toString())
    }
  }

  function beautifyTabularJson() {
    try {
      const json = parse(tabularJson)
      tabularJson = stringify(json, { indentation })
    } catch (err) {
      alert(err.toString())
    }
  }

  function minifyTabularJson() {
    try {
      const json = parse(tabularJson)
      tabularJson = stringify(json)
    } catch (err) {
      alert(err.toString())
    }
  }
</script>

<div class="playground">
  <div class="sub-menu">
    Select an example:
    <button type="button" on:click={() => initialize(example1)}>example1</button>
    <button type="button" on:click={() => initialize(example2)}>example2</button>
    <button type="button" on:click={() => initialize(example3)}>example3</button>
  </div>
  <div class="columns">
    <div class="column" class:error={!!jsonError}>
      <div class="title">
        <div class="left">
          <h2>JSON</h2>
        </div>
        <button type="button" on:click={() => beautifyJson()}>Beautify</button>
        <button type="button" on:click={() => smartBeautifyJson()}>Smart Beautify</button>
        <button type="button" on:click={() => minifyJson()}>Minify</button>
      </div>
      <label class="textarea">
        <textarea bind:value={json} on:input={() => updateJson()} spellcheck="false"></textarea>
      </label>
      <div class="error-message">{jsonError}</div>
      <div>{size.jsonSize}</div>
    </div>
    <div class="column" class:error={!!tabularJsonError}>
      <div class="title">
        <div class="left">
          <h2>Tabular-JSON</h2>
        </div>
        <button type="button" on:click={() => beautifyTabularJson()}>Beautify</button>
        <button type="button" on:click={() => minifyTabularJson()}>Minify</button>
      </div>
      <label class="textarea">
        <textarea bind:value={tabularJson} on:input={() => updateTabularJson()} spellcheck="false"
        ></textarea>
      </label>
      <div class="error-message">{tabularJsonError}</div>
      <div>{size.tabularJsonSize}</div>
    </div>
  </div>
</div>

<style lang="scss">
  .playground {
    --padding: 10px;
    --background: #f5f5f5;
    --border: 1px solid #bfbfbf;
    --error-color: #e4402a;
    --link-color: #e4402a;
    --link-color-highlight: #c10e0e;
    --border-radius: 5px;

    flex: 1;
    display: flex;
    flex-direction: column;

    .sub-menu {
      background: var(--sub-menu-background);
      padding: var(--padding);
    }

    h2 {
      font-weight: bold;
      font-size: inherit;
      font-family: inherit;
      display: inline;
      margin: 0;
      padding: 0;
    }

    button {
      font-family: inherit;
      font-size: inherit;
      cursor: pointer;
      background: #6a6a6a;
      color: white;
      border: none;
      border-radius: 3px;
      padding: 2px 6px;

      &:hover {
        background: #959595;
      }
    }

    .columns {
      background: var(--background);
      flex: 1;
      display: flex;

      .column {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: calc(0.5 * var(--padding));
        padding: var(--padding);

        .title {
          display: flex;
          flex-wrap: wrap;
          gap: calc(0.5 * var(--padding));
          align-items: center;
          min-height: 30px;

          .left {
            flex: 1;
          }
        }

        .error-message {
          display: none;
          background: var(--error-color);
          color: white;
          border-radius: var(--border-radius);
          padding: calc(0.5 * var(--padding));
        }

        label.textarea {
          flex: 1;
          display: flex;
          flex-direction: column;

          textarea {
            flex: 1;
            border: var(--border);
            border-radius: 3px;
            resize: none;
            font-family: var(--mono-font-family);
            font-size: var(--mono-font-size);
            line-height: var(--mono-line-height);
          }
        }

        &.error {
          label.textarea {
            textarea {
              outline: 2px solid var(--error-color);
            }
          }

          .error-message {
            display: block;
          }
        }
      }
    }

    @media only screen and (max-width: 700px) {
      .columns {
        flex-direction: column;
        min-height: 700px;
      }
    }
  }
</style>
