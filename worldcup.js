export class WorldCup {
    teams; 
    #teamsPromise;
    groups;

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
            console.log(teamsResult)

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
            groups.set(letter, [ teams[start], teams[start + 1], teams[start + 2], teams[start + 3]]);
        }

        console.log("groups: ", groups)

        this.groups = groups;
        return groups;
    }
}