#!/usr/bin/env node
/*
* @Author: Joesonw
* @Date:   2016-12-30 13:49:40
* @Last Modified by:   Joesonw
* @Last Modified time: 2017-01-05 13:27:28
*/

'use strict';

const program = require('commander');
const command = require('./');
const inquirer = require('inquirer');
const Promise = require('bluebird');

function requirePasswod() {
    return inquirer.prompt([{
        type: 'password',
        name: 'password',
        message: 'Enter your nxm password:',
    }])
    .then(function (answers) {
        return Promise.resolve(answers.password);
    });
}

function init() {
    if (command.isInited()) {
        inquirer.prompt([{
            type: 'confirm',
            name: 'confirm',
            message: 'Nxm is already inited, are you sure to delete all previous savings:',
        }])
        .then(function (answers) {
            if (!answers.confirm) {
                process.exit(0);
            }
            command.destroy();
            return requirePasswod();
        })
        .then(function (password) {
            command.init(password);
        })
    } else {
        requirePasswod()
            .then(function (password) {
                command.init(password);
            });
    }
}

function add() {
    if (!command.isInited()) {
        consol.error('Error: Nxm is not inited');
        process.exit(1);
    }
    requirePasswod()
        .then(function (password) {
            inquirer.prompt([{
                type: 'input',
                name: 'username',
                message: 'npm username:',
            }, {
                type: 'password',
                name: 'password',
                message: 'npm password:',
            }, {
                type: 'input',
                name: 'email',
                message: 'npm email(public):',
            }])
            .then(function (answers) { 
                command.add(password.trim(), answers.username.trim(), answers.password.trim(), answers.email.trim());
            });
        });
}

function list() {
    command.list();
}

function login(username) {
    requirePasswod()
        .then(function (password) {
            command.login(password, username);
        })
}

function remove(username) {
   command.remove(username);
}

program
    .command('init')
    .alias('i')
    .description('Init nxm')
    .action(init);
program
    .command('add')
    .alias('a')
    .description('Add acount')
    .action(add);
program
    .command('list')
    .alias('ls')
    .alias('l')
    .description('List existing users')
    .action(list);
program
    .command('use <username>')
    .description('login use selected user')
    .action(login);
program
    .command('remove <username>')
    .alias('rm')
    .description('remove existing users')
    .action(remove);

program.parse(process.argv);