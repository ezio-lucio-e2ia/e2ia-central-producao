# E2IA — Central de Produção (versão 2.0)

## Novidades da versão 2.0 (inspiradas em Trello, Notion, Hootsuite, Sked e Post Planner)
- **Quadro de tarefas** estilo Trello: colunas por situação, arrastar no computador e botões ◀ ▶ no celular. Alterne entre Quadro e Lista.
- **Prazo** nas tarefas, com aviso "atrasada" em vermelho.
- **Modelo de lançamento de e-book**: 8 tarefas prontas com um toque.
- **Calendário mensal de posts**: toque num dia para criar post naquela data.
- **Gerador de posts por modelo** (dica, pergunta, reflexão, e-book, bastidores) com seu link de venda e hashtags prontas, contador de caracteres e botão de enviar pelo WhatsApp.
- **Prompt pronto** em cada assistente: copie e cole no ChatGPT, Gemini ou Claude (o app ainda não conversa com IA sozinho).

## Novidades da versão 1.1
- Nova aba **Divulgação**: planejador de posts para Instagram, Facebook e WhatsApp, com link de venda do e-book e botão de copiar.
- Assistentes agora seguem as 10 funções do E2IA (NEXO, NÔMADES, BERÉIA, ARQUITETO, ESCRIBA, PRISMA, ATALAIA, FORJA, ARAUTO, MERCADOR). As descrições são provisórias: ajuste conforme o documento mestre.
- Botão **Instalar no celular** (Android/Chrome) e instrução para iPhone.
- Atualizações chegam sozinhas (cache "rede primeiro") e os ícones funcionam offline.
- Cópias de segurança antigas continuam sendo aceitas.

## O que esta versão já faz
- Painel responsivo para computador e celular.
- Cadastro, edição, exclusão, busca e filtros de tarefas.
- Controle de situação: Pendente, Em andamento, Aguardando autorização e Concluída.
- Prioridades e responsáveis.
- Cadastro de produtos digitais e visão de progresso.
- Perfis de assistentes e padrões de qualidade.
- Exportação e importação de cópia de segurança em JSON.
- Salvamento local no navegador.
- Estrutura PWA e cache offline quando servida por HTTPS ou localhost.

## Como abrir agora
1. Extraia o arquivo ZIP para uma pasta no computador.
2. Abra `index.html` no navegador (Edge, Chrome ou outro moderno).
3. Os recursos principais funcionam localmente. A instalação como aplicativo e o modo offline completo exigem servir o site por HTTPS ou localhost.

## Como publicar no GitHub Pages
1. No repositório, vá em **Add file → Upload files** e envie o CONTEÚDO da pasta (não o .zip), com `index.html` na raiz.
2. Clique em **Commit changes**.
3. Vá em **Settings → Pages**, em *Branch* escolha `main` e a pasta `/ (root)` e salve.
4. Aguarde 1 a 2 minutos; o endereço aparece na mesma tela.

## Como publicar gratuitamente e instalar
Para instalação PWA, hospede os arquivos estáticos em um serviço HTTPS, como GitHub Pages. Isso exige que o usuário crie/acesse uma conta e publique os arquivos; não foi feito automaticamente por esta entrega.

## Limitações importantes desta versão
- Ainda não existe integração com IA, agentes autônomos, contas de usuário, backend ou sincronização entre dispositivos.
- Os dados ficam no armazenamento local do navegador. Exportar JSON é necessário para cópia/transferência.
- Não há autenticação; não use em computador público para dados confidenciais.
- A fonte externa DM Sans/Manrope é carregada do Google Fonts quando há internet; o sistema continua legível sem ela.

## Próximas etapas técnicas recomendadas
1. Testes funcionais em Edge/Chrome e Android.
2. Publicação HTTPS com domínio/URL definidos.
3. Backend seguro e autenticação antes de guardar dados em nuvem.
4. Integração com provedor de IA usando chave mantida exclusivamente no servidor (nunca no JavaScript do navegador).
5. Testes de segurança, acessibilidade e restauração de backup.
6. Monitoramento e documentação de versões.

## Princípios E2IA
Exatidão, honestidade, fontes verificáveis, revisão independente, proteção de dados, etapas claras e relatório verdadeiro do que foi ou não concluído.

## Identidade visual e ícone de instalação
- `identidade-visual-E2IA.png`: arte principal da marca.
- `icon-192.png` e `icon-512.png`: ícones de instalação para dispositivos compatíveis.
- `icon.svg`: versão vetorial do símbolo E2IA.
- O manifesto configura o nome curto `E2IA`, para facilitar o reconhecimento quando instalado como aplicativo.
