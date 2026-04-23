export class WorldCup {
    teams; 
    #teamsPromise;
    groups;
    groupMatches = new Map();
    isGroupStage = true;

    constructor (gitUser) {
        this.gitUser = gitUser;
        this.#teamsPromise = this.#getAllTeams();
    }

    async #getAllTeams() {
        const URL = "https://development-internship-api.geopostenergy.com/WorldCup/GetAllTeams";

        try {
            const response = await fetch(URL, {
                method: "GET",
                headers: {
                    "git-user": this.gitUser,
                    "Content-Type": "application/json",
                }
            });

            if (!response.ok) {
                throw new Error(`${response.status}: ${response.statusText}`);
            }         

            const teamsResult = await response.json();

            this.teams = teamsResult;
        } catch (err) {
            console.error(`Error: ${err.message}`);
        }
    }

    async createGroups() {
        await this.#teamsPromise;

        const teams = this.teams;

        for (let i = this.teams.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [teams[i], teams[j]] = [teams[j], teams[i]];
        }

        const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
        const groups = new Map();
        
        for (let i = 0; i < 8; i++) {
            const letter = letters[i];
            let start = i * 4;
            const teamsArray = [ teams[start], teams[start + 1], teams[start + 2], teams[start + 3]]

            // adiciona pontos no objeto time para a fase de grupos
            for (let j = 0; j < teamsArray.length; j++) {
                teamsArray[j].points = 0;
                teamsArray[j].goalsDiff = 0;
            }

            groups.set(letter, teamsArray);
        }

        this.groups = groups;
        return groups;
    }

    // gera e retorna todas as partidas
    async generateMatches () {
        const groups = await this.createGroups();

        for (const [k, v] of groups.entries()) {
            this.groupMatches.set(k, this.createGroupMatches(v));
        } 

        this.initGroupMatches();
    }

    createGroupMatches(group) {
        const matches = [];

        for (let i = 0; i <= 2; i++) {
            const team = group[i];
            for (let j = i + 1; j <= 3; j++) {
               const adversary = group[j]; 
               matches.push(this.createMatch(team, adversary));
            }
        }

        return matches; 
    }

    // gera uma partida única com todos os atributos que a partida deve ter
    createMatch(teamOne, teamTwo) {
        return {
            teamOne: teamOne, 
            teamTwo: teamTwo, 
            goalsTeamOne: 0, 
            goalsTeamTwo: 0, 
        }
    }

    initGroupMatches() {
        for (const [group, matches] of this.groupMatches.entries()) {
            let matchesResult = [];
            for (let i = 0; i < 6; i++) {
                const match = matches[i];
                matchesResult.push(this.runMatch(match));                        
            }
            this.groupMatches.set(group, matchesResult);
        }

        console.log("Matches after init: ", this.groupMatches);
    }

    runMatch(match) {
        let goalsTeamOne = 0; 
        let goalsTeamTwo = 0;

        for (let i = 0; i < 90; i++) {
            const possibility = Math.floor(Math.random() * 50);
            if (possibility === 1) {
                goalsTeamOne++;
            } else if (possibility === 2) {
                goalsTeamTwo++;
            }
        }

        if (goalsTeamOne === goalsTeamTwo && !this.isGroupStage) {
            this.runPenalty();
        }

        match.goalsTeamOne = goalsTeamOne;
        match.goalsTeamTwo = goalsTeamTwo;

        return match;
    }

    runPenalty() {

    }
}