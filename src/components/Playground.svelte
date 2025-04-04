<script lang="ts">
  import { stringify, parse } from '../scripts/lib'
  import { example1, example2, example3, example4 } from './examples.ts'

  const indentation = 2
  let json = $state('')
  let jsonError: string | undefined = $state(undefined)
  let tabularJson = $state('')
  let tabularJsonError: string | undefined = $state(undefined)

  const size = $derived(updateSize({ json, jsonError, tabularJson, tabularJsonError }))

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
    <button type="button" onclick={() => initialize(example1)}>example1</button>
    <button type="button" onclick={() => initialize(example2)}>example2</button>
    <button type="button" onclick={() => initialize(example3)}>example3</button>
    <button type="button" onclick={() => initialize(example4)}>example4</button>
  </div>
  <div class="columns">
    <div class="column" class:error={!!jsonError}>
      <div class="title">
        <div class="left">
          <h2>JSON</h2>
        </div>
        <button type="button" onclick={() => beautifyJson()}>Beautify</button>
        <button type="button" onclick={() => smartBeautifyJson()}>Smart Beautify</button>
        <button type="button" onclick={() => minifyJson()}>Minify</button>
      </div>
      <label class="textarea">
        <textarea bind:value={json} oninput={() => updateJson()} spellcheck="false"></textarea>
      </label>
      <div class="error-message">{jsonError}</div>
      <div>{size.jsonSize}</div>
    </div>
    <div class="column" class:error={!!tabularJsonError}>
      <div class="title">
        <div class="left">
          <h2>Tabular-JSON</h2>
        </div>
        <button type="button" onclick={() => beautifyTabularJson()}>Beautify</button>
        <button type="button" onclick={() => minifyTabularJson()}>Minify</button>
      </div>
      <label class="textarea">
        <textarea
          bind:value={tabularJson}
          oninput={() => updateTabularJson()}
          spellcheck="false"
          wrap="off"
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
