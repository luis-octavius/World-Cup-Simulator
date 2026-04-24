export class WorldCup {
    teams; 
    #teamsPromise;
    groups;
    groupsMatches = new Map();
    finalMatches = new Map();
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
            this.groupsMatches.set(k, this.createGroupMatches(v));
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
        for (const [group, matches] of this.groupsMatches.entries()) {
            let matchesResult = [];
            for (let i = 0; i < 6; i++) {
                const match = matches[i];
                matchesResult.push(this.#runMatch(match));                        
            }
            this.groupsMatches.set(group, matchesResult);
        }

        console.log("Matches after init: ", this.groupsMatches);
        console.log(this.groups);

        this.#classifyTeams();
    }

    #classifyTeams() {
        for (const [group, matches] of this.groupsMatches.entries()) {
            this.#rankGroup(group, matches);
        }

        console.log("Group after pointsUp: ", this.groups);
    }

    #rankGroup(group, groupMatches) {
       // compara os pontos dos times 
        for (let i = 0; i < 6; i++) {
            const match = groupMatches[i];
            const teamOne = match.teamOne; 
            const teamTwo = match.teamTwo;

            // calcula os pontos e o saldo de gols
            const { teamOnePoint, teamTwoPoint } = this.#calculateMatchGroupResult(match);
            const { goalsDiffTeamOne, goalsDiffTeamTwo } = this.#calculateGoalsDiff(match.goalsTeamOne, match.goalsTeamTwo);


            // adiciona os pontos e saldo de gols
            teamOne.points += teamOnePoint;
            teamOne.goalsDiff += goalsDiffTeamOne;
            teamTwo.points += teamTwoPoint;
            teamTwo.goalsDiff += goalsDiffTeamTwo;


            this.#mutateTeamInGroup(group, teamOne);
            this.#mutateTeamInGroup(group, teamTwo);
        }
    }

    #calculateMatchGroupResult(match) {
        let teamOnePoint = 1;
        let teamTwoPoint = 1;

        if (match.goalsTeamOne > match.goalsTeamTwo) {
            teamOnePoint = 3;
            teamTwoPoint = 0;
        } else if (match.goalsTeamOne < match.goalsTeamTwo) {
            teamOnePoint = 0;
            teamTwoPoint = 3;
        } 

        return { teamOnePoint, teamTwoPoint }
    }


    // procura o time correspondente e muta o array de times com novos pontos
    #mutateTeamInGroup(group, newTeam) {
            const arrTeams = this.groups.get(group);

            for (let i = 0; i < arrTeams.length; i++) {
                if (arrTeams[i].nome === newTeam.nome) {
                    arrTeams[i] = newTeam;
            }
        }
    }
    

    #compareTeamsPoints(teamOne, teamTwo) {
        if (teamOne.points > teamTwoPoints) {
            return -1;
        }

        if (teamOne.points < teamTwo.points) {
            return 1;
        }

        if (teamOne.goalsDiff > teamTwo.goalsDiff) {
            return -1;
        }

        if (teamOne.goalsDiff < teamTwo.goalsDiff) {
            return 1;
        }

        // caso os críterios de desempate sejam iguais, gera aleatoriamente um vencedor
        return Math.random() < 0.5 ? -1 : 1;
    }

    #calculateGoalsDiff(goalsTeamOne, goalsTeamTwo) {
        const goalsDiffTeamOne = goalsTeamOne - goalsTeamTwo;
        const goalsDiffTeamTwo = goalsTeamTwo - goalsTeamOne;

        return {
            goalsDiffTeamOne, goalsDiffTeamTwo
        }
    }

    #runMatch(match) {
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
            this.#runPenalty();
        }

        match.goalsTeamOne = goalsTeamOne;
        match.goalsTeamTwo = goalsTeamTwo;

        return match;
    }

    #runPenalty() {
       console.log("Penalty...") 
    }

    
}