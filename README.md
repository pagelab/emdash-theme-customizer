# EmDash Theme Customizer Starter

Starter para acelerar a adocao de customizacao de tema por variaveis CSS em projetos EmDash que seguem as mesmas convencoes de tokens.

## Objetivo

Este repositorio foi estruturado para uso de projeto para projeto (starter de base), mantendo plugin e integracao desacoplados para facilitar migracoes entre temas.

## Estrutura

- `plugin/`: plugin EmDash (UI administrativa, persistencia de overrides, injecao de CSS)
- `integration/`: helper de runtime para aplicar overrides no frontend
- `docs/`: guias de instalacao, integracao e migracao

## Fluxo de uso

1. Levar `plugin/` para o workspace do tema alvo.
2. Registrar `themeCustomizer()` na configuracao do EmDash.
3. Integrar o helper de `integration/` no layout principal para injetar o CSS final de overrides.
4. Validar com o checklist em `docs/MIGRATION_CHECKLIST.md`.

## Documentacao

- Operacao: `docs/INSTALL_AND_OPERATION.md`
- Integracao em layouts diferentes: `docs/ANY_LAYOUT_INTEGRATION.md`
- Checklist de migracao: `docs/MIGRATION_CHECKLIST.md`

## Escopo

- Incluido: base reutilizavel para times que desenvolvem tema + plugin em paralelo.
- Nao incluido: fluxo de publicacao em npm como pacote publico.

## Distribuicao

Este projeto nao e orientado a distribuicao publica em npm no momento. O uso recomendado e como starter interno/versionado por repositorio.
