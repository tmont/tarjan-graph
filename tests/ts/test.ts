import { Graph } from '../../index';

const graph = new Graph()
	.add('a', ['b', 'c'])
	.add('b', ['d', 'e'])
	.add('c', ['b'])
	.add('d', ['e'])
	.add('e', ['c'])
	.add('f', ['c', 'a', 'g'])
	.add('g', ['h', 'i'])
	.add('h', ['j'])
	.add('i', ['j'])
	.add('j', ['f']);

console.log(graph.hasCycle());
console.log(graph.getCycles());
console.log(graph.getStronglyConnectedComponents());

graph.dfs('a', (v) => {
	console.log(v.name + ': ' + v.successors.map(w => w.name).join(', '));
});

console.log(graph.toDot());
