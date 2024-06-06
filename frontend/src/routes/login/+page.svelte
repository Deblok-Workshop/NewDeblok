<script lang="ts">
    import * as AlertDialog from "$lib/components/ui/alert-dialog";
    import { Label } from "$lib/components/ui/label";
    import { Input } from "$lib/components/ui/input";
    let open = true
    import auth from "$lib/components/auth.ts";
    auth();
  </script>

<AlertDialog.Root bind:open={open}>
    <AlertDialog.Trigger class="auth-dialog-trigger">Open</AlertDialog.Trigger>
    <AlertDialog.Content class="shadow-lg shadow-black/30 p-0">
      <AlertDialog.Header class="p-6">
        <AlertDialog.Title>Log In</AlertDialog.Title>
        <AlertDialog.Description>
            <div class="flex w-full max-w-sm flex-col gap-1.5">
                <Label>Username</Label>
                <Input type="username" placeholder="johndoe1234" class="placeholder:text-muted-foreground/40" />
                
                <Label class="mt-2">Password</Label>
                
                <Input type="password" placeholder="************" class="placeholder:text-muted-foreground/40"/>
                
              </div>
              <br>
        </AlertDialog.Description>
      </AlertDialog.Header>
      <AlertDialog.Footer class="mt-2 bg-muted/30 p-4 border-t-2 border-muted/60">
        <AlertDialog.Action class="authtrigger">Log In</AlertDialog.Action>
        <a href="/signup"><AlertDialog.Cancel>Sign Up</AlertDialog.Cancel></a>
      </AlertDialog.Footer>
    </AlertDialog.Content>
  </AlertDialog.Root>