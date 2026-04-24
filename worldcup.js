export class WorldCup {
    #teams; 
    #teamsPromise;
    #groups;
    #groupsMatches = new Map();
    #finalMatches = new Map();
    #isGroupStage = true;

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

            this.#teams = teamsResult;
        } catch (err) {
            console.error(`Error: ${err.message}`);
        }
    }

    async #setChampion() {
        const URL = "https://development-internship-api.geopostenergy.com/WorldCup/FinalResult";
        const finalMatch = this.#finalMatches?.get("allMatches")?.get("finals")?.matches;
        if (!finalMatch) {
            console.error("Error getting the final match");
            return;
        }

        const body = {
            "equipeA": finalMatch.teamOne?.token,
            "equipeB": finalMatch.teamTwo?.token,
            "golsEquipeA": finalMatch.goalsTeamOne,
            "golsEquipeB": finalMatch.goalsTeamTwo,
            "golsPenaltyTimeA": finalMatch.goalsPenaltyTeamOne ?? 0,
            "golsPenaltyTimeB": finalMatch.goalsPenaltyTeamTwo ?? 0
        }

        try {
            const response = await fetch(URL, {
                method: "POST",
                headers: {
                    "git-user": this.gitUser,
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                throw new Error(`${response.status}: ${response.statusText}`);
            }

            const result = await response.json();            
            return result;

        } catch(err) {
            console.error(`Error: ${err.message}`);
        }
    }



    async createGroups() {
        await this.#teamsPromise;

        const teams = this.#teams;

        for (let i = teams.length - 1; i > 0; i--) {
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

        this.#groups = groups;
        return groups;
    }

    // gera e retorna todas as partidas
    async generateMatches (groups) {
        // const groups = await this.createGroups();

        for (const [k, v] of groups.entries()) {
            this.#groupsMatches.set(k, this.createGroupMatches(v));
        } 

        const finalMatches = this.initGroupMatches();

        return {
            groupMatches: this.#groupsMatches,
            finalMatches,
        };
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

    createFinalMatches() {
        const teams = []

        for (const groupTeams of this.#groups.values()) {
           teams.push(...groupTeams); 
        }

        for (let i = 0; i < 8; i++) {
            // seleciona o primeiro do grupo para enfrentar o segundo do grupo seguinte
            const teamOne = teams[i];
            const teamTwo = teams[(i + 1) % 8];

            this.#finalMatches.set(i + 1, this.createMatch(teamOne, teamTwo));
        }

        this.#isGroupStage = false;

        const finalMatches = this.initFinalMatches();

        this.#setChampion();

        return finalMatches;
    }

    // gera uma partida única com todos os atributos que a partida deve ter
    createMatch(teamOne, teamTwo) {
        return {
            teamOne: teamOne, 
            teamTwo: teamTwo, 
            goalsTeamOne: 0, 
            goalsTeamTwo: 0, 
            goalsPenaltyTeamOne: undefined, 
            goalsPenaltyTeamTwo: undefined,
        }
    }

    initGroupMatches() {
        for (const [group, matches] of this.#groupsMatches.entries()) {
            let matchesResult = [];
            for (let i = 0; i < 6; i++) {
                const match = matches[i];
                matchesResult.push(this.#runMatch(match));                        
            }
            this.#groupsMatches.set(group, matchesResult);
        }

        return this.#classifyTeams();
    }

    initFinalMatches() {
        let matchesResult = new Map();
        let roundOfSixteen = [];
        let winners = [];
        this.#cleanTeams();

        // oitavas de final
        for (const [id, match] of this.#finalMatches.entries()) {
            const closedMatch = this.#runMatch(match);
            roundOfSixteen.push(closedMatch);
            winners.push(this.#getWinner(closedMatch));
        }

        this.#finalMatches.clear();

        // quartas de final
        let quarterFinals = [];
        let quarterFinalsResult = [];

        for (let i = 0; i < winners.length; i += 2) {
            const teamOne = winners[i];
            const teamTwo = winners[i + 1];
            quarterFinals.push(this.createMatch(teamOne, teamTwo));
        }

        winners = [];

        for (const match of quarterFinals) {
            const closedMatch = this.#runMatch(match);
            quarterFinalsResult.push(closedMatch);
            winners.push(this.#getWinner(closedMatch)); 
        }

        // semifinais
        let semifinals = [];
        let semifinalsResult = [];
        for (let i = 0; i < winners.length; i += 2) {
            const teamOne = winners[i];
            const teamTwo = winners[i + 1];
            semifinals.push(this.createMatch(teamOne, teamTwo));
        }

        winners = [];

        for (const match of semifinals) {
            const closedMatch = this.#runMatch(match);
            semifinalsResult.push(closedMatch);
            winners.push(this.#getWinner(closedMatch));
        }

        // final
        const [ finalistOne, finalistTwo ] = winners;
        const finalMatch = this.createMatch(finalistOne, finalistTwo);
        console.log(`${finalistOne.nome} X ${finalistTwo.nome}`);

        const finalsResult = this.#runMatch(finalMatch);

        matchesResult.set("roundOfSixteen", {"matches": roundOfSixteen });
        matchesResult.set("quarterFinals", {"matches": quarterFinalsResult });
        matchesResult.set("semifinals", { "matches": semifinalsResult });
        matchesResult.set("finals", { matches: finalsResult });
        this.#finalMatches.set("allMatches", matchesResult);

        return matchesResult;
    }

    #cleanTeams() {
        for (const [id, match] of this.#finalMatches.entries()) {
            delete match.teamOne.points;
            delete match.teamOne.goalsDiff;
            delete match.teamTwo.points;
            delete match.teamTwo.goalsDiff;
        }
    }

    #classifyTeams() {
        for (const [group, matches] of this.#groupsMatches.entries()) {
            this.#rankGroup(group, matches);
        }


        for (const [group, teams] of this.#groups.entries()) {
            // rankeia os times baseados nos critérios padrões 
            teams.sort((a, b) => this.#compareTeamsPoints(a, b));
            // muta o grupo original com os times classificados
            const classified = teams.slice(0, 2);
            this.#groups.set(group, classified);
        }

        return this.createFinalMatches();
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
            const arrTeams = this.#groups.get(group);

            for (let i = 0; i < arrTeams.length; i++) {
                if (arrTeams[i].nome === newTeam.nome) {
                    arrTeams[i] = newTeam;
            }
        }
    }
    

    #compareTeamsPoints(teamOne, teamTwo) {
        if (teamOne.points > teamTwo.points) {
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

    #getWinner(match) {
        let winner;

        if (match.goalsTeamOne > match.goalsTeamTwo) {
            winner = match.teamOne;
        }

        if (match.goalsTeamOne < match.goalsTeamTwo) {
            winner = match.teamTwo;
        }

        if (match.goalsPenaltyTeamOne > match.goalsPenaltyTeamTwo) {
            winner = match.teamOne; 
        }

        if (match.goalsPenaltyTeamOne < match.goalsPenaltyTeamTwo) {
            winner = match.teamTwo;
        }

        return winner;
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

        if (goalsTeamOne === goalsTeamTwo && !this.#isGroupStage) {
            const { scoreOne, scoreTwo } = this.#runPenalty();
            match.goalsPenaltyTeamOne = scoreOne; 
            match.goalsPenaltyTeamTwo = scoreTwo;
            console.log(`Penalty Result: ${match.teamOne.nome} ${match.goalsPenaltyTeamOne} X ${match.goalsPenaltyTeamTwo} ${match.teamTwo.nome}`)
        }

        match.goalsTeamOne = goalsTeamOne;
        match.goalsTeamTwo = goalsTeamTwo;

        return match;
    }

    #runPenalty() {
        let scoreOne = 0;
        let scoreTwo = 0;

        for (let i = 0; i < 5; i++) {
            const goalOne = Math.random() < 0.6;
            if (goalOne) scoreOne++;

            const goalTwo = Math.random() < 0.6;
            if (goalTwo) scoreTwo++;

            // verifica se a vantagem é maior do que o número de rodadas restante
            if (Math.abs(scoreOne - scoreTwo) > (4 - i)) {
                break;
            }

        }

        while (scoreOne === scoreTwo) {
            const goalOne = Math.random() < 0.5;
            if (goalOne) scoreOne++;

            const goalTwo = Math.random() < 0.5;
            if (goalTwo) scoreTwo++;
        }

        return { scoreOne, scoreTwo };
    }
    
}