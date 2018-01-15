const fs = require('fs-extra');
const mime = require('mime');
const postcss = require('postcss');

const createCssFromImage = (directory, fileName, className) => {
  const filePath = `${directory}/${fileName}`;

  const promise = fs.readFile(filePath)
    .then(
      (binary) => {
        const [file, ext] = fileName.split('.');
        const mimeType = mime.getType(ext);
        const base64 = Buffer.from(binary).toString('base64');
        const dataUri = `data:${mimeType};base64,${base64}`;

        const css = postcss.rule({
          selector: className.replace('{filename}', file),
        }).append({
          prop: 'background-image',
          value: `url(${dataUri})`,
        }).toString();

        return css;
      },
      (err) => {
        throw err;
      },
    );

  return promise;
};

const isImg = (fileName) => {
  const splitArray = fileName.split('.');
  if (splitArray.length < 2) return false;
  const ext = splitArray[1];
  return /(jpg|png|gif|svg)/.test(ext);
};

const createCssFileFromImages = (directory, outputFilePath, className) => {
  fs.readdir(directory)
    .then(
      (files) => {
        const imgFiles = files.filter(file => isImg(file));
        const cssArray = [];
        const promises = [];

        imgFiles.forEach((file) => {
          const promise = createCssFromImage(directory, file, className)
            .then(css => cssArray.push(css));
          promises.push(promise);
        });

        Promise.all(promises)
          .then(() => {
            const cssString = cssArray.join('\n');

            fs.outputFile(outputFilePath, cssString);
          });
      },
      (err) => {
        throw err;
      },
    );
};

module.exports = createCssFileFromImages;
