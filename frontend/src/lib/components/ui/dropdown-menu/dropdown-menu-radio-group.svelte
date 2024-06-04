<script lang="ts">
	// @ts-nocheck
	import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";

	//type $$Props = DropdownMenuPrimitive.RadioGroupProps;

	export let value = undefined;
</script>

<DropdownMenuPrimitive.RadioGroup {...$$restProps} bind:value>
	<slot />
</DropdownMenuPrimitive.RadioGroup>
