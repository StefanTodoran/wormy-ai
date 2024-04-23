export interface EmailData {
    sender: string,
    recipient: string,
    content: string,
}

export interface Email {
    sender: string,
    recipient: string,
    content: string,
    order: number,
}