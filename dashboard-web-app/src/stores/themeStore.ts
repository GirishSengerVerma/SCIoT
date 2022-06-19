import { browser } from "$app/env";
import { writable } from "svelte/store";

export const LIGHT_MODE = 'light';
export const DARK_MODE = 'dark';

const initialTheme = browser ? (document.documentElement.classList.contains('dark') ? DARK_MODE : LIGHT_MODE) : undefined;

export const theme = writable(initialTheme);

theme.subscribe((newTheme) => {
    if (browser && (newTheme === LIGHT_MODE || newTheme === DARK_MODE)) {
        localStorage.setItem('theme', newTheme);

        if (newTheme === DARK_MODE && !document.documentElement.classList.contains(DARK_MODE)) {
            document.documentElement.classList.add('dark');
        } else if (newTheme === LIGHT_MODE && document.documentElement.classList.contains(DARK_MODE)) {
            document.documentElement.classList.remove('dark');
        }
    }
});
