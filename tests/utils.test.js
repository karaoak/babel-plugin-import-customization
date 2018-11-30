const utils = require('../utils');

it('should customize js extension if specified in import', () => {
  const matchedFile = utils.getMatchedFileName('./module/someModule.js', 'custSuffix');

  expect(matchedFile).toEqual('./module/someModule.custSuffix.js')
});
  
it('should customize js extension if not specified in import', () => {
  const matchedFile = utils.getMatchedFileName('./module/someModule', 'custSuffix');

  expect(matchedFile).toEqual('./module/someModule.custSuffix.js')
});


it('should customize any extension specified in import', () => {
  const matchedFile = utils.getMatchedFileName('./module/someModule.jpeg', 'custSuffix');

  expect(matchedFile).toEqual('./module/someModule.custSuffix.jpeg')
});

it('should customize nested path without extension as js', () => {
  const matchedFile = utils.getMatchedFileName('./module/module2/someModule.someModule2.js', 'custSuffix');

  expect(matchedFile).toEqual('./module/module2/someModule.someModule2.custSuffix.js')
});

it('should customize nested path with extension', () => {
  const matchedFile = utils.getMatchedFileName('./module/module2/someModule.someModule2.jpeg', 'custSuffix');

  expect(matchedFile).toEqual('./module/module2/someModule.someModule2.custSuffix.jpeg')
});
