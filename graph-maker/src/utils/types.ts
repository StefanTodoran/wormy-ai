export interface EmailEntry {
    name: string,
    sender: string,
    recipient: string,
    content: string,
    template: string,
}

export interface Email {
    name: string,
    sender: string,
    recipient: string,
    content: string,
    order: number,
}

export interface Templates {
    names: string[],
    contents: ContentTemplate[],
    domains: string[],
}

interface ContentTemplate {
    subject: string,
    body: string,
}