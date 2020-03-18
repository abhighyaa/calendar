<script>

    import DaypickerWeek from './DaypickerWeek.svelte';

    export let configCal, selectedDate, compareDateAndYear, isDisabled, avlArray;

    const days = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
    const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    let rows = [], year, month, firstDateOfMonth, totalNoOfDays, offset, totalEntriesWithOffset, maxRows, isPresentMonth, monthInWords;

     $:{
        year = configCal.getFullYear();
        month = configCal.getMonth();
        monthInWords = MONTHS[month];
        firstDateOfMonth = new Date(year, month, 1);
        totalNoOfDays = new Date(year, month+1, 0).getDate();
        offset = firstDateOfMonth.getDay();
        totalEntriesWithOffset = totalNoOfDays + offset;
        maxRows = Math.ceil(totalEntriesWithOffset/7);
        isPresentMonth = new Date().getMonth() === month && new Date().getFullYear() === year;
        compareDateAndYear = year === selectedDate.getFullYear() && month === selectedDate.getMonth();
        rows = new Array(maxRows);
      }
  </script>

  <div class="DayPicker-Month">
      <span class='DayPicker-Caption'>{monthInWords} {year}</span>
    <div class="DayPicker-Weekdays">

        <div class="DayPicker-WeekdaysRow">
          {#each days as day}
            <li class="DayPicker-Weekday db"><span title={day}>{day}</span></li>
          {/each}
        </div>
      </div>

      <div class="DayPicker-Body">
        {#each rows as row, index}
          <DaypickerWeek {row} {index} {totalEntriesWithOffset} {offset} bind:selectedDate {compareDateAndYear} {isDisabled} on:selectDate {year} {month} {avlArray} />
        {/each}
      </div>

  </div>