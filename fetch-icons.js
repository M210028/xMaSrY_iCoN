const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'ItemsData_en.json');
const iconsDir = path.join(__dirname, 'ff-icons');

if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir);
}

async function downloadIcon(item) {
    const itemID = item.itemID;
    const iconName = item.icon;
    
    const savePathID = path.join(iconsDir, `${itemID}.png`);
    const savePathIcon = iconName ? path.join(iconsDir, `${iconName}.png`) : null;

    if (fs.existsSync(savePathID)) {
        return;
    }

    if (savePathIcon && fs.existsSync(savePathIcon)) {
        return;
    }

    const url1 = `https://kog-ff-icons.vercel.app/api/icon/${itemID}?no_fallback=true`;
    const url2 = iconName ? `https://kog-ff-icons.vercel.app/api/icon/${iconName}?no_fallback=true` : null;

    try {
        let response = await fetch(url1);
        
        if (response.ok) {
            const buffer = await response.arrayBuffer();
            fs.writeFileSync(savePathID, Buffer.from(buffer));
            console.log(`Downloaded: ${itemID}.png`);
            return;
        }

        if (url2) {
            response = await fetch(url2);
            if (response.ok) {
                const buffer = await response.arrayBuffer();
                fs.writeFileSync(savePathIcon, Buffer.from(buffer));
                console.log(`Downloaded: ${iconName}.png`);
            } else {
                console.log(`Failed: ${itemID} & ${iconName}`);
            }
        } else {
            console.log(`Failed: ${itemID}`);
        }
    } catch (error) {
        console.error(`Error ${itemID}:`, error.message);
    }
}

async function start() {
    const rawData = fs.readFileSync(dataPath, 'utf8');
    const items = JSON.parse(rawData);
    
    const itemsArray = Array.isArray(items) ? items : Object.values(items);

    for (const item of itemsArray) {
        if (item.hideInIndex === true || !item.icon || item.icon.trim() === "") {
            continue;
        }
        
        await downloadIcon(item);
        await new Promise(resolve => setTimeout(resolve, 100));
    }
}

start();
