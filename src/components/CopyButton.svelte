<script lang="ts">
  export let title: string
  export let data: string

  let copied = false
  const copiedDuration = 1000

  function handleCopy() {
    navigator.clipboard.writeText(data)
    copied = true
    setTimeout(() => (copied = false), copiedDuration)
  }
</script>

<button type="button" on:click={handleCopy} {title}>
  {copied ? 'Copied!' : 'Copy'}
</button>
