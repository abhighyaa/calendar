<script>
    export let index, row, totalEntriesWithOffset, offset, selectedDate, compareDateAndYear, isDisabled, year, month, avlArray;

    import Day from './Day.svelte';

    let columns = [], initialJ, currentRowMaxLength, colLength;
    $:{
      initialJ = index * 7;
      currentRowMaxLength = (index+1) * 7;
      colLength = currentRowMaxLength < totalEntriesWithOffset ? 7 : (7 - (currentRowMaxLength - totalEntriesWithOffset));
      columns = new Array(colLength);
    }
  </script>

  <div class="DayPicker-Week">
    {#each columns as column, cIndex}
      <Day {cIndex} {initialJ} {offset} {index} bind:selectedDate {compareDateAndYear} {isDisabled} on:selectDate {year} {month} {avlArray} />
    {/each}
  </div>
