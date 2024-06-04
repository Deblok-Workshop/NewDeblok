<script>
    import "../app.css"
    import { EllipsisVertical,Menu,Settings } from "lucide-svelte";
    import { Button } from "$lib/components/ui/button";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
</script>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap" />

<div class="top-app-bar">
 <img src="./assets/favicon.png" class="w-10 mr-4" alt="Deblok"/>
 <a href={undefined} >
<Button variant="outline" class="p-2 border-0"> 
  <Menu />
</Button>
</a>
<span class="ml-auto">
  <a href={undefined} >
    <Button variant="outline" class="p-2 border-0"> 
      <Settings />
    </Button>
    </a>
    
<DropdownMenu.Root>
  <DropdownMenu.Trigger asChild let:builder>
    <Button builders={[builder]} variant="outline" class="p-2 border-none" >
    <EllipsisVertical />
    </Button>
  </DropdownMenu.Trigger>
  <DropdownMenu.Content class="w-48">
    hi guys welcome to my youtube channel
    </DropdownMenu.Content>
    </DropdownMenu.Root>
    
</span>

</div> 
<break class="block w-full h-20"></break>
<slot />
