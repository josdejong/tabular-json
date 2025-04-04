<script lang="ts">
  import { faGithub } from '@fortawesome/free-brands-svg-icons'
  import Icon from 'svelte-awesome'

  interface Props {
    currentUrl: string
    className: string | undefined
  }

  const { currentUrl, className }: Props = $props()

  const items = [
    { text: 'Home', url: '/' },
    { text: 'Playground', url: '/playground' },
    { text: 'Specification', url: '/specification' }
  ]
</script>

<nav class={'menu ' + (className || '')}>
  <h1>
    <a href="/">
      <span>Tabular-JSON</span>
      <span class="sub-title">JSON with tables</span>
    </a>
  </h1>
  <ul>
    {#each items as item}
      <li>
        <a href={item.url} class={currentUrl === item.url ? 'selected' : undefined}>
          <span>{item.text}</span>
        </a>
      </li>
    {/each}
  </ul>
  <div class="space"></div>
  <a
    class="github"
    href="https://github.com/josdejong/tabular-json/"
    target="_blank"
    title="Source code on Github"
  >
    <Icon data={faGithub} scale={2} />
  </a>
</nav>

<style lang="scss">
  .menu {
    width: 100%;
    background: var(--theme-color);
    color: white;
    display: flex;
    justify-content: stretch;
    flex-wrap: wrap;

    h1 {
      display: flex;
      font-size: 20pt;
      padding: var(--margin);
      padding-right: calc(4 * var(--margin));
      margin: 0;

      a {
        display: flex;
        flex-direction: column;
        color: white;
        text-decoration: none;

        .sub-title {
          font-size: 10pt;
          font-weight: normal;
          letter-spacing: 2px;
          text-align: right;
        }
      }
    }

    ul {
      list-style-type: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: row;
      justify-content: stretch;
      gap: 1em;
      overflow: auto;

      li {
        padding: 0;
        margin: 0;
        display: flex;

        a {
          padding: var(--margin);
          color: white;
          text-decoration: none;
          display: flex;
          align-items: center;

          &:hover {
            background: rgba(255, 255, 255, 0.1);
          }

          &.selected {
            background: white;
            color: var(--color);
          }
        }
      }
    }

    .space {
      flex: 1;
    }

    .github {
      color: white;
      padding: 10px 20px;
      display: flex;
      align-items: center;
      text-decoration: none;

      &:hover {
        background: rgba(255, 255, 255, 0.1);
      }
    }

    &.playground {
      ul li a.selected {
        background: var(--sub-menu-background);
      }
    }
  }
</style>
