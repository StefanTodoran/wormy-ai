export interface EmailEntry {
    name: string,
    sender: string,
    recipient: string,
    content: string,
    template: string,
    infected: boolean,
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
    payloads: string[],
}

interface ContentTemplate {
    subject: string,
    body: string,
}

export interface GraphNode {
    id: number,
    position: Point,
    velocity: Vector,
    label: string,
    outgoing: Set<number>,
    weights: { [key: number]: number },
    infected: boolean,
    radius: number,
}

export interface Point {
    x: number,
    y: number,
}

export interface Vector {
    dx: number,
    dy: number,
}

export interface DrawStyle {
    fillColor?: string,
    strokeColor?: string,
    strokeWidth?: number,
    fontSize?: number,
    centered?: boolean,
}