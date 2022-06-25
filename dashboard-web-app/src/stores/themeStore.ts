import { browser } from "$app/env";
import { writable, type Writable } from "svelte/store";

export const LIGHT_MODE = 'light';
export const DARK_MODE = 'dark';

interface ThemeStore extends Writable<string | undefined> {
    switch(): void,
}

const themeStore = (initialTheme: string | undefined) : ThemeStore => {
    const store = writable(initialTheme);

    return {
        ...store,
        switch: () => store.update(currentTheme => currentTheme == LIGHT_MODE ? DARK_MODE : LIGHT_MODE),
    };
};

const initialTheme = browser ? (document.documentElement.classList.contains('dark') ? DARK_MODE : LIGHT_MODE) : undefined;

export const theme = themeStore(initialTheme);

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
