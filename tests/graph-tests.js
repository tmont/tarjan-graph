const should = require('should');
const { Graph } = require('../');

describe('Graph', () => {
	it('should detect cycle', () => {
		const graph = new Graph()
			.add('a', [ 'b', 'c' ])
			.add('b', [ 'd', 'e' ])
			.add('c', [ 'b' ])
			.add('d', [ 'e' ])
			.add('e', [ 'c' ]);

		const cycles = graph.getCycles();
		cycles.should.have.length(1);
		graph.hasCycle().should.equal(true);
		const cycle = cycles[0];
		cycle[0].should.have.property('name', 'd');
		cycle[1].should.have.property('name', 'c');
		cycle[2].should.have.property('name', 'e');
	});

	it('should detect scc\'s properly', () => {
		const graph = new Graph()
				.add('a', ['b'])
				.add('b', ['c', 'd'])
				.add('c', ['a']);

		const sccs = graph.getStronglyConnectedComponents();
		sccs.should.have.length(2);
		const justD = sccs[0];
		const cycle = sccs[1];

		justD.should.have.length(1);
		justD[0].should.have.property('name', 'd');

		cycle.should.have.length(3);
		cycle[0].should.have.property('name', 'a');
		cycle[1].should.have.property('name', 'c');
		cycle[2].should.have.property('name', 'b');
	});

	it('should detect cycle of length 1', () => {
		const graph = new Graph()
			.add('a', ['b'])
			.add('a', ['c'])
			.add('a', ['a']);

		const cycles = graph.getCycles();
		cycles.should.have.length(1);
		const cycle = cycles[0];
		cycle[0].should.have.property('name', 'a');
	});

	it('should get descendants', () => {
		const graph = new Graph()
			.add('a', ['b', 'c'])
			.add('b', ['d', 'e'])
			.add('c', ['b'])
			.add('d', ['e']);

		graph.hasCycle().should.equal(false);
		graph.getDescendants('a').should.eql([ 'b', 'd', 'e', 'c' ]);
		graph.getDescendants('b').should.eql([ 'd', 'e' ]);
		graph.getDescendants('c').should.eql([ 'b', 'd', 'e' ]);
		graph.getDescendants('d').should.eql([ 'e' ]);
		graph.getDescendants('e').should.eql([ ]);
	});

	it('should explode if adding a node that creates a cycle', () => {
		const graph = new Graph()
			.add('a', 'b');

		function explode() {
			graph.addAndVerify('b', 'a');
		}

		explode.should.throwError('Detected 1 cycle:\n  a -> b -> a');
	});

	it('should convert acyclic graph to DOT', () => {
		const graph = new Graph()
			.add('a', ['b', 'c'])
			.add('b', ['d', 'e'])
			.add('c', ['b'])
			.add('d', ['e']);

		const expected = 'digraph {\n\
  b -> e\n\
  b -> d\n\
  c -> b\n\
  a -> c\n\
  a -> b\n\
  d -> e\n\
}\n';

		graph.toDot().should.equal(expected);
	});

	it('should convert cyclic graph to DOT showing SCCs', () => {
		// graph from the README
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
			.add('j', ['f', 'k'])
			.add('k', ['k']);

		const expected = 'digraph {\n\
  subgraph cluster0 {\n\
    color=red;\n\
    d; c; e; b;\n\
  }\n\
  subgraph cluster1 {\n\
    color=red;\n\
    k;\n\
  }\n\
  subgraph cluster2 {\n\
    color=red;\n\
    h; f; j; i; g;\n\
  }\n\
  b -> e\n\
  b -> d\n\
  c -> b\n\
  a -> c\n\
  a -> b\n\
  d -> e\n\
  e -> c\n\
  g -> i\n\
  g -> h\n\
  f -> g\n\
  f -> a\n\
  f -> c\n\
  h -> j\n\
  i -> j\n\
  j -> k\n\
  j -> f\n\
  k -> k\n\
}\n';

		graph.hasCycle().should.equal(true);
		graph.toDot().should.equal(expected);
	});

	it('should clone graph', () => {
		const graph = new Graph()
			.add('a', [ 'b', 'c' ])
			.add('b', [ 'd', 'e' ])
			.add('c', 'b');

		const otherGraph = graph.clone();


		function arrayEquivalent(arr1, arr2) {
			arr1.sort().should.eql(arr2.sort());
		}

		arrayEquivalent(Object.keys(otherGraph), Object.keys(graph));

		Object.keys(otherGraph.vertices).forEach((key) => {
			graph.vertices.should.have.property(key);

			//ensure there is no reference between the two graph instances
			otherGraph.vertices[key].should.not.equal(graph.vertices[key]);

			const w = graph.vertices[key].successors.map(w => w.name);
			const otherW = otherGraph.vertices[key].successors.map(w => w.name);

			arrayEquivalent(otherW, w);
		});
	});
});
