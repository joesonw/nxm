/*
* @Author: Joesonw
* @Date:   2016-12-30 13:49:34
* @Last Modified by:   Joesonw
* @Last Modified time: 2017-01-05 13:26:42
*/

'use strict';
const fs = require('fs-extra');
const Login = require('npm-cli-login');
const crypto = require('crypto');
const path = require('path');

const HOME = process.env.HOME || process.env.USERPROFILE;
const PASSWD = path.resolve(HOME, '.nxm/passwd');
const PASSWORD = path.resolve(HOME, '.nxm/password');

function encrypt(content, key) {
    const cipher = crypto.createCipher('aes-256-ctr', key);
    return Buffer.concat([cipher.update(content), cipher.final()]).toString('base64');
}

function decrypt(content, key) {
    const decipher = crypto.createDecipher('aes-256-ctr', key);
    return Buffer.concat([decipher.update(new Buffer(content, 'base64')), decipher.final()]).toString('utf8');
}

module.exports = {
    isInited: function() {
        if (
            fs.existsSync(PASSWD) ||
            fs.existsSync(PASSWORD)
        ) {
            return true;
        }
        return false;
    },
    destroy: function() {
        fs.removeSync(path.resolve(HOME, '.nxm'));
    },
    init: function (password) {
        fs.ensureFileSync(PASSWD);
        fs.ensureFileSync(PASSWORD);
        const encrypted = encrypt(password, password)
        fs.writeFileSync(PASSWORD, encrypted);
    },
    add: function (key, username, password, email) {
        const storedPassword = decrypt(fs.readFileSync(PASSWORD).toString(), key);
        if (storedPassword !== key) {
            console.error(`Nxm password does not match`);
            process.exit(1);
        }
        let passwd = fs.readFileSync(PASSWD).toString();
        passwd += username;
        passwd += ' ';
        passwd += encrypt(password, key);
        passwd += ' ';
        passwd += email;
        passwd += '\n';
        fs.writeFileSync(PASSWD, passwd);
    },
    list: function() {
        const passwd = fs.readFileSync(PASSWD).toString();
        const usernames = passwd
                        .split('\n')
                        .slice(0, -1)
                        .map(function(p) {
                            return '\t' + p.split(' ')[0];
                        })
                        .join('\n');
        console.log('Stored users:')
        console.log(usernames)
    },
    login: function(key, username) {
        const storedPassword = decrypt(fs.readFileSync(PASSWORD).toString(), key);
        if (storedPassword !== key) {
            console.error(`Nxm password does not match`);
            process.exit(1);
        }
        const passwd = fs.readFileSync(PASSWD).toString().split('\n').slice(0, -1);
        let password = null;
        let email = null;
        for (let i = 0; i < passwd.length; ++i) {
            let user = passwd[i].split(' ');
            if (user[0] === username) {
                password = decrypt(user[1], key);
                email = user[2];
                break;
            }
        } 

        if (password === null) {
            console.error('user: `' + username + '` is not found.');
            process.exit(1);
        }

        Login(username, password, email);
    },
    remove: function(username) {
        const passwd = fs.readFileSync(PASSWD).toString().split('\n').slice(0, -1);
        let index = -1;
        for (let i = 0; i < passwd.length; ++i) {
            if (passwd[i].split(' ')[0] === username) {
                index = i;
                break;
            }
        }
        if (index === -1) {
            console.error('user: `' + username + '` is not found.');
            process.exit(1);
        }
        passwd.splice(index, 1);
        fs.writeFileSync(PASSWD, passwd.join('\n') + '\n');
    }
}
