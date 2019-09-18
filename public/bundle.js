
(function(l, i, v, e) { v = l.createElement(i); v.async = 1; v.src = '//' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; e = l.getElementsByTagName(i)[0]; e.parentNode.insertBefore(v, e)})(document, 'script');
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }
    class HtmlTag {
        constructor(html, anchor = null) {
            this.e = element('div');
            this.a = anchor;
            this.u(html);
        }
        m(target, anchor = null) {
            for (let i = 0; i < this.n.length; i += 1) {
                insert(target, this.n[i], anchor);
            }
            this.t = target;
        }
        u(html) {
            this.e.innerHTML = html;
            this.n = Array.from(this.e.childNodes);
        }
        p(html) {
            this.d();
            this.u(html);
            this.m(this.t, this.a);
        }
        d() {
            this.n.forEach(detach);
        }
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment) {
            $$.update($$.dirty);
            run_all($$.before_update);
            $$.fragment.p($$.dirty, $$.ctx);
            $$.dirty = null;
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        if (component.$$.fragment) {
            run_all(component.$$.on_destroy);
            component.$$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            component.$$.on_destroy = component.$$.fragment = null;
            component.$$.ctx = {};
        }
    }
    function make_dirty(component, key) {
        if (!component.$$.dirty) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty = blank_object();
        }
        component.$$.dirty[key] = true;
    }
    function init(component, options, instance, create_fragment, not_equal, prop_names) {
        const parent_component = current_component;
        set_current_component(component);
        const props = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props: prop_names,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty: null
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, props, (key, ret, value = ret) => {
                if ($$.ctx && not_equal($$.ctx[key], $$.ctx[key] = value)) {
                    if ($$.bound[key])
                        $$.bound[key](value);
                    if (ready)
                        make_dirty(component, key);
                }
                return ret;
            })
            : props;
        $$.update();
        ready = true;
        run_all($$.before_update);
        $$.fragment = create_fragment($$.ctx);
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, detail));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev("SvelteDOMSetProperty", { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    const CLASS_OPTIONS = [
      {
        name: 'All Class',
        value: 'All'
      },
      {
        name: 'AC First Class (1A)',
        value: '1A'
      },
      {
        name: 'AC 2 Tier (2A)',
        value: '2A'
      },
      {
        name: 'AC 3 Tier (3A)',
        value: '3A'
      },
      {
        name: 'AC Chair Car (CC)',
        value: 'CC'
      },
      {
        name: 'Sleeper (SL)',
        value: 'SL'
      },
      {
        name: 'Second Sitting (2S)',
        value: '2S'
      }
    ];

    /* src/components/AutoSuggest.svelte generated by Svelte v3.12.1 */

    const file = "src/components/AutoSuggest.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.suggestion = list[i];
    	child_ctx.index = i;
    	return child_ctx;
    }

    // (59:2) {#if suggestions.length > 0}
    function create_if_block(ctx) {
    	var div, ul;

    	let each_value = ctx.suggestions;

    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}
    			attr_dev(ul, "class", "suggestWrap posAbs svelte-16xd6ql");
    			add_location(ul, file, 60, 6, 1228);
    			attr_dev(div, "class", "posRel svelte-16xd6ql");
    			add_location(div, file, 59, 4, 1201);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}
    		},

    		p: function update(changed, ctx) {
    			if (changed.listItemMarkup || changed.suggestions) {
    				each_value = ctx.suggestions;

    				let i;
    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}
    				each_blocks.length = each_value.length;
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div);
    			}

    			destroy_each(each_blocks, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block.name, type: "if", source: "(59:2) {#if suggestions.length > 0}", ctx });
    	return block;
    }

    // (62:8) {#each suggestions as suggestion, index}
    function create_each_block(ctx) {
    	var li, html_tag, raw_value = ctx.listItemMarkup(ctx.suggestion) + "", t, dispose;

    	function click_handler(...args) {
    		return ctx.click_handler(ctx, ...args);
    	}

    	const block = {
    		c: function create() {
    			li = element("li");
    			t = space();
    			html_tag = new HtmlTag(raw_value, t);
    			attr_dev(li, "class", "suggestItem curPoint svelte-16xd6ql");
    			add_location(li, file, 62, 10, 1319);
    			dispose = listen_dev(li, "click", click_handler);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			html_tag.m(li);
    			append_dev(li, t);
    		},

    		p: function update(changed, new_ctx) {
    			ctx = new_ctx;
    			if ((changed.listItemMarkup || changed.suggestions) && raw_value !== (raw_value = ctx.listItemMarkup(ctx.suggestion) + "")) {
    				html_tag.p(raw_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(li);
    			}

    			dispose();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block.name, type: "each", source: "(62:8) {#each suggestions as suggestion, index}", ctx });
    	return block;
    }

    function create_fragment(ctx) {
    	var div, input, t, dispose;

    	var if_block = (ctx.suggestions.length > 0) && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			input = element("input");
    			t = space();
    			if (if_block) if_block.c();
    			attr_dev(input, "class", "autoSuggestInput svelte-16xd6ql");
    			input.value = ctx.value;
    			attr_dev(input, "placeholder", ctx.placeholder);
    			add_location(input, file, 57, 2, 1070);
    			attr_dev(div, "class", "autoSuggest svelte-16xd6ql");
    			add_location(div, file, 56, 0, 1042);

    			dispose = [
    				listen_dev(input, "keyup", ctx.callback),
    				listen_dev(input, "focus", ctx.callback)
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, input);
    			append_dev(div, t);
    			if (if_block) if_block.m(div, null);
    		},

    		p: function update(changed, ctx) {
    			if (changed.value) {
    				prop_dev(input, "value", ctx.value);
    			}

    			if (changed.placeholder) {
    				attr_dev(input, "placeholder", ctx.placeholder);
    			}

    			if (ctx.suggestions.length > 0) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div);
    			}

    			if (if_block) if_block.d();
    			run_all(dispose);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { suggestions = [], callback = (arg1) => {} } = $$props;
      let { suggestionClicked = (...arg) => {} } = $$props;
      let { listItemMarkup = (...arg) => {} } = $$props;
      let { value = '', placeholder = '' } = $$props;

    	const writable_props = ['suggestions', 'callback', 'suggestionClicked', 'listItemMarkup', 'value', 'placeholder'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<AutoSuggest> was created with unknown prop '${key}'`);
    	});

    	const click_handler = ({ suggestion, index }, e) => {suggestionClicked(e, suggestion, index);};

    	$$self.$set = $$props => {
    		if ('suggestions' in $$props) $$invalidate('suggestions', suggestions = $$props.suggestions);
    		if ('callback' in $$props) $$invalidate('callback', callback = $$props.callback);
    		if ('suggestionClicked' in $$props) $$invalidate('suggestionClicked', suggestionClicked = $$props.suggestionClicked);
    		if ('listItemMarkup' in $$props) $$invalidate('listItemMarkup', listItemMarkup = $$props.listItemMarkup);
    		if ('value' in $$props) $$invalidate('value', value = $$props.value);
    		if ('placeholder' in $$props) $$invalidate('placeholder', placeholder = $$props.placeholder);
    	};

    	$$self.$capture_state = () => {
    		return { suggestions, callback, suggestionClicked, listItemMarkup, value, placeholder };
    	};

    	$$self.$inject_state = $$props => {
    		if ('suggestions' in $$props) $$invalidate('suggestions', suggestions = $$props.suggestions);
    		if ('callback' in $$props) $$invalidate('callback', callback = $$props.callback);
    		if ('suggestionClicked' in $$props) $$invalidate('suggestionClicked', suggestionClicked = $$props.suggestionClicked);
    		if ('listItemMarkup' in $$props) $$invalidate('listItemMarkup', listItemMarkup = $$props.listItemMarkup);
    		if ('value' in $$props) $$invalidate('value', value = $$props.value);
    		if ('placeholder' in $$props) $$invalidate('placeholder', placeholder = $$props.placeholder);
    	};

    	return {
    		suggestions,
    		callback,
    		suggestionClicked,
    		listItemMarkup,
    		value,
    		placeholder,
    		click_handler
    	};
    }

    class AutoSuggest extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, ["suggestions", "callback", "suggestionClicked", "listItemMarkup", "value", "placeholder"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "AutoSuggest", options, id: create_fragment.name });
    	}

    	get suggestions() {
    		throw new Error("<AutoSuggest>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set suggestions(value) {
    		throw new Error("<AutoSuggest>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get callback() {
    		throw new Error("<AutoSuggest>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set callback(value) {
    		throw new Error("<AutoSuggest>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get suggestionClicked() {
    		throw new Error("<AutoSuggest>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set suggestionClicked(value) {
    		throw new Error("<AutoSuggest>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get listItemMarkup() {
    		throw new Error("<AutoSuggest>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set listItemMarkup(value) {
    		throw new Error("<AutoSuggest>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<AutoSuggest>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<AutoSuggest>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get placeholder() {
    		throw new Error("<AutoSuggest>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set placeholder(value) {
    		throw new Error("<AutoSuggest>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/AutoSuggestTrains.svelte generated by Svelte v3.12.1 */

    function create_fragment$1(ctx) {
    	var current;

    	var autosuggest = new AutoSuggest({
    		props: {
    		callback: ctx.onNewSearchQuery,
    		suggestions: ctx.suggestions,
    		listItemMarkup: listItemMarkup,
    		value: ctx.value,
    		suggestionClicked: ctx.suggestionClicked,
    		placeholder: ctx.placeholder
    	},
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			autosuggest.$$.fragment.c();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			mount_component(autosuggest, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var autosuggest_changes = {};
    			if (changed.suggestions) autosuggest_changes.suggestions = ctx.suggestions;
    			if (changed.value) autosuggest_changes.value = ctx.value;
    			if (changed.placeholder) autosuggest_changes.placeholder = ctx.placeholder;
    			autosuggest.$set(autosuggest_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(autosuggest.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(autosuggest.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(autosuggest, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$1.name, type: "component", source: "", ctx });
    	return block;
    }

    function listItemMarkup(suggestion) {
    	return (
    		`<span class="textOverflow" title="${suggestion.dn},${suggestion.irctc_code}"><span>${suggestion.dn},</span><span class="fb">${suggestion.irctc_code}</span></span>`
    	);
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { placeholder = '', onSelection = () => {} } = $$props;
    	let suggestions = [];
    	let value = '';
    	function onNewSearchQuery(e) {
    		 if (suggestions.length !== 0 && value === e.target.value) {
          return null;
    		}
    		$$invalidate('value', value = e.target.value);
    		fetch(`https://voyager.goibibo.com/api/v2/trains_search/find_node_by_name/?search_query=${value}&limit=10&flavour=ios&vertical=GoRail`).then((resp) => {
    			return resp.json();
    		}).then((resp) => {
    			$$invalidate('suggestions', suggestions = resp.data.r || []);
    		});
    	}

    	function suggestionClicked(event, suggestion, index) {
    		$$invalidate('value', value = suggestion.dn  + ',' + suggestion.irctc_code);
    		$$invalidate('suggestions', suggestions = []);
    		onSelection(suggestion);
    	}

    	const writable_props = ['placeholder', 'onSelection'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<AutoSuggestTrains> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('placeholder' in $$props) $$invalidate('placeholder', placeholder = $$props.placeholder);
    		if ('onSelection' in $$props) $$invalidate('onSelection', onSelection = $$props.onSelection);
    	};

    	$$self.$capture_state = () => {
    		return { placeholder, onSelection, suggestions, value };
    	};

    	$$self.$inject_state = $$props => {
    		if ('placeholder' in $$props) $$invalidate('placeholder', placeholder = $$props.placeholder);
    		if ('onSelection' in $$props) $$invalidate('onSelection', onSelection = $$props.onSelection);
    		if ('suggestions' in $$props) $$invalidate('suggestions', suggestions = $$props.suggestions);
    		if ('value' in $$props) $$invalidate('value', value = $$props.value);
    	};

    	return {
    		placeholder,
    		onSelection,
    		suggestions,
    		value,
    		onNewSearchQuery,
    		suggestionClicked
    	};
    }

    class AutoSuggestTrains extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, ["placeholder", "onSelection"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "AutoSuggestTrains", options, id: create_fragment$1.name });
    	}

    	get placeholder() {
    		throw new Error("<AutoSuggestTrains>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set placeholder(value) {
    		throw new Error("<AutoSuggestTrains>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onSelection() {
    		throw new Error("<AutoSuggestTrains>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onSelection(value) {
    		throw new Error("<AutoSuggestTrains>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/DropDown.svelte generated by Svelte v3.12.1 */

    const file$1 = "src/components/DropDown.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.value = list[i].value;
    	child_ctx.name = list[i].name;
    	child_ctx.index = i;
    	return child_ctx;
    }

    // (17:2) {#each options as {value, name}
    function create_each_block$1(ctx) {
    	var option, t_value = ctx.name + "", t, option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = ctx.value;
    			option.value = option.__value;
    			add_location(option, file$1, 17, 4, 305);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.options) && t_value !== (t_value = ctx.name + "")) {
    				set_data_dev(t, t_value);
    			}

    			if ((changed.options) && option_value_value !== (option_value_value = ctx.value)) {
    				prop_dev(option, "__value", option_value_value);
    			}

    			option.value = option.__value;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(option);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block$1.name, type: "each", source: "(17:2) {#each options as {value, name}", ctx });
    	return block;
    }

    function create_fragment$2(ctx) {
    	var select, dispose;

    	let each_value = ctx.options;

    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}
    			attr_dev(select, "class", "svelte-k6cphu");
    			add_location(select, file$1, 15, 0, 229);
    			dispose = listen_dev(select, "change", ctx.onChange);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, select, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}
    		},

    		p: function update(changed, ctx) {
    			if (changed.options) {
    				each_value = ctx.options;

    				let i;
    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}
    				each_blocks.length = each_value.length;
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(select);
    			}

    			destroy_each(each_blocks, detaching);

    			dispose();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$2.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { options = [], value = '', onChange = function (e) {
      
      } } = $$props;

    	const writable_props = ['options', 'value', 'onChange'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<DropDown> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('options' in $$props) $$invalidate('options', options = $$props.options);
    		if ('value' in $$props) $$invalidate('value', value = $$props.value);
    		if ('onChange' in $$props) $$invalidate('onChange', onChange = $$props.onChange);
    	};

    	$$self.$capture_state = () => {
    		return { options, value, onChange };
    	};

    	$$self.$inject_state = $$props => {
    		if ('options' in $$props) $$invalidate('options', options = $$props.options);
    		if ('value' in $$props) $$invalidate('value', value = $$props.value);
    		if ('onChange' in $$props) $$invalidate('onChange', onChange = $$props.onChange);
    	};

    	return { options, value, onChange };
    }

    class DropDown extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, ["options", "value", "onChange"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "DropDown", options, id: create_fragment$2.name });
    	}

    	get options() {
    		throw new Error("<DropDown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set options(value) {
    		throw new Error("<DropDown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<DropDown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<DropDown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onChange() {
    		throw new Error("<DropDown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onChange(value) {
    		throw new Error("<DropDown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const keyCodes = {
      left: 37,
      up: 38,
      right: 39,
      down: 40,
      pgup: 33,
      pgdown: 34,
      enter: 13,
      escape: 27,
      tab: 9
    };

    const keyCodesArray = Object.keys(keyCodes).map(k => keyCodes[k]);

    /* src/App.svelte generated by Svelte v3.12.1 */

    const file$2 = "src/App.svelte";

    // (99:2) {#if showError}
    function create_if_block$1(ctx) {
    	var div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Fill in the Details";
    			attr_dev(div, "class", "error svelte-qsvw3m");
    			add_location(div, file$2, 99, 3, 2310);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block$1.name, type: "if", source: "(99:2) {#if showError}", ctx });
    	return block;
    }

    function create_fragment$3(ctx) {
    	var div1, div0, t0, t1, input, t2, t3, button, t5, current, dispose;

    	var autosuggesttrains0 = new AutoSuggestTrains({
    		props: {
    		placeholder: 'Source',
    		onSelection: ctx.func
    	},
    		$$inline: true
    	});

    	var autosuggesttrains1 = new AutoSuggestTrains({
    		props: {
    		placeholder: 'Destination',
    		onSelection: ctx.func_1
    	},
    		$$inline: true
    	});

    	var dropdown = new DropDown({
    		props: {
    		options: CLASS_OPTIONS,
    		onChange: ctx.onClassChange
    	},
    		$$inline: true
    	});

    	var if_block = (ctx.showError) && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			autosuggesttrains0.$$.fragment.c();
    			t0 = space();
    			autosuggesttrains1.$$.fragment.c();
    			t1 = space();
    			input = element("input");
    			t2 = space();
    			dropdown.$$.fragment.c();
    			t3 = space();
    			button = element("button");
    			button.textContent = "Search";
    			t5 = space();
    			if (if_block) if_block.c();
    			attr_dev(input, "class", "dateInput svelte-qsvw3m");
    			attr_dev(input, "type", "date");
    			input.value = ctx.date;
    			add_location(input, file$2, 95, 2, 2080);
    			attr_dev(button, "class", "search svelte-qsvw3m");
    			add_location(button, file$2, 97, 2, 2226);
    			attr_dev(div0, "class", "pad25 svelte-qsvw3m");
    			add_location(div0, file$2, 92, 1, 1849);
    			attr_dev(div1, "class", "blueBanner svelte-qsvw3m");
    			add_location(div1, file$2, 90, 0, 1748);

    			dispose = [
    				listen_dev(input, "change", ctx.handleDateChange),
    				listen_dev(button, "click", ctx.beginSearch)
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			mount_component(autosuggesttrains0, div0, null);
    			append_dev(div0, t0);
    			mount_component(autosuggesttrains1, div0, null);
    			append_dev(div0, t1);
    			append_dev(div0, input);
    			append_dev(div0, t2);
    			mount_component(dropdown, div0, null);
    			append_dev(div0, t3);
    			append_dev(div0, button);
    			append_dev(div0, t5);
    			if (if_block) if_block.m(div0, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (!current || changed.date) {
    				prop_dev(input, "value", ctx.date);
    			}

    			if (ctx.showError) {
    				if (!if_block) {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(div0, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(autosuggesttrains0.$$.fragment, local);

    			transition_in(autosuggesttrains1.$$.fragment, local);

    			transition_in(dropdown.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(autosuggesttrains0.$$.fragment, local);
    			transition_out(autosuggesttrains1.$$.fragment, local);
    			transition_out(dropdown.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div1);
    			}

    			destroy_component(autosuggesttrains0);

    			destroy_component(autosuggesttrains1);

    			destroy_component(dropdown);

    			if (if_block) if_block.d();
    			run_all(dispose);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$3.name, type: "component", source: "", ctx });
    	return block;
    }

    let dateChosen = false;

    function instance$3($$self, $$props, $$invalidate) {
    	

    	let source = null;
    	let destination = '';
    	let travelClass = 'All';
    	let date = '';
    	let showError = false;

    	function onSuggesSelection(val, position) {
    		if (position === 'src') {
    			source = val;
    		} else {
    			destination = val;
    		}
    		console.log('src', source, 'des', destination);
    	}

    	function handleDateChange(e) {
    		$$invalidate('date', date = e.target.value);
    	}

    	function onClassChange(e) {
    		travelClass = e.target.value;
    	}

    	function beginSearch() {
    		if (!source || !destination || !travelClass || !date) {
    			$$invalidate('showError', showError = true);
    			return;
    		}
    		$$invalidate('showError', showError = false);
    		window.open(`https://www.goibibo.com/trains/results?src=${source.irctc_code}&dst=${destination.irctc_code}&date=${date.split('-').join('')}&class=${travelClass}&srcname=${source.dn}&dstname=${destination.dn}`);
    	}

    	const func = (val) => { onSuggesSelection(val, 'src');};

    	const func_1 = (val) => { onSuggesSelection(val, 'des');};

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ('source' in $$props) source = $$props.source;
    		if ('destination' in $$props) destination = $$props.destination;
    		if ('travelClass' in $$props) travelClass = $$props.travelClass;
    		if ('date' in $$props) $$invalidate('date', date = $$props.date);
    		if ('dateChosen' in $$props) dateChosen = $$props.dateChosen;
    		if ('showError' in $$props) $$invalidate('showError', showError = $$props.showError);
    	};

    	return {
    		date,
    		showError,
    		onSuggesSelection,
    		handleDateChange,
    		onClassChange,
    		beginSearch,
    		func,
    		func_1
    	};
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "App", options, id: create_fragment$3.name });
    	}
    }

    var app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
