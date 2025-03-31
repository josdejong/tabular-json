<script lang="ts">
  interface Props {
    title: string
    data: string
  }

  const { title, data }: Props = $props()

  let copied = $state(false)
  const copiedDuration = 1000

  function handleCopy() {
    navigator.clipboard.writeText(data)
    copied = true
    setTimeout(() => (copied = false), copiedDuration)
  }
</script>

<button type="button" onclick={handleCopy} {title}>
  {copied ? 'Copied!' : 'Copy'}
</button>
