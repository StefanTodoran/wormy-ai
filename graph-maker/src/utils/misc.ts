export function randomInt(min: number, max: number) { // min inclusive, max exclusive
    return Math.max(min, Math.floor(Math.random() * max));
}

export function pickRandomListItem(arr: any[]) {
    return arr[randomInt(0, arr.length)];
}

// TODO: Load this from a JSON file generated with Python which contains sample email templates.
export const randomContents = [
    "Hello World",
    "Hi Mom",
    "Foo Bar Baz",
];

export function getButtonBehavior(func: () => void) {
    return {
        tabIndex: 0,
        onClick: func,
        onKeyDown: (evt: React.KeyboardEvent<HTMLElement>) => {
            if (evt.key === "Enter") func();
        },
    };
}