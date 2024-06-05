<script lang="ts">
    import * as AlertDialog from "$lib/components/ui/alert-dialog";
    import { Label } from "$lib/components/ui/label";
    import { Input } from "$lib/components/ui/input";
    let open = true
    import "$lib/components/auth.ts";
  </script>

<AlertDialog.Root bind:open={open}>
    <AlertDialog.Trigger class="auth-dialog-trigger">Open</AlertDialog.Trigger>
    <AlertDialog.Content class="shadow-lg shadow-black/30 p-0">
      <AlertDialog.Header class="p-6">
        <AlertDialog.Title>Sign Up</AlertDialog.Title>
        <AlertDialog.Description>
          <div class="flex w-full max-w-sm flex-col gap-1.5">
            <Label>Email</Label>
            <Input type="email" placeholder="hi@example.com" class="placeholder:text-muted-foreground/40" />
            <Label class="mt-2">Username</Label>
            <Input type="username" placeholder="johndoe1234"  class="placeholder:text-muted-foreground/40"/>
            <Label class="mt-2">Password</Label>
            <Input type="password" placeholder="************"  class="placeholder:text-muted-foreground/40" />
            <Label class="mt-0.5 text-xs  text-muted-foreground/60 hover:text-muted-foreground duration-300">Must be 10 characters long, have 1 number, and 1 lowercase letter.</Label>
          </div>
        </AlertDialog.Description>
      </AlertDialog.Header>
      <AlertDialog.Footer class="bg-muted/30 p-4 border-t-2 border-muted/60">
        <AlertDialog.Action class="authtrigger">Sign Up</AlertDialog.Action>
        <a href="/login"><AlertDialog.Cancel>Log In</AlertDialog.Cancel></a>
      </AlertDialog.Footer>
    </AlertDialog.Content>

  </AlertDialog.Root>