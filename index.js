#! /usr/bin/env node

const inquirer = require("inquirer");
const fs = require("fs");

const CHOICES = fs.readdirSync(`${__dirname}/templates`);
const CURR_DIR = process.cwd();

const QUESTIONS = [
    {
        name: "project-name",
        type: "input",
        message: "Enter project name:",
        validate: function (input) {
            if (/^([A-Za-z\-\_\d])+$/.test(input)) return true;
            else
                return "Project name may only include letters, numbers, underscores and hashes.";
        }
    },
    {
        name: "databases",
        type: "checkbox",
        message: "Select required databases:",
        choices: ['Mongoose', 'Redis', 'MySQL'],
    }
];

inquirer.prompt(QUESTIONS).then(answers => {
    console.log(answers);
    const projectName = answers["project-name"];
    const databases = answers["databases"];
    const templatePath = `${__dirname}/templates/demo-app`;
    const dbTemplatePath = `${__dirname}/templates/dbconfig/`
    fs.mkdirSync(`${CURR_DIR}/${projectName}`);
    createDirectoryContents(templatePath, projectName);
    createDatabasesConfig(dbTemplatePath, databases, `${CURR_DIR}/${projectName}/src/config/`);
});

function createDirectoryContents(templatePath, newProjectPath) {
    const filesToCreate = fs.readdirSync(templatePath);
    filesToCreate.forEach(file => {
        const origFilePath = `${templatePath}/${file}`;
        // get stats about the current file
        const stats = fs.statSync(origFilePath);
        if (stats.isFile()) {
            const contents = fs.readFileSync(origFilePath, "utf8");
            // rename fallback for npm ignore.
            if (file === '.npmignore') file = '.gitignore';
            const writePath = `${CURR_DIR}/${newProjectPath}/${file}`;
            fs.writeFileSync(writePath, contents, "utf8");
        } else if (stats.isDirectory()) {
            fs.mkdirSync(`${CURR_DIR}/${newProjectPath}/${file}`);

            // recursive call
            createDirectoryContents(
                `${templatePath}/${file}`,
                `${newProjectPath}/${file}`
            );
        }
    });
}

function createDatabasesConfig(templatePath, databases, projectDbPath) {
    databases.forEach(database => {
        let fileName = null;
        switch (database) {
            case 'Mongoose':
                fileName = `mongoose.js`;
                break;
            case 'Redis':
                fileName = `redis.js`;
                break;
            case 'MySQL':
                fileName = `mysql.js`;
                break;
            default: break;
        }
        if (fileName) {
            const filePath = `${templatePath}${fileName}`
            const stats = fs.statSync(filePath);
            if (stats.isFile()) {
                const contents = fs.readFileSync(filePath, "utf8");
                fs.writeFileSync(`${projectDbPath}${fileName}`, contents, "utf8");
            }
        }
    });
}