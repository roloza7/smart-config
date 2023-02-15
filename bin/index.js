#! /usr/bin/env node
import fs from 'fs';
import readline from 'readline';
import { askCreateFolder, askOverwrite, scan } from './utils.js';
import { defaults } from './defaults.js'
import path from 'path';
import { exit } from 'process';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true
})

const __configPath = path.join(process.cwd(), ".smartconfig");

const args = process.argv.slice(process.argv[0] == "npx" ? 3 : 2, process.argv.length)

const __config = fs.existsSync(__configPath) ? JSON.parse(fs.readFileSync(__configPath, 'utf8')) : undefined;
 
const startup = async () => {

    const { folder:folder__default } = defaults;

    const __folderName = await askCreateFolder(folder__default, rl);

    const __folderPath = path.join(process.cwd(), __folderName);

    if (fs.existsSync(__folderPath) == false) {
        fs.mkdirSync(__folderPath);
    }   

    rl.close();

    fs.writeFileSync(__configPath, JSON.stringify({
        ...defaults,
        folder: __folderName,
    }, null, 4), 'utf8')
}

if (args[0] == 'init') {
    if (__config != undefined) {
        if (await askOverwrite(rl) === false)
            exit(0);
    }
    await startup();
}

if (args[0] == 'switch') {
    if (args.length <= 1) {
        console.log("Usage: smart-config switch [MODE]")
        exit(0);
    }

    if (__config == undefined) {
        console.log("Please run 'smart-config init' first to set up your project file");
        exit(0);
    }

    const { folder, current, modes } = __config;

    const currentMode = current !== "" ? modes[current] : {};

    if (args[1] in modes == false) {
        console.log(`No mode ${args[1]} specified in smart-config.json`)
        exit(0);
    }

    const nextMode = modes[args[1]];

    const folder_path = path.join(process.cwd(), folder);

    const inDir = (filename) => fs.existsSync(path.join(folder_path, filename));

    if (fs.existsSync(folder_path) == false) {
        console.log(`Config folder ${__config.folder} does not exist in the current working directory!`);
        exit(0);
    }

    for(const [key, value] of Object.entries(currentMode)) {
        if (inDir(key) == false) {
            console.log(`File ${key} aliased to ${value} does not exists in the configurations folder.\nExiting to prevent accidental deletion.`)
            exit(0);
        }
    }

    for(const [_, value] of Object.entries(currentMode)) {
        if (fs.existsSync(path.join(folder_path, value)))
            fs.unlinkSync(path.join(folder_path, value));
    }

    for(const [key, value] of Object.entries(nextMode)) {
        fs.copyFileSync(path.join(folder_path, key), path.join(process.cwd(), value))
    }

    fs.writeFileSync(__configPath, JSON.stringify({
        ...__config,
        current: args[1]
    }, null, 4), 'utf8')

}

if (args[0] == 'scan') {
    await scan(path.join(process.cwd(), __config.folder));
}

exit(0);