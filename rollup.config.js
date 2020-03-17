import resolve from '@rollup/plugin-node-resolve'
import babel from 'rollup-plugin-babel'

const name = 'jsx-fontawesome'
const globals = {
  '@fortawesome/fontawesome-svg-core': 'FontAwesome',
  '@aduh95/async-jsx': 'h',
  'prop-types': 'PropTypes'
}

export default {
  external: [
    '@fortawesome/fontawesome-svg-core',
    'prop-types',
    '@aduh95/async-jsx'
  ],
  input: 'src/index.js',
  output: [
    {
      name,
      globals,
      format: 'umd',
      file: 'index.js'
    },
    {
      name,
      globals,
      format: 'es',
      file: 'index.es.js'
    }
  ],
  plugins: [
    resolve({
      jsnext: true,
      main: true
    }),
    babel({
      babelrc: false,
      plugins: [['@babel/plugin-proposal-class-properties', { loose: true }]],
      exclude: 'node_modules/**'
    })
  ]
}
