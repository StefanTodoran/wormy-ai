export function downloadAsJSON(data: any, filename: string) {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
    const downloader = document.getElementById("downloader") as HTMLAnchorElement;

    downloader.setAttribute("href", dataStr);
    downloader.setAttribute("download", `${filename}.json`);
    downloader.click();
}

export function triggerFileUpload() {
    const importer = document.getElementById("importer") as HTMLInputElement;
    importer.value = "";
    importer.click();
}

export function handleFileUpload(stateCallback: (fileData: any) => void) {
    const importer = document.getElementById("importer") as HTMLInputElement;
    const reader = new FileReader();

    function parseData(this: FileReader, event: ProgressEvent<FileReader>) {
        if (!event.target || !event.target.result) return;
        
        let json;
        if (typeof event.target.result === "string") {
            json = JSON.parse(event.target.result);
        } else {
            const data = new Uint8Array(event.target.result);
            json = String.fromCharCode(...data);
        }

        stateCallback(json);
    }

    reader.onload = parseData;
    reader.readAsText(importer.files![0]);
}
