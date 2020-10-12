const electron = require('electron');
const { app, BrowserWindow, Tray, Menu, clipboard, globalShortcut } = electron;
const path = require('path')

let mainWindow;

const STACK_SIZE = 5;
const ITEM_MAX_LENGTH = 20;

function addToStack(item, stack) {
    return [item].concat(stack.length >= STACK_SIZE ? stack.slice(0, stack.length - 1) : stack);
}

function checkClipboardForChange(clipboard, onchange) {
    let cache = clipboard.readText();
    let latest;
    setInterval(_ => {
        latest = clipboard.readText();
        if (latest !== cache) {
            cache = latest;
            onchange(cache);
        }
    }, 1000)
};

function registerShortcuts(globalShortcut, clipboard, stack) {
    globalShortcut.unregisterAll();
    for (let i = 0; i < STACK_SIZE; i++) {
        globalShortcut.register(`CommandOrControl+Alt+${i + 1}`, _ => {
            clipboard.writeText(stack[i]);
        });
    }
}

function formatItem(item) {
    return item && item.length > ITEM_MAX_LENGTH ? item.substr(0, ITEM_MAX_LENGTH) + "..." : item;
}

function formatMenu(clipboard, stack) {
    return stack.map((item, i) => {
        return {
            label: `Copy: ${formatItem(item)}`,
            click: _ => clipboard.writeItem(item),
            accelerator: `CommandOrControl+Alt+${i + 1}`
        }
    });
}

app.on('ready', _ => {
    let stack = []
    const tray = new Tray(path.join('src', 'spellbook.png'));
    tray.setContextMenu(Menu.buildFromTemplate([
        {
            label: '<Empty>', enabled: false
        }
    ]))
    checkClipboardForChange(clipboard, text => {
        stack = addToStack(text, stack);
        console.log(stack);
        tray.setContextMenu(Menu.buildFromTemplate(formatMenu(clipboard, stack)))
        registerShortcuts(globalShortcut, clipboard, stack)
    })
    mainWindow = new BrowserWindow();
});

app.on('will-quit', _ => {
    globalShortcut.unregisterAll();
});