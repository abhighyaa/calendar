<script>
  export let options = [];
  export let value = '';
  export let onChange = function (e) {
  
  }
</script>
<style>
  select {
    height: 34px;
    font-size: 14px;
    line-height: 1;
    margin-top: 8px;
  }
</style>
<select on:change={onChange}>
  {#each options as {value, name}, index}
    <option {value}>{name}</option>
  {/each}
</select>