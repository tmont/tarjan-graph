var should = require('should'),
	Graph = require('../');

describe('Graph', function() {
	it('should detect cycle', function() {
		var graph = new Graph()
			.add('a', [ 'b', 'c' ])
			.add('b', [ 'd', 'e' ])
			.add('c', [ 'b' ])
			.add('d', [ 'e' ])
			.add('e', [ 'c' ]);

		var cycles = graph.getCycles();
		cycles.should.have.length(1);
		graph.hasCycle().should.equal(true);
		var cycle = cycles[0];
		cycle[0].should.have.property('name', 'c');
		cycle[1].should.have.property('name', 'e');
		cycle[2].should.have.property('name', 'd');
	});

	it('should detect scc\'s properly', function() {
		var graph = new Graph()
				.add('a', ['b'])
				.add('b', ['c', 'd'])
				.add('c', ['a']);

		var sccs = graph.getStronglyConnectedComponents();
		sccs.should.have.length(2);
		var justD = sccs[0],
			cycle = sccs[1];

		justD.should.have.length(1);
		justD[0].should.have.property('name', 'd');

		cycle.should.have.length(3);
		cycle[0].should.have.property('name', 'a');
		cycle[1].should.have.property('name', 'c');
		cycle[2].should.have.property('name', 'b');
	});

	it('should get descendants', function() {
		var graph = new Graph()
			.add('a', ['b', 'c'])
			.add('b', ['d', 'e'])
			.add('c', ['b'])
			.add('d', ['e']);

		graph.hasCycle().should.equal(false);
		graph.getDescendants('a').should.eql([ 'c', 'b', 'e', 'd' ]);
		graph.getDescendants('b').should.eql([ 'e', 'd' ]);
		graph.getDescendants('c').should.eql([ 'b', 'e', 'd' ]);
		graph.getDescendants('d').should.eql([ 'e' ]);
		graph.getDescendants('e').should.eql([ ]);
	});

	it('should filter descendants correctly', function() {
	 	var filterFunc = (desc) => {
	 		const invalidDescs = ['f', 'g']
	 		let reject = false
	 		for (let i = 0, len = invalidDescs.length ; i < len; i++) {
	 			if (desc === invalidDescs[i]) {
	 				reject = true
	 				break
	 			}
	 		}
	 		return !reject
	 	}
		var graph = new Graph()
			.addAndFilterDescendants('a', ['b', 'c', 'f'], filterFunc)
			.addAndFilterDescendants('b', ['d', 'e', 'g'], filterFunc)
			.addAndFilterDescendants('c', ['b', 'f', 'g'], filterFunc)
			.addAndFilterDescendants('d', ['e'], filterFunc)
			.addAndFilterDescendants('e', ['f'], filterFunc)

		graph.hasCycle().should.equal(false);
		graph.getDescendants('a').should.eql([ 'c', 'b', 'e', 'd' ]);
		graph.getDescendants('b').should.eql([ 'e', 'd' ]);
		graph.getDescendants('c').should.eql([ 'b', 'e', 'd' ]);
		graph.getDescendants('d').should.eql([ 'e' ]);
		graph.getDescendants('e').should.eql([ ]);
	});

	it('should explode if adding a node that creates a cycle', function() {
		var graph = new Graph()
			.add('a', 'b');

		function explode() {
			graph.addAndVerify('b', 'a');
		}

		explode.should.throwError('Detected 1 cycle:\n  a -> b -> a');
	});

	it('should convert acyclic graph to DOT', function() {
		var graph = new Graph()
			.add('a', ['b', 'c'])
			.add('b', ['d', 'e'])
			.add('c', ['b'])
			.add('d', ['e']);

		var expected = 'digraph {\n\
  b -> d\n\
  b -> e\n\
  c -> b\n\
  a -> b\n\
  a -> c\n\
  d -> e\n\
}\n';

		graph.toDot().should.equal(expected);
	});

	it('should convert cyclic graph to DOT showing SCCs', function() {
		var graph = new Graph()
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

		var expected = 'digraph {\n\
  subgraph cluster0 {\n\
    color=red;\n\
    c; e; d; b;\n\
  }\n\
  subgraph cluster1 {\n\
    color=red;\n\
    i; f; j; h; g;\n\
  }\n\
  b -> d\n\
  b -> e\n\
  c -> b\n\
  a -> b\n\
  a -> c\n\
  d -> e\n\
  e -> c\n\
  g -> h\n\
  g -> i\n\
  f -> c\n\
  f -> a\n\
  f -> g\n\
  h -> j\n\
  i -> j\n\
  j -> f\n\
}\n';

		graph.hasCycle().should.equal(true);
		graph.toDot().should.equal(expected);
	});

	it('should clone graph', function() {
		var graph = new Graph()
			.add('a', [ 'b', 'c' ])
			.add('b', [ 'd', 'e' ])
			.add('c', 'b');

		var otherGraph = graph.clone();


		function arrayEquivalent(arr1, arr2) {
			arr1.sort().should.eql(arr2.sort());
		}

		arrayEquivalent(Object.keys(otherGraph), Object.keys(graph));

		Object.keys(otherGraph.vertices).forEach(function(key) {
			graph.vertices.should.have.property(key);

			//ensure there is no reference between the two graph instances
			otherGraph.vertices[key].should.not.equal(graph.vertices[key]);

			var w = graph.vertices[key].successors.map(function(w) {
				return w.name;
			});
			var otherW = otherGraph.vertices[key].successors.map(function(w) {
				return w.name;
			});

			arrayEquivalent(otherW, w);
		});
	});
});
