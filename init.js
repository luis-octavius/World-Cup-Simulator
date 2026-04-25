import { WorldCup } from "./worldcup.js";

const container = document.querySelector('.container');
const app = document.querySelector('#app');

export async function init() {
    const worldCup = new WorldCup("luis-octavius");

    const groupResultsContainer = createExtraContainer("Resultados da fase de grupos");
    const finalsContainer = createExtraContainer("Fase final (oitavas ate a final)");

    setLoading(container, "Carregando grupos...");

    const groups = await worldCup.createGroups();
    renderGroups(groups);

    const buttonInit = createStartButton();
    buttonInit.addEventListener('click', async () => {
        buttonInit.disabled = true;
        buttonInit.textContent = "Rodadas em andamento...";

        setLoading(groupResultsContainer, "Simulando partidas da fase de grupos...");
        setLoading(finalsContainer, "Aguardando classificação para a fase final...");

        await delay(2000);
        const results = await worldCup.generateMatches(groups);
        renderGroupMatches(results.groupMatches, groupResultsContainer);

        await delay(4000);
        renderFinalStages(results.finalMatches, finalsContainer);

        buttonInit.textContent = "Simulação concluída";
    }, { once: true });
}

function renderGroups(groups) {
    container.innerHTML = '';

    for (const [k, v] of groups.entries()) {
        createGroupEl(k, v);
    }
}

function createStartButton() {
    const buttonInit = document.createElement('button');
    buttonInit.classList.add('btn-init');
    buttonInit.textContent = "Iniciar rodadas"
    app.append(buttonInit);
    return buttonInit;
}

function createExtraContainer(title) {
    const section = document.createElement('section');
    section.classList.add('results-section');

    const heading = document.createElement('h2');
    heading.textContent = title;
    heading.classList.add('section-title');

    const div = document.createElement('div');
    div.classList.add('results-container');

    section.append(heading, div);
    app.append(section);
    return div;
}

function setLoading(containerEl, message) {
    containerEl.innerHTML = '';
    const loading = document.createElement('p');
    loading.classList.add('loading-text');
    loading.textContent = message;
    containerEl.append(loading);
}

function delay(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
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

function renderGroupMatches(groupMatches, targetContainer) {
    targetContainer.innerHTML = '';

    for (const [group, matches] of groupMatches.entries()) {
        const wrapper = document.createElement('div');
        wrapper.classList.add('match-block');

        const title = document.createElement('h3');
        title.textContent = `Grupo ${group}`;
        wrapper.append(title);

        for (const match of matches) {
            const item = document.createElement('p');
            item.textContent = formatMatch(match);
            wrapper.append(item);
        }

        targetContainer.append(wrapper);
    }
}

function renderFinalStages(finalStages, targetContainer) {
    targetContainer.innerHTML = '';

    const finalMatch = finalStages.get('finals')?.matches;
    if (finalMatch) {
        const championCard = createChampionCard(finalMatch);
        targetContainer.append(championCard);
    }

    const rounds = [
        {
            title: 'Oitavas de final',
            matches: finalStages.get('roundOfSixteen')?.matches ?? [],
            className: 'round-sixteen',
        },
        {
            title: 'Quartas de final',
            matches: finalStages.get('quarterFinals')?.matches ?? [],
            className: 'round-quarter',
        },
        {
            title: 'Semifinais',
            matches: finalStages.get('semifinals')?.matches ?? [],
            className: 'round-semi',
        },
        {
            title: 'Final',
            matches: [finalStages.get('finals')?.matches].filter(Boolean),
            className: 'round-final',
        },
    ];

    for (const round of rounds) {
        const wrapper = document.createElement('div');
        wrapper.classList.add('match-block');
        wrapper.classList.add(round.className);

        const roundTitle = document.createElement('h3');
        roundTitle.textContent = round.title;
        wrapper.append(roundTitle);

        for (const match of round.matches) {
            const item = document.createElement('p');
            item.textContent = formatMatch(match);
            wrapper.append(item);
        }

        targetContainer.append(wrapper);
    }
}

function createChampionCard(finalMatch) {
    const champion = getMatchWinner(finalMatch);

    const card = document.createElement('div');
    card.classList.add('champion-card');

    const label = document.createElement('p');
    label.classList.add('champion-label');
    label.textContent = 'Campeão';

    const name = document.createElement('h3');
    name.classList.add('champion-name');
    name.textContent = champion.nome;

    const detail = document.createElement('p');
    detail.classList.add('champion-detail');
    detail.textContent = formatMatch(finalMatch);

    card.append(label, name, detail);
    return card;
}

function getMatchWinner(match) {
    if (match.goalsTeamOne > match.goalsTeamTwo) return match.teamOne;
    if (match.goalsTeamTwo > match.goalsTeamOne) return match.teamTwo;

    if (match.goalsPenaltyTeamOne > match.goalsPenaltyTeamTwo) return match.teamOne;
    return match.teamTwo;
}

function formatMatch(match) {
    const normalTime = `${match.teamOne.nome} ${match.goalsTeamOne} x ${match.goalsTeamTwo} ${match.teamTwo.nome}`;

    if (match.goalsPenaltyTeamOne === undefined || match.goalsPenaltyTeamTwo === undefined) {
        return normalTime;
    }

    return `${normalTime} (pênaltis ${match.goalsPenaltyTeamOne} x ${match.goalsPenaltyTeamTwo})`;
}