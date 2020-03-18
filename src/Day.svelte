<script>
    import { createEventDispatcher, onMount } from 'svelte';

    export let initialJ, cIndex, offset, index, selectedDate, compareDateAndYear, isDisabled, month, year, avlArray;

    const dispatch = createEventDispatcher();
    let selectedDateVal, addClass, dateVal, disable = false;

    $: selectedDateVal = selectedDate.getDate();
    $: dateVal = initialJ + cIndex + 1 - offset;
    $: addClass = (compareDateAndYear && (selectedDateVal === dateVal ? 'DayPicker-Day--selected' : '') || (isDisabled(new Date(year, month, dateVal)) ? ' DayPicker-Day--disabled' : ''))
    function selectDate(dateVal) {
      dispatch('selectDate', {
        dateVal
      });
    }

    function prefix(val) {
      return val < 10 ? '0' + val : val;
    }

    $: properdate = year+prefix(month+1)+prefix(dateVal);
    $: if(dateVal > 0 &&avlArray.length > dateVal && avlArray[dateVal-1]) {
      // console.info('avlArray[dateVal-1].match(/^[\s\S]*class="([a-zA-Z]*)"[\s\S]*$/m)',avlArray[dateVal-1].match(/^[\s\S]*class="([a-zA-Z]*)"[\s\S]*$/m));
      let x = avlArray[dateVal-1].class || '';
      disable = x && x[1] === 'disabled';
    }
    $: if(addClass === 'DayPicker-Day--selected' && avlArray[dateVal-1]) {
      avlArray[dateVal-1].style = avlArray[dateVal-1].style ? avlArray[dateVal-1].style+"color: white !important;" : "color: white !important;";
    }
  </script>

  {#if dateVal<=0}
    <div class="DayPicker-Day DayPicker-Day--disabled DayPicker-Day--outside"></div>
  {:else}
    <div class="{'DayPicker-Day '+ addClass}" style="position: relative;" on:click="{() => {if(!disable){selectDate(dateVal)}}}">{dateVal}
     {#if avlArray.length} <br/>
     <span class="{(avlArray[dateVal-1] && avlArray[dateVal-1].class) || ''}" style="{(avlArray[dateVal-1] && avlArray[dateVal-1].style) || ''}">{(avlArray[dateVal-1] && avlArray[dateVal-1].text) || ''}</span>
     {/if}
  </div>
  {/if}
