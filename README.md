# Theme Customizer Starter (Portable)

Projeto portatil para levar o plugin de Theme Customizer para qualquer projeto de tema com EmDash.

## Estrutura

- `plugin/`: pacote do plugin (admin + persistencia + hooks)
- `integration/`: helper de runtime para injetar CSS em qualquer layout
- `docs/`: instrucoes operacionais e checklist de migracao

## Quick Start

1. Copie `plugin/` para o monorepo do projeto destino.
2. Registre `themeCustomizer()` no `astro.config.mjs`.
3. Use o helper de `integration/` no layout principal para injetar o style de override no final do `<head>`.
4. Siga os passos em `docs/INSTALL_AND_OPERATION.md`.

## Docs

- Instalacao e operacao: `docs/INSTALL_AND_OPERATION.md`
- Integracao para qualquer layout: `docs/ANY_LAYOUT_INTEGRATION.md`
- Checklist de migracao: `docs/MIGRATION_CHECKLIST.md`

## Escopo de Portabilidade

- O pacote `plugin/` cobre admin e persistencia de overrides.
- O pacote `integration/` cobre aplicacao garantida dos tokens no frontend quando o pipeline de fragments do core nao for suficiente.

## Recomendacao

Para novos temas, sempre trate plugin e integracao de layout como dois blocos separados: isso reduz acoplamento e acelera migracoes.
