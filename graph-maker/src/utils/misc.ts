import { Point } from "./types";

/**
 * Min is inclusive, max is exclusive.
 */
export function randomInt(min: number, max: number) {
    return Math.max(min, Math.floor(Math.random() * max));
}

/**
 * @param arr Array to select a random item from.
 * @param excl Array of items to exclude as possible choices.
 * @param eql Whether to convert `arr` to a set first for equal weight.
 */
export function pickRandomListItem<T>(arr: T[], excl: T[] = [], eql?: boolean): T {
    const _arr = eql ? [...new Set(arr)] : arr;
    const filtered = _arr.filter(item => !excl.includes(item));
    return filtered[randomInt(0, filtered.length)];
}

/**
 * Generates a string of random numbers of length n. Source:
 * https://stackoverflow.com/questions/21816595/how-to-generate-a-random-number-of-fixed-length-using-javascript
 */
function generateRandomNumberString(n: number): string {
    let add = 1, max = 12 - add; // 12 is the min safe number Math.random() can generate without it starting to pad the end with zeros.   

    if (n > max) {
        return generateRandomNumberString(max) + generateRandomNumberString(n - max);
    }

    max = Math.pow(10, n + add);
    const min = max / 10; // Math.pow(10, n) basically
    const number = Math.floor(Math.random() * (max - min + 1)) + min;

    return ("" + number).substring(add);
}

export function randomEmailAddress(name: string, domains: string[], existing?: string[]) {
    const newAddress = generateEmailAddress(
        name,
        Math.random() > 0.5,
        Math.random() > 0.85,
        Math.random() > 0.85,
        pickRandomListItem(["", "-", "_", "."]),
        randomInt(0, 5),
    ) + "@" + pickRandomListItem(domains);

    if (existing && existing.includes(newAddress)) {
        return newAddress.replace("@", randomInt(0, 10).toString());
    }

    return newAddress;
}

function generateEmailAddress(
    name: string,
    useBothNames: boolean,
    abbreviateFirstName: boolean,
    abbreviateLastName: boolean,
    useSeperator: string,
    numberOfNumbers: number,
) {
    const parts = name.split(" ");
    parts.push("");
    let fname = parts[0];
    let lname = parts[1];

    if (abbreviateFirstName) fname = fname[0];
    if (abbreviateLastName) lname = lname[0];

    const numbers = generateRandomNumberString(numberOfNumbers);

    if (useBothNames) return fname + useSeperator + lname + numbers;

    if (Math.random() > 0.5)
        return lname + useSeperator + numbers;
    else
        return fname + useSeperator + numbers;
}

export function getFilledOutTemplate(template: string, senderName: string, recipientName: string) {
    let content = template;
    content = content.replace(new RegExp("\\<SENDER_NAME>", "g"), senderName);
    content = content.replace(new RegExp("\\<RECIPIENT_NAME>", "g"), recipientName);
    return content;
}

export function getButtonBehavior(func: () => void) {
    return {
        tabIndex: 0,
        onClick: func,
        onKeyDown: (evt: React.KeyboardEvent<HTMLElement>) => {
            if (evt.key === "Enter") func();
        },
    };
}

export function getCanvasCoordinates(canvas: HTMLCanvasElement, mousePos: Point) {
    const rect = canvas.getBoundingClientRect();
    const adjustedMouseX = mousePos.x - rect.left;
    const adjustedMouseY = mousePos.y - rect.top;

    return { x: adjustedMouseX, y: adjustedMouseY };
}

export function isMouseOverCircle(
    canvas: HTMLCanvasElement,
    mousePos: Point,
    circleCenter: Point,
    radiusSize: number
): boolean {
    const adjustedPos = getCanvasCoordinates(canvas, mousePos);

    const distX = adjustedPos.x - circleCenter.x;
    const distY = adjustedPos.y - circleCenter.y;
    const distance = Math.sqrt(distX * distX + distY * distY);

    return distance <= radiusSize;
}

/**
 * Returns the index of the last element in the array where predicate is true, and -1 otherwise.
 * @param array The source array to search in.
 * @param predicate Calls predicate once for each element of the array, in descending
 * order, until it finds one where predicate returns true. If such an element is found,
 * findLastIndex immediately returns that element index. Otherwise, findLastIndex returns -1.
 */
export function findLastIndex<T>(array: Array<T>, predicate: (value: T, index: number, obj: T[]) => boolean): number {
    let l = array.length;
    while (l--) {
        if (predicate(array[l], l, array))
            return l;
    }
    return -1;
}

export function isDarkMode() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
}