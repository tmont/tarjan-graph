export declare class Vertex {
    readonly name: string;
    successors: Vertex[];
    index: number;
    lowLink: number;
    onStack: boolean;
    visited: boolean;
    constructor(name: string, successors?: Vertex[]);
    reset(): void;
}
export declare class CycleError extends Error {
    readonly cycles: any[];
    constructor(message: string, cycles: any[]);
}
export default class Graph {
    private readonly vertices;
    add(key: string, descendants: string | string[]): this;
    reset(): void;
    addAndVerify(key: string, descendants: string | string[]): this;
    dfs(key: string, visitor: (v: Vertex) => void): void;
    getDescendants(key: string): string[];
    hasCycle(): boolean;
    getStronglyConnectedComponents(): Vertex[][];
    getCycles(): Vertex[][];
    clone(): Graph;
    toDot(): string;
}
