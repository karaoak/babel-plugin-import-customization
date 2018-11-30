const path = require('path');
const fs = require('fs');
const utils = require('./utils');

const trimJSExtensions = (filePath) => {
    return filePath.replace(/\.(js|jsx)$/, '');
};

const isImportingIntoCustomization = (filename, customizationSuffix) => {
    const importingFileName = trimJSExtensions(filename);
    const parsedImporting = path.parse(importingFileName);
    return parsedImporting.ext === `.${customizationSuffix}`;
};

const getCustomizationFilePath = (filename, customizationSuffix, importedValue) => {
    const importingDir = path.dirname(filename);
    const importedFilePath = path.resolve(importingDir, importedValue);
    const importedFileDir =  path.dirname(importedFilePath);
    const importedFileName = path.basename(importedFilePath);
    const custFileToLoadName = utils.getMatchedFileName(importedFileName, customizationSuffix);
    const custFilePath = path.resolve(importedFileDir, custFileToLoadName);

    return custFilePath;
};

const getCustSuffix = (options) => {
    return process.env[options.env] || options.suffix;
};

const isRequireCall = (treePath, t) => {
    return t.isIdentifier(treePath.node.callee, { name: 'require' });;
};

const insertBeforeLastOccurrence = (str, strToFind, strToInsert) => {
    const index = str.lastIndexOf(strToFind);
    if (index < 0) {
        return str;
    }

    return str.substring(0, index) + strToInsert + str.substring(index);   
};

const custfileExists = (custFilePath) => {
    let exists = fs.existsSync(custFilePath);
    if (!exists) {
        const reactNativeSufixes = ['.android', '.ios'];
         reactNativeSufixes.forEach((suffix) => {
            const filePathWithNativeSufix = insertBeforeLastOccurrence(custFilePath, '.', suffix);
            exists = fs.existsSync(filePathWithNativeSufix);
            if (exists) {
                return;
            }
        });
    }

    return exists;
};

const transform = (treePath, state, isCallExpression, t) => {
    if (isCallExpression && !isRequireCall(treePath, t)) {
       return;
    }

    const customizationSuffix = getCustSuffix(state.opts);
    if (!customizationSuffix) {
        return;
    }

    const source = isCallExpression ? treePath.node.arguments[0] : treePath.node.source;
    if (source && source.type === 'StringLiteral') {
        const filename = state.file.opts.filename;

        if(isImportingIntoCustomization(filename, customizationSuffix)) {
            return;
        }

        const importedValue = source.value;

        const importingDir = path.dirname(filename);
        const importedFilePath = path.resolve(importingDir, importedValue);
        const importedFileDir =  path.dirname(importedFilePath);
        const importedFileName = path.basename(importedFilePath);

        const fileDir = path.dirname(importedFileName);
        const fileName = path.basename(importedFileName);

        let extension = path.extname(fileName) || '.js';
        let fileNameWithoutExtension = fileName.replace(/\.[^/.]+$/, '');

        // TODO: Use https://www.npmjs.com/package/fast-glob

        // Allowed filenames without extensions: .js and .jsx
        // Pseudo code:
        // if (file1.suffix.js exists --> then replace...
        // else if file1.getBase.suffix.file1.getExtension --> then replace...


        const matchedFileName = `${fileNameWithoutExtension}.${customizationSuffix}${extension}`;
        const custFileToLoadName =  `${fileDir}/${matchedFileName}`;
        const custFilePath = path.resolve(importedFileDir, custFileToLoadName);


        const isCustFileExists = custfileExists(custFilePath);

        if (isCustFileExists) {
            const newImportedValue = utils.getMatchedFileName(importedValue, customizationSuffix);
            const newPath = t.stringLiteral(newImportedValue);
            if (isCallExpression) {
                treePath.replaceWith(t.CallExpression(treePath.node.callee, [newPath]));
            } else {
                treePath.replaceWith(t.ImportDeclaration(treePath.node.specifiers, newPath));
            } 
        }
    }
};

module.exports = function ({ types: t }) {
	return {
		visitor: {
            ImportDeclaration: {
                enter: (treePath, state) => {
                    transform(treePath, state, false, t);
                }
            },

            CallExpression: {
                enter: (treePath, state) => {
                    transform(treePath, state, true, t);
                }
            }
		}
	};
};
