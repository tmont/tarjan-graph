export class Vertex {
	public readonly name;
	public successors: Vertex[];
	public index = -1;
	public lowLink = -1;
	public onStack = false;
	public visited = false;

	public constructor(name: string, successors?: Vertex[]) {
		this.name = name;
		this.successors = successors || [];
		this.reset();
	}

	public reset() {
		this.index = -1;
		this.lowLink = -1;
		this.onStack = false;
		this.visited = false;
	}
}

export class CycleError extends Error {
	public readonly cycles: any[];
	public constructor(message: string, cycles: any[]) {
		super(message);
		this.cycles = cycles;
	}
}

export default class Graph {
	private readonly vertices: { [key: string]: Vertex } = {};

	public add(key: string, descendants: string | string[]): this {
		descendants = Array.isArray(descendants) ? descendants : [descendants];

		const successors = descendants.map((key) => {
			if (!this.vertices[key]) {
				this.vertices[key] = new Vertex(key, []);
			}
			return this.vertices[key];
		});

		if (!this.vertices[key]) {
			this.vertices[key] = new Vertex(key);
		}

		this.vertices[key].successors = successors.concat([]).reverse();
		return this;
	}

	public reset(): void {
		Object.keys(this.vertices).forEach((key) => {
			this.vertices[key].reset();
		});
	}

	public addAndVerify(key: string, descendants: string | string[]): this {
		this.add(key, descendants);
		const cycles = this.getCycles();
		if (cycles.length) {
			let message = `Detected ${cycles.length} cycle${cycles.length === 1 ? '' : 's'}:`;
			message += '\n' + cycles.map((scc) => {
				const names = scc.map(v => v.name);
				return `  ${names.join(' -> ')} -> ${names[0]}`;
			}).join('\n');

			throw new CycleError(message, cycles);
		}

		return this;
	}

	public dfs(key: string, visitor: (v: Vertex) => void): void {
		this.reset();
		const stack: Vertex[] = [ this.vertices[key] ];
		let v;
		while (v = stack.pop()) {
			if (v.visited) {
				continue;
			}

			//pre-order traversal
			visitor(v);
			v.visited = true;

			v.successors.forEach(w => stack.push(w));
		}
	}

	public getDescendants(key: string): string[] {
		const descendants: string[] = [];
		let ignore = true;
		this.dfs(key, (v) => {
			if (ignore) {
				//ignore the first node
				ignore = false;
				return;
			}
			descendants.push(v.name);
		});

		return descendants;
	}

	public hasCycle(): boolean {
		return this.getCycles().length > 0;
	}

	public getStronglyConnectedComponents(): Vertex[][] {
		const V = Object.keys(this.vertices).map((key) => {
			this.vertices[key].reset();
			return this.vertices[key];
		});

		let index = 0;
		const stack: Vertex[] = [];
		const components: Vertex[][] = [];

		const stronglyConnect = (v: Vertex): void => {
			v.index = index;
			v.lowLink = index;
			index++;
			stack.push(v);
			v.onStack = true;

			v.successors.forEach((w) => {
				if (w.index < 0) {
					stronglyConnect(w);
					v.lowLink = Math.min(v.lowLink, w.lowLink);
				} else if (w.onStack) {
					v.lowLink = Math.min(v.lowLink, w.index);
				}
			});

			if (v.lowLink === v.index) {
				const scc = [];
				let w;
				do {
					w = stack.pop();
					if (!w) {
						break;
					}

					w.onStack = false;
					scc.push(w);
				} while (w !== v);

				components.push(scc);
			}
		};

		V.forEach(function(v) {
			if (v.index < 0) {
				stronglyConnect(v);
			}
		});

		return components;
	}

	public getCycles(): Vertex[][] {
		return this.getStronglyConnectedComponents().filter((scc) => {
			if (scc.length > 1) {
				return true;
			}

			const startNode = scc[0];
			return startNode && startNode.successors.some(node => node === startNode);
		});
	}

	public clone(): Graph {
		const graph = new Graph();

		Object.keys(this.vertices).forEach((key) => {
			const v = this.vertices[key];
			graph.add(v.name, v.successors.map((w) => {
				return w.name;
			}));
		});

		return graph;
	}

	public toDot(): string {
		const V = this.vertices;
		const lines = [ 'digraph {' ];

		this.getCycles().forEach((scc, i) => {
			lines.push('  subgraph cluster' + i + ' {');
			lines.push('    color=red;');
			lines.push('    ' + scc.map(v => v.name).join('; ') + ';');
			lines.push('  }');
		});

		Object.keys(V).forEach((key) => {
			const v = V[key];
			if (v.successors.length) {
				v.successors.forEach((w) => {
					lines.push(`  ${v.name} -> ${w.name}`);
				});
			}
		});

		lines.push('}');
		return lines.join('\n') + '\n';
	}
}
