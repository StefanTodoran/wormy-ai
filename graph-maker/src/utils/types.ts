export interface EmailEntry {
    name: string,
    sender: string,
    recipient: string,
    subject: string,
    content: string,
    infected: boolean,
    type: string,
}

export interface Email {
    sender: string,
    subject: string,
    recipient: string,
    content: string,
    order: number,
    type: string,
}

export interface Templates {
    names: string[],
    templates: { [key: string] : ContentTemplate[]},
    domains: string[],
    payloads: ContentTemplate[],
}

interface ContentTemplate {
    subject: string,
    body: string,
}

export interface GraphNode {
    address: string,
    contacts: { [key: number]: number },
    infectedAfter?: number,
    sentCount: number[],
    
    position: Point,
    velocity: Vector,
    mass: number,
    radius: number,

    hovered: boolean,
    dragging: boolean,
}

export interface GraphEdge {
    to: number,
    from: number,
    order: number,
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