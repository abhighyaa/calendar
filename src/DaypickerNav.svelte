<script>
  export let changeMonth;
</script>

<div class="DayPicker-NavBar">
  <span role="button" aria-label="Previous Month" class="DayPicker-NavButton DayPicker-NavButton--prev" on:click="{() => changeMonth(-1)}"></span>
  <span role="button" aria-label="Next Month" class="DayPicker-NavButton DayPicker-NavButton--next" on:click="{() => changeMonth(1)}"></span>
</div>
