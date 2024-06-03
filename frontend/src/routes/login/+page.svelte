<script>
import { Dialog, Button, TextField,SegmentedButtonContainer,SegmentedButtonItem } from "m3-svelte";
import { Login,Person_add } from "svelte-google-materialdesign-icons";
let open = true;
</script>
<Dialog icon={Login} headline="Login to Deblok" bind:open>
  Deleting the selected messages will also remove them from all synced devices.
  <svelte:fragment slot="buttons">
    <SegmentedButtonContainer>
        <input type="button" name="loginbtn" id="loginbtn" />
        <SegmentedButtonItem input="loginbtn" icon={Login}>Login</SegmentedButtonItem>
        <input type="button" name="signupbtn" id="signupbtn" />
        <SegmentedButtonItem input="signupbtn" icon={Person_add}>Signup</SegmentedButtonItem>
      </SegmentedButtonContainer>
  </svelte:fragment>
</Dialog>