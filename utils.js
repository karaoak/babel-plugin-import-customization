const path = require('path');

module.exports.getMatchedFileName = (filePath, suffix) => {
    const fileDir = path.dirname(filePath);
    const fileName = path.basename(filePath);
    let extension = path.extname(fileName) || '.js';
    // .... check fileExistence...
    // .... index.js
    let fileNameWithoutExtension = fileName.replace(/\.[^/.]+$/, '');
    const matchedFileName = `${fileNameWithoutExtension}.${suffix}${extension}`;
    return `${fileDir}/${matchedFileName}`;
};

// const getCustomizationFilePath = (filename, customizationSuffix, importedValue) => {
//     const importingDir = path.dirname(filename);
//     const importedFilePath = path.resolve(importingDir, importedValue);
//     const importedFileDir =  path.dirname(importedFilePath);
//     const importedFileName = path.basename(importedFilePath);
//
//     console.log('importedFileName', importedFileName);
//
//     //TODO: check importedFileName, if empty, check if **index**.suffix.?) exists
//     //TODO: check if importedFileName.suffix.? exists...
//     If so: return custFilePath;
//
//
//     const custFileToLoadName = utils.getMatchedFileName(importedFileName, customizationSuffix);
//     const custFilePath = path.resolve(importedFileDir, custFileToLoadName);
//
//     return custFilePath;
// };
