# tarjan-graph

[![Build Status](https://travis-ci.org/tmont/tarjan-graph.png)](https://travis-ci.org/tmont/tarjan-graph)

This is a simple directed graph lib, mostly just for checking if a
directed graph contains a cycle. It uses 
[Tarjan's algorithm](https://en.wikipedia.org/wiki/Tarjan's_strongly_connected_components_algorithm)
for checking if the graph contains a cycle.

This library also has some very basic [Graphviz](http://www.graphviz.org/) support
for visualizing graphs using the [DOT language](http://www.graphviz.org/doc/info/lang.html).

## Installation
```
npm install tarjan-graph
```

## Usage

Here's how you would generate the following graph (red boxes indicate a cycle):

![Dat Graph](./docs/two-cycles.png)

```javascript
var Graph = require('tarjan-graph');

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
```

Doing stuff with cycles:

```javascript
console.log(graph.hasCycle()); 
//true
console.log(graph.getCycles());
// [ 
//   [ { name: 'b', successors: [...] }, { name: 'e', ... }, ... ], 
//   ... 
// ]

//use addAndVerify() instead of add() to throw an error when adding
//an edge would create a cycle
```

Doing stuff with SCCs:

```javascript
//same as graph.getCycles() except includes "cycles" of length 1
console.log(graph.getStronglyConnectedComponents());
```

Searching:

```javascript
//depth-first search (pre-order)
graph.dfs('g', function(v) {
  console.log(v.name + ': ' + v.successors.map(function(w) { return w.name; }).join(', '));
});
/*
g: i, h
h: j
j: f
f: g, a, c
c: b
b: e, d
d: e
e: c
a: c, b
i: j
*/

//retrieve descendants
console.log(graph.getDescendants('a')); 
//[ 'b', 'd', 'e', 'c' ]
```

And of course, dat dot:

```javascript
console.log(graph.toDot());
/*
digraph {
  subgraph cluster0 {
    color=red;
    b; e; c; d;
  }
  subgraph cluster1 {
    color=red;
    g; i; j; f; h;
  }
  b -> e
  b -> d
  c -> b
  a -> c
  a -> b
  d -> e
  e -> c
  g -> i
  g -> h
  f -> g
  f -> a
  f -> c
  h -> j
  i -> j
  j -> f
}
*/
```
