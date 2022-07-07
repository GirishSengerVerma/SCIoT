<script lang="ts">
	export let text: string;
	export let clazz: string = '';
</script>

<h3 class={"w-fit text-md md:text-lg mb-3 pb-1 font-bold border-b-2 border-primary " + clazz}>
	{text}
</h3>
