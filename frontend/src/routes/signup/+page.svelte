<script lang="ts">
    import * as AlertDialog from "$lib/components/ui/alert-dialog";
    let open = true
  </script>

<AlertDialog.Root bind:open={open}>
    <AlertDialog.Trigger>Open</AlertDialog.Trigger>
    <AlertDialog.Content>
      <AlertDialog.Header>
        <AlertDialog.Title>Sign Up</AlertDialog.Title>
        <AlertDialog.Description>
          Lorem ipsum dolor sit amet consectetur adipisicing elit.
        </AlertDialog.Description>
      </AlertDialog.Header>
      <AlertDialog.Footer>
        <AlertDialog.Action>Sign Up</AlertDialog.Action>
        <a href="/login"><AlertDialog.Cancel>Log In</AlertDialog.Cancel></a>
      </AlertDialog.Footer>
    </AlertDialog.Content>
  </AlertDialog.Root>