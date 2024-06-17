<script lang="ts">
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	let open = true;
	import auth from '$lib/components/auth.ts';
	auth();
</script>

<AlertDialog.Root bind:open>
	<AlertDialog.Trigger class="auth-dialog-trigger">Open</AlertDialog.Trigger>
	<AlertDialog.Content class="shadow-lg shadow-black/30 p-0">
		<AlertDialog.Header class="p-6">
			<AlertDialog.Title>Sign Up</AlertDialog.Title>
			<AlertDialog.Description>
				<div class="flex w-full max-w-sm flex-col gap-1.5">
					<Label>Email</Label>
					<Input
						type="deblok_em"
						placeholder="hi@example.com"
						class="placeholder:text-muted-foreground/40"
					/>
					<Label class="mt-2">Username</Label>
					<Input
						type="deblok_usr"
						placeholder="johndoe1234"
						class="placeholder:text-muted-foreground/40"
					/>
					<Label
						class="mt-0.5 text-xs  text-muted-foreground/60 hover:text-muted-foreground duration-300"
						>Must be alphanumerical (including _ and .) and be between 3-24 characters.</Label
					>
					<Label class="mt-2">Password</Label>
					<Input
						type="deblok_pw"
						placeholder="************"
						class="placeholder:text-muted-foreground/40"
					/>
					<Label
						class="mt-0.5 text-xs  text-muted-foreground/60 hover:text-muted-foreground duration-300"
						>Must be 10 characters long, have 1 number, and 1 lowercase letter.</Label
					><br>
					<Label
						class="mt-0.5 text-xs  text-destructive-foreground/60 hover:text-destructive-foreground duration-300"
						><b>Security warning:</b>&nbsp;Do not use your browser's password manager as it is easy for malware to get it.</Label
					>
				</div>
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer class="bg-muted/30 p-4 border-t-2 border-muted/60">
			<AlertDialog.Action class="authtrigger">Sign Up</AlertDialog.Action>
			<a href="/login"><AlertDialog.Cancel>Log In</AlertDialog.Cancel></a>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
