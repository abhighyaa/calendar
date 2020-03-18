<script>
    import DaypickerNav from './DaypickerNav.svelte';
    import DaypickerBody from './DaypickerBody.svelte';

    export let selectedDate = new Date(), cb = () => {}, isDisabled = () => {}, target = '', closeCalOnOutsideClick=true, targetParent = '', onChangeMonth = () => {}, op = {};

    const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    let month = '', year = '';
    let checkDate = selectedDate && selectedDate instanceof Date;
    let configCal = (checkDate && new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
    let  avlArray = [];

    $: month = (checkDate && MONTHS[configCal.getMonth()]);
    $: year = checkDate && configCal.getFullYear();
    $: compareDateAndYear = year <= selectedDate.getFullYear() && configCal.getMonth() <= selectedDate.getMonth();

    function changeMonth(whichMonth) {
      window.extraInfo = [];
      avlArray = [];
      configCal = new Date(configCal.getFullYear(), configCal.getMonth()+whichMonth, 1);
      onChangeMonth(configCal.getMonth())
      // if(onChangeMonth){
      //   onChangeMonth(configCal.getMonth()).then(x => {
      //   avlArray = x;
      // });
    // }
      // onChangeMonth(configCal.getMonth()).then((results) => {
      //   console.info('here', results);
      // }); //begins from 0
      // checkAvl();
    }

    function selectDate(event) {
      let dateObj = new Date(year, configCal.getMonth(), event.detail.dateVal);
      selectedDate = dateObj;
      cb(dateObj);
      target.innerHTML = '';
    }

    // edit it TODO
    if (typeof window !== "undefined" && closeCalOnOutsideClick) {
      window.addEventListener('click', function(e) {
      if (target.contains(e.target) || (targetParent && targetParent.contains(e.target))) {
        // Clicked in box

      } else {
        // Clicked outside the box

        if (target.innerHTML.length > 0) {
          target.innerHTML = '';
        }
      }
    });
    }
    // onChangeMonth(configCal.getMonth());

  function updateAvl(arr) {
    avlArray = arr;
  }
  op.updateAvl = updateAvl;
    // const classType = document.querySelector('#classType');
    // if(classType && onChangeMonth) {
    //   classType.addEventListener('change', (e) => {
    //     window.extraInfo = [];
    //     avlArray = [];
    //     onChangeMonth(configCal.getMonth()).then(x => {
    //     avlArray = x;
    // });
    // });
    // }
    // function checkAvl() {
    //   let show = setInterval(() => {
    //   if(window.errorOnApi) clearInterval(show);
    //   if(window.extraInfo && window.extraInfo.length){
    //     avlArray = window.extraInfo;
    //     clearInterval(show);
    //   }
    // }, 1000);
    // }
    // checkAvl();

  </script>

  <div class='DayPicker'>
    <DaypickerNav {changeMonth}/>
    <DaypickerBody {month} {year} bind:configCal on:selectDate={selectDate} bind:selectedDate {isDisabled} {avlArray} />
  </div>

