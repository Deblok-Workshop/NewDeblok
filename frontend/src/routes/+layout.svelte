<script>
    import "../app.css"
    import { EllipsisVertical,Menu,Settings } from "lucide-svelte";
    import { Button } from "$lib/components/ui/button";
</script>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap" />

<div class="top-app-bar">
 <img src="./assets/favicon.png" class="w-10 mr-4" alt="Deblok"/>
 <a href={undefined} >
<Button variant="ghost" class="p-2 duration-300"> 
  <Menu />
</Button>
</a>
</div> 
<break class="block w-full h-20"></break>
<slot />
