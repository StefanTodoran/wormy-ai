export interface SimulationRound {
    round: number,
    emails: Email[],
}

export interface EmailEntry {
    name: string,
    sender: string,
    recipient: string,
    subject: string,
    content: string,
    infected: boolean,
    worm_variant?: string,
    type: string,
}

export interface Email {
    name: string,
    sender: string,
    recipient: string,
    infected: boolean,
    subject: string,
    content: string,
    order: number,
    type: string,
    generated: boolean,
    original_message?: number,
    context_messages?: number[],
    worm_variant?: string,
}

export interface Templates {
    firstNames: string[],
    lastNames: string[],
    templates: { [key: string]: ContentTemplate[] },
    domains: string[],
    payloads: PayloadTemplate[],
}

export interface ContentTemplate {
    subject: string,
    body: string,
}

export interface PayloadTemplate {
    subject: string,
    body: string,
    type: string,
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