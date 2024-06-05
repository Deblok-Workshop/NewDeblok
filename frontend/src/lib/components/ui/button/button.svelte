<script lang="js">
	// @ts-nocheck
	import { Button as ButtonPrimitive } from 'bits-ui';
	import { buttonVariants } from './index.ts';
	import { cn } from '$lib/utils.ts';

	//type $$Props = Props;
	//type $$Events = Events;

	let className = undefined;
	export let variant = 'default';
	export let size = 'default';
	export let builders = [];
	export { className as class };
</script>

<ButtonPrimitive.Root
	{builders}
	class={cn(buttonVariants({ variant, size, className }))}
	type="button"
	{...$$restProps}
	on:click
	on:keydown
>
	<slot />
</ButtonPrimitive.Root>
