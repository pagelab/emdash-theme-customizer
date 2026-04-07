# Checklist de Migracao

## Plugin

- [ ] Copiar/instalar pacote `@dashstyle/theme-customizer`
- [ ] Confirmar `entrypoint` do sandbox
- [ ] Confirmar `capabilities: ["page:inject"]`

## Integracao de Layout

- [ ] Instalar/usar helper `@dashstyle/theme-customizer-integration`
- [ ] Injetar `<style data-theme-customizer>` no fim do `<head>`
- [ ] Confirmar `addImportant: true`

## Tokens

- [ ] Todos os tokens do plugin existem no CSS do tema
- [ ] Tokens dark possuem `mapKey` valido
- [ ] Nao existem aliases quebrados

## Validacao Funcional

- [ ] Save atualiza os campos imediatamente
- [ ] Reset restaura valores imediatamente
- [ ] Frontend aplica override de tipografia
- [ ] Frontend aplica override de cor
- [ ] Dark mode aplica overrides corretamente

## Go-live

- [ ] Testado em ambiente local
- [ ] Testado em preview/staging
- [ ] Sem regressao visual relevante
