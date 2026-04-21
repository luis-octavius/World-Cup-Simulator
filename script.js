import { WorldCup } from "./worldcup.js";

const container = document.querySelector('.container');

function main() {
    const worldCup = new WorldCup('luis-octavius');
    
    const groups = worldCup.createGroups();
    renderGroups(groups); 
}

async function renderGroups(groups) {
    const resolvedGroups = await groups; 

    for (const [k, v] of resolvedGroups.entries()) {
        console.log("Key: ", k);
        console.log("Value: ", v);
        createGroupEl(k, v);
    }
}

function createGroupEl(letter, teams) {
    const divGroup = document.createElement('div');
    divGroup.classList.add('group-div');
    const h1 = document.createElement('h1');    
    h1.textContent = letter;
    divGroup.append(h1);

    const list = document.createElement('div');
    divGroup.append(list);

    for (let i = 0; i < teams.length; i++) {
        const item = document.createElement('p');
        item.textContent = teams[i].nome;
        list.append(item);
    }

    container.append(divGroup);
}

main();