<script>
  export let suggestions = [];
  export let callback = (arg1) => {};
  export let suggestionClicked = (...arg) => {};
  export let listItemMarkup = (...arg) => {};
  export let value = '';
  export let placeholder = '';

</script>

<style>
  .autoSuggest {
    display: inline-block;
    margin: 20px;
  }
  .autoSuggest li.suggestItem {
    list-style-type: none;
    padding: 10px;
  }
  .autoSuggest input.autoSuggestInput {
    width: 250px;
    margin-bottom: 0px;
  }
  .autoSuggest input.autoSuggestInput:focus {
    outline: none;
  }
  .autoSuggest ul.suggestWrap {
    position: absolute;
    background: #f7f7f7;
    color: black;
    padding: 10px;
    border-radius: 5px;
    box-shadow: 2px 2px 5px #e4e4e4;
    margin: 0;
    width: 270px;
  }

  .posRel {
    position: relative;
  }
  .posAbs {
    position: absolute;
    top: 0;
  }
  .curPoint {
    cursor: pointer;
  }
  .fb {
    font-weight: bold;
  }
  .textOverflow {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
<div class="autoSuggest">
  <input class="autoSuggestInput" {value} on:keyup={callback} on:focus={callback} {placeholder}/>
  {#if suggestions.length > 0}
    <div class="posRel">
      <ul class="suggestWrap posAbs">
        {#each suggestions as suggestion, index}
          <li class="suggestItem curPoint" on:click={(e) => {suggestionClicked(e, suggestion, index)}}>
            {@html listItemMarkup(suggestion)}
          </li>
        {/each}
      </ul>
    </div>
  {/if}
</div>
