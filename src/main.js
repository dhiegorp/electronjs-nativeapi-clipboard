const electron = require('electron');
const { app, BrowserWindow, Tray, Menu, clipboard } = electron;
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

function formatItem(item) {
    return item && item.length > ITEM_MAX_LENGTH ? stac.substr(0, ITEM_MAX_LENGTH) + "..." : item;
}

function formatMenu(clipboard, stack) {
    return stack.map((item, i) => 
        return {
        label: `Copy: ${formatItem(item)}`,
        click: _ => clipboard.writeItem(item)
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
        tray.setContextMenu(Menu.buildFromTemplate(formatMenu(stack)))
    })
    mainWindow = new BrowserWindow();
});