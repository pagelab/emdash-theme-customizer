# Integracao Em Qualquer Layout

Este guia cobre as alteracoes necessarias para funcionar em qualquer tema/layout onde os design tokens sejam conhecidos e controlados.

## Objetivo

Garantir que os overrides do plugin sempre vencam os valores padrao dos tokens do tema.

## Requisito minimo do layout

No layout principal (ou no componente global de head):

1. Ler CSS de override em runtime.
2. Injetar `<style data-theme-customizer>` no fim de `<head>`.

Use o helper deste starter:

```astro
---
import { buildThemeCustomizerCSS } from "@dashstyle/theme-customizer-integration";

let themeCSS = "";
try {
  themeCSS = await buildThemeCustomizerCSS({
    pluginId: "theme-customizer",
    addImportant: true,
  });
} catch {}
---

<head>
  <!-- outros estilos -->
  {themeCSS && <style data-theme-customizer set:html={themeCSS} />}
</head>
```

## Por que isso e necessario

Dependendo da versao/configuracao do EmDash, o hook `page:fragments` pode nao executar em paginas publicas. O helper de runtime evita dependencia dessa etapa e garante que os tokens sejam aplicados.

## Regras para qualquer tema

- Os nomes dos tokens no plugin devem casar com os nomes de variaveis CSS usados no tema.
- Tokens dark com `mapKey` devem apontar para a variavel light correta.
- O style de override deve ficar por ultimo no `<head>`.

## Modo recomendado de prioridade

- Manter `addImportant: true`.
- Nao declarar variaveis com `!important` conflitante depois do style de override.

## Se o core do EmDash for corrigido no futuro

Voce pode remover o helper de runtime e voltar para injecao exclusiva via `page:fragments`.
