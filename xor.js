const { Neat, Methods, Architect, Config } = require('neataptic')
Config.warnings = false
const xorSpec = [
  [[0, 0], [0]],
  [[1, 0], [1]],
  [[0, 1], [1]],
  [[1, 1], [0]]
]
const fitness = function (network) {
  const complexity = network.nodes.length + network.connections.length + network.gates.length
  const matchFitness = -xorSpec.map(([input, expected]) => {
    const tests = Array(2).fill().map(() =>
      Methods.Cost.MSE(expected, network.activate(input).map(Math.abs))
    )
    var allMatch = tests.filter(x => x !== tests[0]).length
    if (complexity > 15) return Number.MAX_SAFE_INTEGER
    if (allMatch) return Number.MAX_SAFE_INTEGER
    return tests[0]
  }).reduce((a, b) => a + b) || -100000
  return matchFitness
}
const neat = new Neat(2, 1, fitness,
  {
    mutation: Methods.Mutation.ALL,
    popsize: 100,
    mutationRate: 0.3,
    elitism: 10,
    network: new Architect.Random(
        2,
        4,
        1
      ),
    clear: true
  }
)
neat.mutate()
var max = Number.MIN_VALUE
var best
for (var i = 0; i < 1000; i++) {
  const nextBest = neat.getFittest()
  nextBest.clear()
  const fit = fitness(nextBest)
  if (fit < max) {
    console.log('Fitness has decreased', max, fit)
  }
  best = nextBest
  max = fit
  const complexity = best.connections.length + best.nodes.length + best.gates.length
  console.log('Complexity', complexity)
  xorSpec.forEach(([input]) => {
    console.log(input, best.activate(input).map(Math.round).map(Math.abs), fit)
  })
  neat.evolve()
}
