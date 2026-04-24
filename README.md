# World Cup Simulator

## Sobre o Projeto

Este aplicativo simula uma Copa do Mundo de futebol completa, desde a fase de grupos até a grande final. Utiliza uma API real para buscar informações dos times e registrar o campeão.

## Funcionalidades

- **Busca automática de times** via API
- **Sorteio aleatório** dos grupos (A a H)
- **Simulação completa** da fase de grupos
- **Sistema de pontuação** com critérios de desempate:
  - Pontos ganhos
  - Saldo de gols
  - Gols marcados
- **Fase eliminatória** (Oitavas → Quartas → Semifinais → Final)
- **Disputa de pênaltis** em caso de empate
- **Registro automático** do campeão na API

## Tecnologias Utilizadas

- **HTML5** - Estrutura da aplicação
- **CSS3** - Estilização e layout responsivo
- **JavaScript (ES6+)** - Lógica do simulador

## Fluxo da Aplicação

```graph TD
    A[Início] --> B[Fetch dos Times via API]
    B --> C[Sorteio e Separação em Grupos]
    C --> D[Clique em "Iniciar rodadas"]
    D --> E[Simulação da Fase de Grupos]
    E --> F[Exibição dos Resultados]
    F --> G[Fase Eliminatória]
    G --> H[Oitavas de Final]
    H --> I[Quartas de Final]
    I --> J[Semifinais]
    J --> K[Final]
    K --> L[Exibição do Campeão]
    L --> M[Envio do Resultado à API]
```

## Como Executar

### Pré-requisitos
- Navegador web moderno (Chrome, Firefox, Edge, Safari)
- Conexão com internet (para acessar a API)
- Abrir a [página](https://luis-octavius.github.io/World-Cup-Simulator/)

## Estrutura do Projeto

```
world-cup-simulator/
├── index.html          # Página principal
├── style.css           # Estilos da aplicação
├── script.js           # Ponto de entrada
├── init.js             # Responsável pela inicialização e dinamicidade 
├── README.md           # Documentação
└── worldcup.js         # Classe responsável por manipular toda a lógica da aplicação
```

## Regras da Simulação

### Fase de Grupos
- 8 grupos com 4 times cada
- 3 turnos com cada time enfrentando os outros sem repetição
- Vitória = 3 pontos | Empate = 1 ponto | Derrota = 0 pontos

### Critérios de Desempate
1. Maior número de pontos
2. Melhor saldo de gols
3. Aleatório (50% cada)

### Fase Eliminatória
- Em caso de empate, decisão por pênaltis
- Sorteio dos confrontos baseado na classificação

## 🖥️ Interface

A interface é totalmente responsiva e inclui:

- **Tabela da fase de grupos** com todos os resultados
- **Tabela da fase final** com todos os resultados
- **Placar** das partidas

## Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## Contato

Luis Octávio - luisoctavius.sc@gmail.com

3. Adicione uma seção de "Demo" com link para versão online
4. Coloque um GIF animado mostrando a simulação
5. Liste as dependências (se houver)
