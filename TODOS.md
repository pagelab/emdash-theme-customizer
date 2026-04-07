# TODOs

1. [NAO VIAVEL] Converter campos de cores em color pickers.
   - Investigado: Block Kit nao possui elemento `color_picker` nem parametro `input_type`
     no `TextInputElement`. Unica renderizacao possivel e `<input>` texto puro.
   - `CSSVarDef.type: "color"` existe no schema do plugin mas nao e consumido pelo Block Kit.
   - Alternativa futura: contribuir `color_input` ao pacote `@emdash-cms/blocks`.
2. [IMPLEMENTADO] Controles de incremento para campos de texto (CSS values).
   - `number_input` (nativo do Block Kit) fornece setas de incremento/decremento do browser.
   - `select` ao lado permite escolher a unidade CSS (px, rem, em, %, vw, vh).
   - Campos de cor (`type: "color"`) permanecem como `text_input`.
   - No submit, valores `__num` + `__unit` sao recombinados em string CSS (ex: `1.5rem`).
   - Limitacao: `NumberInputElement` nao suporta `step` — stepper nativo incrementa por 1.
     Para rem (0.75 → 1.75) o salto e grande, mas o usuario pode digitar qualquer decimal.
   - Label inclui valor default para referencia: "XS Font Size (default: 0.75rem)".
3. [IMPLEMENTADO] Abas horizontais por tipo de variavel.
   - EmDash suporta `adminPages` no `PluginDescriptor` — array de `{ path, label, icon? }`.
   - O framework gera automaticamente navegacao (tabs) entre as paginas registradas.
   - Cada grupo de variaveis agora e uma pagina separada: Colors, Typography, Layout, Spacing, Dark Mode Colors.
   - Paginas sao geradas dinamicamente a partir de `options.groups` + `options.darkGroups`.
   - Admin handler filtra blocos pelo `interaction.page` slug, mostrando apenas o grupo da pagina ativa.
4. [IMPLEMENTADO] Grupo de fontes com SELECT e Google Fonts dinamico.
   - Adicionado `type: "select"` ao `CSSVarDef` (ao lado de "color" e "text").
   - Grupo "Fonts" com SELECT para `--font-sans`: Inter, Roboto, Open Sans, Lato, Poppins, Montserrat, Source Sans 3, Merriweather, System UI.
   - `buildFormFields` renderiza `select` elements nativos do Block Kit para campos tipo "select".
   - `buildCSS` expande nomes de fontes em font stacks completos (ex: "Roboto" → `"Roboto", system-ui, sans-serif`).
   - Base.astro: link do Google Fonts agora e dinamico — carrega a fonte selecionada pelo admin.
   - Quando "System UI" selecionado, nenhum link externo de fonte e carregado.
   - Nao foram adicionados arquivos .woff locais (download manual necessario).
     Para adicionar: colocar em `public/fonts/`, declarar `@font-face` no layout, adicionar opcao ao SELECT.
