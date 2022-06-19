<script lang="ts">
	import { fly } from 'svelte/transition'
</script>

<svelte:head>
	<title>Dashboard | Start</title>
</svelte:head>

<main
	class="container"
	in:fly={{ x: -100, duration: 250, delay: 300 }}
	out:fly={{ x: -100, duration: 250 }}
>
	<h1 class="text-3xl font-bold underline">
		Hello world!
	</h1>

	<section class="hero">
		<h1 class="title">Dashboard 🖥️</h1>
		<p class="text">Monitor weather events and plan actions.</p>
	</section>

	<section class="login">
		<a class="btn" href="/home">🔥 Open the Dashboard</a>
	</section>
</main>
