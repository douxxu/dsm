# 🧰 DouServiceManager

DSM is a tool for creating / removing services files on your debian based machine using systemd

## 📀 Requirements

To work properly, DouServiceManager requires:

**Bases:**
- [NodeJs](https://nodejs.org/en)
- [NPM](https://www.npmjs.com/package/npm)

**Packages:**
- [Yargs](https://yargs.js.org/)
- [Colors](https://www.npmjs.com/package/colors)

*note: all these packages are on [npmjs.org](https://npmjs.com) and can be installed with the command `npm install xyz` (xyz is the package name)*

## 🖥 Installation

### 1 Install from npmjs
1. To install the cli tool using npmjs, run the following command as administrator:
```bash
npm i -g dsmngr
```

### 2 Install from source
1. To install from source, first clone the official repository:
```bash
git clone https://github.com/douxxu/DouServiceManager
```
2. Go into the repo and install it using npm:
```bash
npm i -g
```

### DSM is now installed, you can now run it with
```
dsm
```
> or `dsmngr`

## ⚡️ Running DSM

You can run DSM from anywhere in your debian system using the following command:
```
dsm
```

This command will show an help table. You can use different options after the command:

`add`: for adding a new service 
`remove`: for removing an existant service

`add` has 2 arguments: `-c "<command>"` (the command that will be runned in the service) witch is required and `-n <service name>` (the name of the service)
`remove` has 1 argument: `-n <service name>` (the name of the service that you want to remove)


### LICENSE
This project is licensed under the GPL3.0 license.