# Instalacao e Operacao

## 1) Instalar o plugin no projeto de tema

Voce pode usar 2 estrategias:

- Estrategia A: copiar a pasta `plugin/` deste starter para o monorepo do projeto.
- Estrategia B: publicar o pacote e instalar por dependencia.

No projeto de destino, registre o plugin no `astro.config.mjs`:

```ts
import { emdash } from "emdash/astro";
import { themeCustomizer } from "@dashstyle/theme-customizer";

export default defineConfig({
  integrations: [
    emdash({
      plugins: [themeCustomizer()],
    }),
  ],
});
```

## 2) Operar no admin

1. Acesse `/_emdash/admin`.
2. Abra a pagina do plugin: `Theme Customizer`.
3. Altere os campos de design token (cores, tipografia, espacamento, layout).
4. Salve por secao.
5. Use `Reset All to Defaults` para limpar overrides.

## 3) Como o plugin persiste os dados

- Schema: `plugin:theme-customizer:__schema__`
- Overrides: `plugin:theme-customizer:css:<token>`

## 4) Comportamento ja resolvido no plugin

- Campos nao desaparecem apos salvar.
- Campos mostram valores atualizados sem refresh completo.
- CSS gerado usa prioridade alta para sobrescrever defaults do tema.

## 5) Verificacao rapida

- Salve `font-size-3xl` com valor de teste.
- Confirme no HTML final que existe `<style data-theme-customizer>`.
- Confirme no browser que o valor aplicado e o override, nao o default.
