#!/usr/bin/env node

const fs = require('fs');
const yargs = require('yargs');
const { exec } = require('child_process');
const path = require('path');
require('colors');

// get current date
const date = new Date().toLocaleString();

const pjp = path.resolve(__dirname, '..', 'package.json');
const pj = require(pjp);
const version = pj.version;
// starting message
console.log(`[t] Starting DSMv${version} ( https://git.douxx.tech/dsm ) at [${date}]\n`.cyan);

// [t] time tracking
const stime = Date.now();

// check if the script is run with sudo (for the permission of writing in the services repo)
if (process.getuid() !== 0) {
    console.error("--------------------------------------------------------------------".red);
    console.error("[X] Please run this script with 'sudo' to ensure proper permissions.".red);
    console.error("--------------------------------------------------------------------".red);
    exit();
}

const argv = yargs
    .command('add', 'Add a new service')
    .option('c', {
        alias: 'command',
        describe: 'The command to execute in the service',
        type: 'string'
    })
    .option('n', {
        alias: 'name',
        describe: 'The name of the service',
        type: 'string'
    })
    .command('remove', 'Remove an existing service')
    .option('n', {
        alias: 'name',
        describe: 'The name of the service to remove',
        type: 'string'
    })
    .help(false)
    .alias('h', 'help')
    .argv;

const command = argv._[0];

if (!command || !['add', 'remove'].includes(command)) {
    console.log(`Usage: node dsm <command> [options]`.yellow);
    console.log('');
    console.log('Commands:');
    console.log('  add     Add a new service');
    console.log('  remove  Remove an existing service');
    console.log('');
    console.log('Options:');
    console.log("  --command, -c  The command to execute in the service");
    console.log("  --name, -n     The name of the service");
    console.log('');
    exit();
}

if (command === 'add') {
    if (!argv.command) {
        console.error("----------------------------------".red);
        console.error('[X] Service command not specified.'.red);
        console.error("----------------------------------".red);
        exit();
    }

    const servicen = argv.name || gsnfc(argv.command);
    const serviceCommand = argv.command;
    cservice(servicen, serviceCommand);
} else if (command === 'remove') {
    if (!argv.name) {
        console.error("-------------------------------".red);
        console.error('[X] Service name not specified.'.red);
        console.error("-------------------------------".red);
        exit();
    }

    const servicen = argv.name;
    rservice(servicen);
} else {
    console.error("--------------------------------------------------".red);
    console.error('[X] Invalid command. Please use "add" or "remove".'.red);
    console.error("--------------------------------------------------".red);
    exit();
}

function exit() {
    const endTime = Date.now();
    console.log(`\n[t] Thanks for using DSM !\nProcess finished in ${endTime - stime}ms`.cyan);
    process.exit();
}

function cservice(name, command) {
    if (fs.existsSync(`/etc/systemd/system/${name}.service`)) {
        console.log(`[i] The service ${name} already exists.`.yellow);
        repserv(name, command);
    } else {
        creaserv(name, command);
    }
}

function repserv(name, command) {
    const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });

    readline.question(`[i] Do you want to replace the existing service ${name}? ([Y]/n): `.yellow, (answer) => {
        readline.close();
        if (answer.trim().toLowerCase() === 'n') {
            console.log('[i] Operation cancelled.'.yellow);
            exit();
        } else if (!answer.trim() || answer.trim().toLowerCase() === 'y') {
            creaserv(name, command);
        } else {
            console.error('[X] Invalid response. Please type "y" for yes or "n" for no.'.red);
            repserv(name, command);
        }
    });
}

function creaserv(name, command) {
    console.log(`[i] Creating or updating service ${name}...`.yellow);
    const content = `
[Unit]
Description=DSM managed service (SERVICE: ${name})

[Service]
ExecStart=${command}
Restart=on-failure
RestartSec=30s 

[Install]
WantedBy=multi-user.target
`;

    fs.writeFile(`/etc/systemd/system/${name}.service`, content, (err) => {
        if (err) {
            console.error('[X] Error creating the service file:', err.red);
            exit();
        }

        // daemon reload
        console.log('[i] Reloading systemd daemon...'.yellow);
        const drst = Date.now();
        exec('sudo systemctl daemon-reload', (error, stderr) => {
            if (error) {
                console.error(`[X] Error during daemon reload: ${error.message}`.red);
                exit();
            }
            if (stderr) {
                console.error(`[X] Error during daemon reload: ${stderr}`.red);
                exit();
            }
            const dret = Date.now();
            console.log('[✔] Daemon reloaded successfully.'.green + ` (${dret - drst}ms)`.gray);

            // enable the service
            console.log('[i] Enabling service...'.yellow);
            const esst = Date.now();
            exec(`sudo systemctl enable ${name}`, (error, stderr) => {
                if (error) {
                    console.error(`[X] Error enabling the service: ${error.message}`.red);
                    exit();
                }
                if (stderr) {
                    console.error(`[X] Error enabling the service: ${stderr}`.red);
                    exit();
                }
                const eset = Date.now();
                console.log('[✔] Service enabled successfully.'.green + ` (${eset - esst}ms)`.gray);

                // start the service
                console.log('[i] Starting service...'.yellow);
                const ssst = Date.now();
                exec(`sudo systemctl start ${name}`, (error, stderr) => {
                    if (error) {
                        console.error(`[X] Error starting the service: ${error.message}`.red);
                        exit();
                    }
                    if (stderr) {
                        console.error(`[X] Error starting the service: ${stderr}`.red);
                        exit();
                    }
                    const sset = Date.now();
                    console.log('[✔] Service started successfully.'.green + ` (${sset - ssst}ms)`.gray);
                    exit();
                });
            });
        });
    });
}
function rservice(name) {
    // check if the service file exists
    if (!fs.existsSync(`/etc/systemd/system/${name}.service`)) {
        console.error("-------------------------------------".red);
        console.log(`[i] The service ${name} does not exist.`.yellow);
        console.error("-------------------------------------".red);
        exit();
    }

    aremserv(name);
}

function aremserv(name) {
    const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });

    readline.question(`[i] Do you want to remove the service ${name}? ([Y]/n): `.yellow, (answer) => {
        readline.close();
        if (answer.trim().toLowerCase() === 'n') {
            console.log('[i] Operation cancelled.'.yellow);
            exit();
        } else if (!answer.trim() || answer.trim().toLowerCase() === 'y') {
            remserv(name);
        } else {
            console.error('[X] Invalid response. Please type "y" for yes or "n" for no.'.red);
            aremserv(name);
        }
    });
}

function remserv(name) {
    console.log(`[i] Removing service ${name}...`.yellow);
    fs.unlink(`/etc/systemd/system/${name}.service`, (err) => {
        if (err) {
            console.error(`[X] Error removing the service file: ${err.message}`.red);
            exit();
        }
        console.log(`[✔] Service file ${name} removed successfully.`.green);

        // daemon reload
        console.log('[i] Reloading systemd daemon...'.yellow);
        const drst = Date.now();
        exec('sudo systemctl daemon-reload', (error, stdout, stderr) => {
            if (error) {
                console.error(`[X] Error during daemon reload: ${error.message}`.red);
                exit();
            }
            if (stderr) {
                console.error(`[X] Error during daemon reload: ${stderr}`.red);
                exit();
            }
            const dret = Date.now();
            console.log('[✔] Daemon reloaded successfully.'.green + ` (${dret - drst}ms)`.gray);
            exit();
        });
    });
}

//getting the service name from the first command "word"
function gsnfc(command) {
    const parts = command.trim().split(' ');
    return parts[0];
}
