export default {
  default: {
    require: ['steps/**/*.ts'],
    requireModule: ['tsx'],
    format: ['progress', 'html:reports/cucumber-report.html', 'json:reports/cucumber-report.json'],
    formatOptions: { snippetInterface: 'async-await' },
    publishQuiet: true,
  },
}
