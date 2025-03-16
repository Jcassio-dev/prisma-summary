
// eng version and pt-br version link

# Prisma Summary

Prisma Summary is a VS Code extension that helps you manage and navigate through your Prisma schema files more efficiently. 🚀

## Features

- 🔄 Automatically sorts your Prisma schema files.
- 🔍 Provides easy navigation through models, enums, and other Prisma schema components.
- ✨ Highlights syntax and provides IntelliSense for Prisma schema files.

## Installation

1. Open VS Code.
2. Go to the Extensions view by clicking on the Extensions icon in the Activity Bar on the side of the window.
3. Search for `Prisma Summary`.
4. Click Install.

## Usage

1. Open a Prisma schema file.
2. Use the command palette (`Ctrl+Shift+P` or `Cmd+Shift+P` on macOS) and search for `Prisma Summary`.
3. Select the desired command to sort or navigate through your schema.

## Folder Structure
Here's a quick overview of the folder structure:

```markdown
prisma-sorter/
├── .vscode/                # VS Code configuration files
│   ├── extensions.json     # Recommended extensions for the project
│   ├── launch.json         # Debugger configuration
│   ├── settings.json       # Workspace settings
│   ├── tasks.json          # Task runner configuration
├── dist/                   # Compiled output files
├── node_modules/           # Project dependencies
├── src/                    # Source code
│   ├── commands/           # Command implementations
│   │   ├── index.ts        # Command entry point
│   │   ├── sort.commands.ts# Sorting command logic
│   │   ├── summary.commands.ts# Summary command logic
│   ├── models/             # Data models
│   │   ├── prisma.model.ts # Prisma schema model
│   ├── services/           # Service implementations
│   │   ├── sorter.service.ts# Sorting service logic
│   │   ├── summary.service.ts# Summary service logic
│   ├── utils/              # Utility functions
│   │   ├── file.utils.ts   # File utility functions
│   ├── views/              # View components
│   │   ├── tree.view.ts    # Tree view component
│   │   ├── webview.view.ts # Webview component
│   ├── extension.ts        # Extension entry point
│   ├── test/               # Test files
│   │   ├── extension.test.ts# Extension test cases
├── .gitignore              # Git ignore file
├── .vscodeignore           # VS Code ignore file
├── CHANGELOG.md            # Project changelog
├── LICENSE                 # License file
├── package.json            # Project configuration
├── README.md               # Project readme
├── tsconfig.json           # TypeScript configuration
├── webpack.config.js       # Webpack configuration
```

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request. 🙌

## License

This project is licensed under the MIT License.



# Prisma Summary

Prisma Summary é uma extensão do VS Code que ajuda você a gerenciar e navegar pelos seus arquivos de esquema Prisma de forma mais eficiente. 🚀

## Funcionalidades

- 🔄 Ordena automaticamente seus arquivos de esquema Prisma.
- 🔍 Fornece navegação fácil através de modelos, enums e outros componentes do esquema Prisma.
- ✨ Realça a sintaxe e fornece IntelliSense para arquivos de esquema Prisma.

## Instalação

1. Abra o VS Code.
2. Vá para a visualização de Extensões clicando no ícone de Extensões na Barra de Atividades no lado da janela.
3. Procure por `Prisma Summary`.
4. Clique em Instalar.

## Uso

1. Abra um arquivo de esquema Prisma.
2. Use o paleta de comandos (`Ctrl+Shift+P` ou `Cmd+Shift+P` no macOS) e procure por `Prisma Summary`.
3. Selecione o comando desejado para ordenar ou navegar pelo seu esquema.

## Estrutura de Pastas

Aqui está uma visão rápida da estrutura de pastas:

```markdown
prisma-sorter/
├── .vscode/                # Arquivos de configuração do VS Code
│   ├── extensions.json     # Extensões recomendadas para o projeto
│   ├── launch.json         # Configuração do depurador
│   ├── settings.json       # Configurações do workspace
│   ├── tasks.json          # Configuração do executor de tarefas
├── dist/                   # Arquivos de saída compilados
├── node_modules/           # Dependências do projeto
├── src/                    # Código fonte
│   ├── commands/           # Implementações de comandos
│   │   ├── index.ts        # Ponto de entrada dos comandos
│   │   ├── sort.commands.ts# Lógica do comando de ordenação
│   │   ├── summary.commands.ts# Lógica do comando de resumo
│   ├── models/             # Modelos de dados
│   │   ├── prisma.model.ts # Modelo de esquema Prisma
│   ├── services/           # Implementações de serviços
│   │   ├── sorter.service.ts# Lógica do serviço de ordenação
│   │   ├── summary.service.ts# Lógica do serviço de resumo
│   ├── utils/              # Funções utilitárias
│   │   ├── file.utils.ts   # Funções utilitárias de arquivos
│   ├── views/              # Componentes de visualização
│   │   ├── tree.view.ts    # Componente de visualização em árvore
│   │   ├── webview.view.ts # Componente de visualização web
│   ├── extension.ts        # Ponto de entrada da extensão
│   ├── test/               # Arquivos de teste
│   │   ├── extension.test.ts# Casos de teste da extensão
├── .gitignore              # Arquivo de ignore do Git
├── .vscodeignore           # Arquivo de ignore do VS Code
├── CHANGELOG.md            # Registro de alterações do projeto
├── LICENSE                 # Arquivo de licença
├── package.json            # Configuração do projeto
├── README.md               # Leia-me do projeto
├── tsconfig.json           # Configuração do TypeScript
├── webpack.config.js       # Configuração do Webpack
```

## Contribuindo

Contribuições são bem-vindas! Por favor, faça um fork do repositório e envie um pull request. 🙌

## Licença

Este projeto está licenciado sob a Licença MIT.