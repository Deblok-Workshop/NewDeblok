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
			<AlertDialog.Title>Log In</AlertDialog.Title>
			<AlertDialog.Description>
				<div class="flex w-full max-w-sm flex-col gap-1.5">
					<Label>Username</Label>
					<Input
						type="deblok_usr"
						placeholder="johndoe1234"
						class="placeholder:text-muted-foreground/40"
					/>

					<Label class="mt-2">Password</Label>

					<Input
						type="deblok_pw"
						placeholder="************"
						class="placeholder:text-muted-foreground/40"
					/>
				</div>
				<br>
				<Label
						class="mt-0.5 text-xs  text-destructive/60 hover:text-destructive duration-300 security_warning"
						><b>Security warning:</b>&nbsp;Do not use your browser's password manager as it is easy for malware to get all your passwords.</Label
					>
				<br />
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer class="mt-2 bg-muted/30 p-4 border-t-2 border-muted/60">
			<AlertDialog.Action class="authtrigger">Log In</AlertDialog.Action>
			<a href="/signup"><AlertDialog.Cancel>Sign Up</AlertDialog.Cancel></a>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
