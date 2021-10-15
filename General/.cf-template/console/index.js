import fs from 'fs';
import chalk from 'chalk';
import path from 'path';

const REPLACE_KEY = '#username';
const LOG_MSG_HEADER = 'Generate Console';

const log = console.log;

const guard = async (componentName, outputDir) => {
  const existing = await fs.promises.readdir(outputDir);

  if (existing.some(e => e === componentName)) {
    log(chalk`
      ${LOG_MSG_HEADER} {red FAILED}
      Component with same name {yellow ${componentName}} exists
    `);

    return false;
  }

  return true;
}

const replaceContent = (source, key, value) => {
  return source.toString().replaceAll(key, value);
}

const printSuccess = (componentName, dir) => {
  log(chalk`
    ${LOG_MSG_HEADER} {green successfully}
    Name: {green ${componentName}}
    Location: {green ${dir}}
  `);
}

const printFail = (err) => {
  log(chalk`
    ${LOG_MSG_HEADER} {red FAILED}
    Message: {yellow ${err}}
  `);
}

const generate = async (outputPath, templatePath) => {
  const splits = outputPath.split(path.sep);
  const username = splits.pop();
  const outputDir = splits.join(path.sep);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  if (!await guard(username, outputDir)) {
    return;
  }

  Promise.resolve()
    .then(() => fs.promises.mkdir(outputPath))
    .then(() => Promise.all([
      fs.promises.readFile(`${templatePath}/languages/dotnet.csx`),
      fs.promises.readFile(`${templatePath}/languages/node.js`),
    ]))
    .then(([
      csxContent,
      jsContent,
    ]) => {
      return Promise.all([
        fs.promises.writeFile(`${outputPath}/${username}.csx`, replaceContent(csxContent, REPLACE_KEY, username)),
        fs.promises.writeFile(`${outputPath}/${username}.js`, replaceContent(jsContent, REPLACE_KEY, username)),
      ]);
    })
    .then(() => printSuccess(username, outputPath))
    .catch((err) => printFail(err));
}

export default generate;