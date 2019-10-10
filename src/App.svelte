<script>
	import {CLASS_OPTIONS}  from './constants.js';
	import AutoSuggestTrains from './AutoSuggestTrains.svelte';
	import DropDown from './components/DropDown.svelte';

	let source = null;
	let destination = '';
	let travelClass = 'All';
	let date = '';
	let dateChosen = false;
	let showError = false;

	function onSuggesSelection(val, position) {
		if (position === 'src') {
			source = val;
		} else {
			destination = val;
		}
	}

	function onClassChange(e) {
		travelClass = e.target.value;
	}

	function beginSearch() {
		if (!source || !destination || !travelClass || !date) {
			showError = true;
			return;
		}
		showError = false;
		window.open(`https://www.goibibo.com/trains/results?src=${source.irctc_code}&dst=${destination.irctc_code}&date=${date.split('-').join('')}&class=${travelClass}&srcname=${source.dn}&dstname=${destination.dn}`);
	}
</script>
<style>
	.white {
		color: white;
	}
	.dblock {
		display: block;
	}
	.textCenter {
		text-align: center;
	}
	.fb {
    font-weight: bold;
  }
	.blueBanner {
		min-height: 100px;
		background: #2276e3;
		border-radius: 5px;
	}
	body {
		margin: 0px;
		padding: 0px;
	}
	.search {
		background: #f26722;
    color: #fff;
    padding: 8px 45px;
    border-radius: 5px;
    margin: 5px 10px;
		cursor: pointer;
	}
	.dateInput {
		height: 34px;
    margin-top: 8px;
    margin-right: 20px;
	}
	.header {
		font-size: 24px;
    padding: 10px 22px;
	}
	.error {
		color: red;
    background: white;
    width: 150px;
    border-radius: 3px;
    padding: 2px 10px;
    margin-left: 20px;
	}
	.pad25 {
		padding: 25px;
	}
</style>
<div class="blueBanner">
	<div class="pad25">
		<AutoSuggestTrains placeholder={'Source'} onSelection={(val) => { onSuggesSelection(val, 'src')}}/>
		<AutoSuggestTrains placeholder={'Destination'} onSelection={(val) => { onSuggesSelection(val, 'des')}}/>
		<input class="dateInput" type="date" bind:value={date}/>
		<DropDown options={CLASS_OPTIONS} onChange={onClassChange}/>
		<button class="search" on:click={beginSearch}>Search</button>
		{#if showError} 
			<div class="error">Fill in the Details</div>
		{/if}
	</div>
</div>
