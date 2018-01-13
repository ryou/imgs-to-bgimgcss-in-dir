const fs = require('fs-extra');
const mime = require('mime');
const postcss = require('postcss');

const createCssFromImage = (directory, fileName, className, cb) => {
  const filePath = `${directory}/${fileName}`;

  fs.readFile(filePath, (err, binary) => {
    if (err) throw err;

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

    cb(css);
  });
};

const isImg = (fileName) => {
  const splitArray = fileName.split('.');
  if (splitArray.length < 2) return false;
  const ext = splitArray[1];
  return /(jpg|png|gif|svg)/.test(ext);
};

const createCssFileFromImages = (directory, outputFilePath, className) => {
  fs.readdir(directory, (err, files) => {
    if (err) throw err;

    const imgFiles = files.filter(file => isImg(file));
    const cssArray = [];

    imgFiles.forEach((file) => {
      createCssFromImage(directory, file, className, (css) => {
        cssArray.push(css);

        if (cssArray.length === files.length) {
          const cssString = cssArray.join('\n');

          fs.outputFile(outputFilePath, cssString);
        }
      });
    });
  });
};

module.exports = createCssFileFromImages;
