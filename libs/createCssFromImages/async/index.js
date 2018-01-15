const fs = require('fs-extra');
const mime = require('mime');
const postcss = require('postcss');
const _ = require('lodash');

const createCssFromImage = async (directory, fileName, className) => {
  const filePath = `${directory}/${fileName}`;
  const binary = await fs.readFile(filePath);
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
};

const isImg = (fileName) => {
  const splitArray = fileName.split('.');
  if (splitArray.length < 2) return false;
  const ext = splitArray[1];
  return /(jpg|png|gif|svg)/.test(ext);
};

const createCssFileFromImages = async (directory, outputFilePath, className) => {
  const files = await fs.readdir(directory);
  const imgFiles = files.filter(file => isImg(file));

  let cssArray = [];
  const promises = [];
  imgFiles.forEach((file) => {
    const promise = createCssFromImage(directory, file, className)
      .then((css) => {
        cssArray.push({
          file,
          css,
        });
      });
    promises.push(promise);
  });
  await Promise.all(promises);

  cssArray = _.sortBy(cssArray, ['file']);
  const cssString = cssArray.join('\n');
  fs.outputFile(outputFilePath, cssString);
};

module.exports = createCssFileFromImages;
