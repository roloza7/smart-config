import fs from 'fs';
import path from 'path';


const toPromise = async (rl, question) => {
    return new Promise((res) => rl.question(question, (answer) => {
        res(answer);
    }))
}

const yes = /^[yY][eE]?[sS]?$/
const no = /^[nN][oO]?$/

export const askCreateFolder = async (default_path, rl) => {
    let create_folder = undefined;
    do {
        const answer = await toPromise(rl, "configs directory: (config) ")
        if (answer.length == 0)
            create_folder = default_path;   
        else
            create_folder = answer     
    } while (create_folder === undefined)

    return create_folder;
}

export const askOverwrite = async (rl) => {
    let overwrite = undefined;
    do {
        const answer = await toPromise(rl, "looks like you already have a smart-config.json folder. Overwrite? (Y/n) ");
        if (yes.test(answer) == true)
            overwrite = true;
        else if (no.test(answer) == true)
            overwrite = false;
    } while (overwrite === undefined)
    return overwrite;
}
