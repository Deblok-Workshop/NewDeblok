<script lang="ts">
	import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';
	import { cn, flyAndScale } from '$lib/utils.ts';

	//type $$Props = DropdownMenuPrimitive.ContentProps;
	//type $$Events = DropdownMenuPrimitive.ContentEvents;

	let className = undefined;
	export let sideOffset = 4;
	export let transition = flyAndScale;
	export let transitionConfig = undefined;
	export { className as class };
</script>

<DropdownMenuPrimitive.Content
	{transition}
	{transitionConfig}
	{sideOffset}
	class={cn(
		'z-50 min-w-[8rem] rounded-md border bg-popover p-1 text-popover-foreground shadow-md focus:outline-none',
		className
	)}
	{...$$restProps}
	on:keydown
>
	<slot />
</DropdownMenuPrimitive.Content>
