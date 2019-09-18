<script>
	export let placeholder = '';
	export let onSelection = () => {};
	import AutoSuggest from './components/AutoSuggest.svelte';
	let suggestions = [];
	let value = '';
	function onNewSearchQuery(e) {
		 if (suggestions.length !== 0 && value === e.target.value) {
      return null;
		}
		value = e.target.value;
		fetch(`https://voyager.goibibo.com/api/v2/trains_search/find_node_by_name/?search_query=${value}&limit=10&flavour=ios&vertical=GoRail`).then((resp) => {
			return resp.json();
		}).then((resp) => {
			suggestions = resp.data.r || [];
		})
	}

	// List item Markup Renderer
	function listItemMarkup(suggestion) {
		return (
			`<span class="textOverflow" title="${suggestion.dn},${suggestion.irctc_code}"><span>${suggestion.dn},</span><span class="fb">${suggestion.irctc_code}</span></span>`
		);
	}

	function suggestionClicked(event, suggestion, index) {
		value = suggestion.dn  + ',' + suggestion.irctc_code;
		suggestions = [];
		onSelection(suggestion);
	}
</script>
<style>
.textOverflow {
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
</style>
<AutoSuggest callback={onNewSearchQuery} {suggestions} {listItemMarkup} {value} {suggestionClicked} {placeholder}/>