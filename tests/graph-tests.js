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
		cycle[0].should.have.property('name', 'b');
		cycle[1].should.have.property('name', 'e');
		cycle[2].should.have.property('name', 'c');
	});

	it('should get dependencies', function() {
		var graph = new Graph()
			.add('a', ['b', 'c'])
			.add('b', ['d', 'e'])
			.add('c', ['b'])
			.add('d', ['e']);

		graph.hasCycle().should.equal(false);
		graph.getDependencies('a').should.eql([ 'b', 'd', 'e', 'c' ]);
		graph.getDependencies('b').should.eql([ 'd', 'e' ]);
		graph.getDependencies('c').should.eql([ 'b', 'd', 'e' ]);
		graph.getDependencies('d').should.eql([ 'e' ]);
		graph.getDependencies('e').should.eql([ ]);
	});

	it('should explode if adding a node that creates a cycle', function() {
		var graph = new Graph()
			.add('a', 'b');

		function explode() {
			graph.addAndVerify('b', 'a');
		}

		explode.should.throwError('Detected 1 cycle:\n  b -> a -> b');
	});

	it('should convert acyclic graph to DOT', function() {
		var graph = new Graph()
			.add('a', ['b', 'c'])
			.add('b', ['d', 'e'])
			.add('c', ['b'])
			.add('d', ['e']);

		var expected = 'digraph {\n\
  b -> e\n\
  b -> d\n\
  c -> b\n\
  a -> c\n\
  a -> b\n\
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
    b; e; c; d;\n\
  }\n\
  subgraph cluster1 {\n\
    color=red;\n\
    g; i; j; f; h;\n\
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
  j -> f\n\
}\n';

		graph.toDot().should.equal(expected);
	});
});
