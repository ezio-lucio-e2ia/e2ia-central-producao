(() => {
  "use strict";
  const STORAGE_KEY = "e2ia_app_v1";
  const statusLabels = {
    pending: "Pendente",
    doing: "Em andamento",
    waiting: "Aguardando autorização",
    done: "Concluída"
  };
  const priorityLabels = {
    high: "Alta",
    medium: "Média",
    low: "Baixa"
  };

  const defaultData = () => ({
    version: 2,
    posts: [],
    products: [
      {
        id: "p-ebd",
        name: "Mestre da EBD",
        description: "Guia prático para formação, preparação e atuação de professores da Escola Bíblica Dominical.",
        stage: "Produção",
        pilot: true
      },
      {
        id: "p-cursos",
        name: "Cursos bíblicos",
        description: "Linha futura de cursos e mentorias de conhecimento bíblico, com conteúdo aprofundado e referências verificadas.",
        stage: "Planejamento",
        pilot: false
      }
    ],
    tasks: [
      { id: "t-1", title: "Mapear a estrutura final do e-book Mestre da EBD", product: "Mestre da EBD", status: "doing", priority: "high", owner: "Arquiteto", notes: "Definir capítulos, objetivos de aprendizagem, exercícios e referências confiáveis.", createdAt: Date.now() },
      { id: "t-2", title: "Revisar conteúdo bíblico, teológico e referências", product: "Mestre da EBD", status: "pending", priority: "high", owner: "Revisor", notes: "Conferir citações, contexto bíblico, bibliografia e exatidão das afirmações.", createdAt: Date.now() },
      { id: "t-3", title: "Planejar a sequência de pelo menos 50 aulas curtas", product: "Mestre da EBD", status: "pending", priority: "medium", owner: "Produtor", notes: "Cada aula deve ter objetivo, texto-base, explicação, aplicação e fechamento.", createdAt: Date.now() },
      { id: "t-4", title: "Definir critérios de validação da página de vendas", product: "Mestre da EBD", status: "waiting", priority: "medium", owner: "Estrategista", notes: "Não prometer resultados garantidos; usar depoimentos reais e métricas verificáveis.", createdAt: Date.now() },
      { id: "t-5", title: "Criar checklist de qualidade para todos os produtos", product: "E2IA", status: "done", priority: "low", owner: "Revisor", notes: "Precisão, clareza, estrutura, direitos autorais, referências e revisão final.", createdAt: Date.now() }
    ],
    updatedAt: new Date().toISOString()
  });

  let data = loadData();
  let toastTimer;

  const $ = id => document.getElementById(id);
  const safe = value => String(value ?? "").replace(/[&<>\"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  }[c]));

  function loadData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.tasks) && Array.isArray(parsed.products)) {
          if (!Array.isArray(parsed.posts)) parsed.posts = [];
          return parsed;
        }
      }
    } catch (e) {
      // ignora e usa fallback
    }
    return defaultData();
  }

  function save() {
    data.updatedAt = new Date().toISOString();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      showToast("Não foi possível salvar neste navegador. Exporte uma cópia dos dados.");
    }
    renderAll();
  }

  function showToast(message) {
    const el = $("toast");
    if (!el) return;
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 2800);
  }

  function statusTag(status) {
    return `<span class="status-tag ${safe(status)}">${safe(statusLabels[status] || status)}</span>`;
  }

  function taskRow(task, large = false) {
    return `<article class="task-row">
      <span class="task-marker ${safe(task.priority)}"></span>
      <div class="task-main">
        <div class="task-title">${safe(task.title)}</div>
        <div class="task-meta">
          ${statusTag(task.status)}
          <span class="tag">${safe(task.product || "Sem produto")}</span>
          <span class="muted small">Prioridade ${safe(priorityLabels[task.priority] || task.priority)}</span>
          ${dueTag(task)}
          ${task.owner ? `<span class="muted small">· ${safe(task.owner)}</span>` : ""}
        </div>
        ${large && task.notes ? `<p class="muted small">${safe(task.notes)}</p>` : ""}
      </div>
      ${large ? `
        <div class="task-actions">
          <button class="icon-btn" data-edit-task="${safe(task.id)}" aria-label="Editar tarefa">✎ Editar</button>
          <button class="icon-btn" data-delete-task="${safe(task.id)}" aria-label="Excluir tarefa">×</button>
        </div>
      ` : ""}
    </article>`;
  }

  function renderDashboard() {
    $("statTotal").textContent = data.tasks.length;
    $("statDoing").textContent = data.tasks.filter(t => t.status === "doing").length;
    $("statDone").textContent = data.tasks.filter(t => t.status === "done").length;
    $("statHigh").textContent = data.tasks.filter(t => t.priority === "high" && t.status !== "done").length;

    const open = data.tasks
      .filter(t => t.status !== "done")
      .sort((a, b) => {
        const p = { high: 0, medium: 1, low: 2 };
        return (p[a.priority] ?? 99) - (p[b.priority] ?? 99);
      })
      .slice(0, 4);

    $("nextTasks").innerHTML = open.length
      ? open.map(t => taskRow(t)).join("")
      : `<div class="empty-state">Nenhuma tarefa pendente. Bom trabalho!</div>`;

    const pilotTasks = data.tasks.filter(t => t.product === "Mestre da EBD");
    const pct = pilotTasks.length
      ? Math.round(pilotTasks.filter(t => t.status === "done").length / pilotTasks.length * 100)
      : 0;

    $("pilotProgress").textContent = pct + "%";
    $("pilotBar").style.width = pct + "%";
  }

  function renderTasks() {
    const q = $("taskSearch").value.trim().toLocaleLowerCase("pt-BR");
    const st = $("statusFilter").value;
    const pr = $("priorityFilter").value;

    const list = data.tasks
      .filter(t => (
        !q ||
        [t.title, t.product, t.owner, t.notes].join(" ").toLocaleLowerCase("pt-BR").includes(q)
      ))
      .filter(t => st === "all" || t.status === st)
      .filter(t => pr === "all" || t.priority === pr)
      .sort((a, b) => {
        const p = { high: 0, medium: 1, low: 2 };
        return (p[a.priority] ?? 99) - (p[b.priority] ?? 99);
      });

    $("allTasks").innerHTML = list.length
      ? list.map(t => taskRow(t, true)).join("")
      : `<div class="empty-state">Nenhuma tarefa corresponde a esses filtros.</div>`;
  }

  function renderProducts() {
    $("productsGrid").innerHTML = data.products.length
      ? data.products.map(p => {
          const tasks = data.tasks.filter(t => t.product === p.name);
          const done = tasks.filter(t => t.status === "done").length;
          const pct = tasks.length ? Math.round(done / tasks.length * 100) : 0;

          return `<article class="product-card">
            <div class="product-card-top">
              <div class="product-mark">${safe((p.name || "P").slice(0, 1).toUpperCase())}</div>
              <span class="product-stage">${safe(p.stage)}</span>
            </div>
            <h3>${safe(p.name)}</h3>
            <p>${safe(p.description || "Sem descrição cadastrada.")}</p>
            <div class="progress-label">
              <span>${tasks.length} tarefa(s) vinculada(s)</span>
              <strong>${pct}%</strong>
            </div>
            <div class="progress-track">
              <div class="progress-bar" style="width:${pct}%"></div>
            </div>
            <div class="card-footer">
              <span class="muted small">${p.pilot ? "Projeto-piloto" : "Portfólio"}</span>
              <button class="text-btn" data-product-task="${safe(p.name)}">Ver tarefas →</button>
            </div>
          </article>`;
        }).join("")
      : `<div class="empty-state">Nenhum produto cadastrado. Use “Novo produto” para começar.</div>`;
  }

  const assistants = [
    ["NE", "NEXO", "Coordenação", "Recebe o pedido, divide em etapas, aciona as demais funções, consolida o resultado e informa com clareza o que foi feito e o que falta.", "Plano do dia, distribuição de tarefas e relatório honesto de andamento."],
    ["NÔ", "NÔMADES", "Pesquisa na internet", "Busca informações atuais, tendências e concorrência, distinguindo fatos de opiniões e registrando as fontes.", "Levantamento com fontes e pontos a confirmar."],
    ["BE", "BERÉIA", "Conferência bíblica", "Confere versículos, contexto e coerência bíblica do conteúdo antes de qualquer publicação.", "Parecer de conferência com correções sugeridas."],
    ["AQ", "ARQUITETO", "Estrutura e planejamento", "Transforma objetivos em etapas, capítulos, aulas e critérios de conclusão.", "Mapa do produto e definição de pronto."],
    ["ES", "ESCRIBA", "Redação", "Escreve e revisa textos: capítulos, aulas, páginas de venda e legendas, em linguagem clara para o público.", "Textos prontos para revisão."],
    ["PR", "PRISMA", "Visual e apresentação", "Cuida da parte visual: capas, artes, diagramação e consistência da identidade.", "Peças visuais e orientações de layout."],
    ["AT", "ATALAIA", "Auditoria e qualidade", "Faz a revisão independente: exatidão, direitos autorais, promessas de marketing e pendências.", "Relatório de auditoria aprovado ou com ressalvas."],
    ["FO", "FORJA", "Produção dos arquivos", "Monta os entregáveis finais: e-book, aulas, curso e materiais complementares.", "Arquivos finais organizados e testados."],
    ["AU", "ARAUTO", "Divulgação", "Planeja e redige conteúdo para Instagram, Facebook e WhatsApp, com calendário e chamadas honestas.", "Calendário de posts e textos prontos."],
    ["ME", "MERCADOR", "Vendas e validação", "Cuida da oferta, da página de venda e das métricas, sem prometer resultados garantidos.", "Plano de validação com indicadores mensuráveis."]
  ];

  function renderTeam() {
    $("assistantGrid").innerHTML = assistants.map((a, i) => `
      <article class="assistant-card">
        <div class="assistant-avatar">${a[0]}</div>
        <div class="assistant-role">${a[2]}</div>
        <h3>${a[1]}</h3>
        <p>${a[3]}</p>
        <div class="assistant-output">
          <strong>ENTREGA ESPERADA</strong>
          <p>${a[4]}</p>
        </div>
        <button class="secondary-btn" data-prompt="${i}">Copiar prompt pronto</button>
      </article>
    `).join("");
  }

  const quality = [
    ["Exatidão e referências", "Conferir fatos, versículos, citações, dados e fontes. Não criar referências inexistentes."],
    ["Objetivo e público definidos", "Toda peça deve indicar para quem foi feita, qual problema resolve e qual resultado educacional pretende alcançar."],
    ["Profundidade e utilidade", "Conteúdo substancial, exemplos aplicáveis, sequência lógica e ausência de repetição usada apenas para aumentar volume."],
    ["Revisão editorial", "Ortografia, clareza, coerência, formatação, títulos e consistência terminológica."],
    ["Ética e direitos", "Respeitar direitos autorais, privacidade, uso de imagens e atribuição de ideias. Não fabricar depoimentos."],
    ["Validação antes de publicar", "Verificar funcionamento, links, leitura em celular, acessibilidade básica e veracidade de promessas comerciais."],
    ["Relatório honesto", "Registrar o que foi concluído, o que está pendente, limitações e dependências externas."]
  ];

  function renderQuality() {
    $("qualityList").innerHTML = quality.map(q => `
      <article class="quality-item">
        <div class="quality-check">✓</div>
        <div>
          <h3>${q[0]}</h3>
          <p>${q[1]}</p>
        </div>
      </article>
    `).join("");
  }

  const postStatus = {
    idea: ["Ideia", "pending"],
    written: ["Texto pronto", "doing"],
    scheduled: ["Agendado", "waiting"],
    published: ["Publicado", "done"]
  };

  function fmtDate(d) {
    if (!d) return "Sem data";
    const [y, m, day] = d.split("-");
    return day && m && y ? `${day}/${m}/${y}` : d;
  }

  function renderPosts() {
    const list = [...data.posts].sort((a, b) => (a.date || "9999").localeCompare(b.date || "9999"));
    $("postsList").innerHTML = list.length
      ? list.map(p => {
          const st = postStatus[p.status] || ["", ""];
          return `<article class="task-row">
            <span class="task-marker"></span>
            <div class="task-main">
              <div class="task-title">${safe(p.title)}</div>
              <div class="task-meta">
                <span class="status-tag ${safe(st[1])}">${safe(st[0])}</span>
                <span class="tag">${safe(p.channel)}</span>
                <span class="muted small">${safe(fmtDate(p.date))}</span>
              </div>
              ${p.text ? `<p class="muted small post-text">${safe(p.text)}</p>` : ""}
            </div>
            <div class="task-actions">
              <button class="icon-btn" data-copy-post="${safe(p.id)}" aria-label="Copiar texto">Copiar</button>
              <button class="icon-btn" data-wa-post="${safe(p.id)}" aria-label="Enviar pelo WhatsApp">WhatsApp</button>
              <button class="icon-btn" data-edit-post="${safe(p.id)}" aria-label="Editar post">✎ Editar</button>
              <button class="icon-btn" data-delete-post="${safe(p.id)}" aria-label="Excluir post">×</button>
            </div>
          </article>`;
        }).join("")
      : `<div class="empty-state">Nenhum post planejado. Use “Novo post” para começar.</div>`;
  }

  function renderAll() {
    renderDashboard();
    renderTasks();
    renderProducts();
    renderPosts();
    renderTeam();
    renderQuality();
    renderBoard();
    renderCalendar();
  }

  function switchView(view) {
    document.querySelectorAll(".view").forEach(el => {
      el.classList.toggle("active", el.id === "view-" + view);
    });

    document.querySelectorAll(".nav-item").forEach(el => {
      el.classList.toggle("active", el.dataset.view === view);
    });

    const labels = {
      dashboard: "Visão geral",
      tasks: "Tarefas",
      products: "Produtos",
      posts: "Divulgação",
      team: "Assistentes",
      rules: "Padrões de qualidade",
      data: "Dados e cópias"
    };

    $("pageTitle").textContent = labels[view] || "E2IA";
    $("sidebar").classList.remove("open");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openTask(task = null) {
    const dialog = $("taskDialog");
    if (!dialog) return;

    $("taskForm").reset();
    $("taskId").value = task?.id || "";
    $("taskDialogTitle").textContent = task ? "Editar tarefa" : "Nova tarefa";
    $("taskTitle").value = task?.title || "";
    $("taskProduct").value = task?.product || "Mestre da EBD";
    $("taskStatus").value = task?.status || "pending";
    $("taskPriority").value = task?.priority || "medium";
    $("taskOwner").value = task?.owner || "";
    $("taskNotes").value = task?.notes || "";
    $("taskDue").value = task?.due || "";

    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    } else {
      dialog.setAttribute("open", "open");
    }

    $("taskTitle").focus();
  }

  function openPost(post = null) {
    const dialog = $("postDialog");
    if (!dialog) return;

    $("postForm").reset();
    $("postId").value = post?.id || "";
    $("postDialogTitle").textContent = post ? "Editar post" : "Novo post";
    $("postTitle").value = post?.title || "";
    $("postChannel").value = post?.channel || "Instagram";
    $("postStatus").value = post?.status || "idea";
    $("postDate").value = post?.date || "";
    $("postText").value = post?.text || "";

    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    } else {
      dialog.setAttribute("open", "open");
    }

    $("postTitle").focus();
  }

  function openProduct() {
    const dialog = $("productDialog");
    if (!dialog) return;
    $("productForm").reset();
    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    } else {
      dialog.setAttribute("open", "open");
    }
  }

  async function copyText(text, okMsg) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        showToast(okMsg);
        return;
      }

      const input = document.createElement("textarea");
      input.value = text;
      input.setAttribute("readonly", "");
      input.style.position = "fixed";
      input.style.left = "-9999px";
      document.body.appendChild(input);
      input.select();

      const ok = document.execCommand("copy");
      document.body.removeChild(input);

      if (ok) {
        showToast(okMsg);
      } else {
        showToast("Não foi possível copiar automaticamente. Selecione e copie manualmente.");
      }
    } catch (e) {
      showToast("Não foi possível copiar automaticamente. Selecione e copie manualmente.");
    }
  }

  document.querySelectorAll(".nav-item").forEach(button => {
    button.addEventListener("click", () => switchView(button.dataset.view));
  });

  document.querySelectorAll("[data-goto]").forEach(button => {
    button.addEventListener("click", () => switchView(button.dataset.goto));
  });

  $("mobileMenu").addEventListener("click", () => $("sidebar").classList.toggle("open"));

  $("quickAdd").addEventListener("click", () => openTask());
  $("addTaskFromTasks").addEventListener("click", () => openTask());
  $("addProductBtn").addEventListener("click", openProduct);
  $("addPostBtn").addEventListener("click", () => openPost());

  $("copyLinkBtn").addEventListener("click", () => copyText($("salesLinkText").textContent.trim(), "Link copiado."));
  document.querySelectorAll("[data-close]").forEach(button => {
    button.addEventListener("click", () => $(button.dataset.close).close());
  });

  ["taskSearch", "statusFilter", "priorityFilter"].forEach(id => {
    $(id).addEventListener(id === "taskSearch" ? "input" : "change", renderTasks);
  });

  $("taskForm").addEventListener("submit", e => {
    e.preventDefault();

    const id = $("taskId").value;
    const task = {
      id: id || ("t-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7)),
      title: $("taskTitle").value.trim(),
      product: $("taskProduct").value.trim() || "Sem produto",
      status: $("taskStatus").value,
      priority: $("taskPriority").value,
      owner: $("taskOwner").value.trim(),
      notes: $("taskNotes").value.trim(),
      due: $("taskDue").value,
      createdAt: (data.tasks.find(t => t.id === id)?.createdAt) || Date.now()
    };

    if (!task.title) return;

    if (id) {
      const index = data.tasks.findIndex(t => t.id === id);
      if (index >= 0) data.tasks[index] = task;
    } else {
      data.tasks.unshift(task);
    }

    $("taskDialog").close();
    save();
    showToast(id ? "Tarefa atualizada." : "Tarefa criada.");
  });

  $("postForm").addEventListener("submit", e => {
    e.preventDefault();

    const id = $("postId").value;
    const post = {
      id: id || ("po-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7)),
      title: $("postTitle").value.trim(),
      channel: $("postChannel").value,
      status: $("postStatus").value,
      date: $("postDate").value,
      text: $("postText").value.trim()
    };

    if (!post.title) return;

    if (id) {
      const i = data.posts.findIndex(p => p.id === id);
      if (i >= 0) data.posts[i] = post;
    } else {
      data.posts.unshift(post);
    }

    $("postDialog").close();
    save();
    showToast(id ? "Post atualizado." : "Post criado.");
  });

  $("productForm").addEventListener("submit", e => {
    e.preventDefault();

    const name = $("productName").value.trim();
    if (!name) return;

    if (data.products.some(p => p.name.toLocaleLowerCase("pt-BR") === name.toLocaleLowerCase("pt-BR"))) {
      showToast("Já existe um produto com esse nome.");
      return;
    }

    data.products.push({
      id: "p-" + Date.now(),
      name,
      description: $("productDescription").value.trim(),
      stage: $("productStage").value,
      pilot: false
    });

    $("productDialog").close();
    save();
    showToast("Produto cadastrado.");
  });

  document.addEventListener("click", e => {
    const editTask = e.target.closest("[data-edit-task]");
    if (editTask) {
      const t = data.tasks.find(x => x.id === editTask.dataset.editTask);
      if (t) openTask(t);
      return;
    }

    const delTask = e.target.closest("[data-delete-task]");
    if (delTask) {
      const t = data.tasks.find(x => x.id === delTask.dataset.deleteTask);
      if (t && confirm(`Excluir a tarefa “${t.title}”?`)) {
        data.tasks = data.tasks.filter(x => x.id !== t.id);
        save();
        showToast("Tarefa excluída.");
      }
      return;
    }

    const editPost = e.target.closest("[data-edit-post]");
    if (editPost) {
      const p = data.posts.find(x => x.id === editPost.dataset.editPost);
      if (p) openPost(p);
      return;
    }

    const delPost = e.target.closest("[data-delete-post]");
    if (delPost) {
      const p = data.posts.find(x => x.id === delPost.dataset.deletePost);
      if (p && confirm(`Excluir o post “${p.title}”?`)) {
        data.posts = data.posts.filter(x => x.id !== p.id);
        save();
        showToast("Post excluído.");
      }
      return;
    }

    const copyPost = e.target.closest("[data-copy-post]");
    if (copyPost) {
      const p = data.posts.find(x => x.id === copyPost.dataset.copyPost);
      if (p) copyText(p.text || p.title, "Texto copiado.");
      return;
    }

    const productTask = e.target.closest("[data-product-task]");
    if (productTask) {
      switchView("tasks");
      $("taskSearch").value = productTask.dataset.productTask;
      $("statusFilter").value = "all";
      $("priorityFilter").value = "all";
      renderTasks();
      return;
    }

    const promptBtn = e.target.closest("[data-prompt]");
    if (promptBtn) {
      const a = assistants[+promptBtn.dataset.prompt];
      copyText(
        `Você é ${a[1]} (${a[2]}), uma função da E2IA.\n${a[3]}\nEntrega esperada: ${a[4]}\nRegras: exatidão, honestidade, fontes verificáveis; não invente versículos, dados, depoimentos ou resultados; diga o que não conseguiu confirmar.\nContexto: e-book "Mestre da EBD" (formação de professores da Escola Bíblica Dominical). Link de venda: ${LINK}\n\nMeu pedido: `,
        "Prompt copiado. Cole na sua IA e complete o pedido."
      );
      return;
    }

    const moveBtn = e.target.closest("[data-mv]");
    if (moveBtn) {
      const t = data.tasks.find(x => x.id === moveBtn.dataset.mv);
      if (t) {
        const index = cols.indexOf(t.status);
        const offset = Number(moveBtn.dataset.d || 0);
        const nextIndex = Math.min(cols.length - 1, Math.max(0, index + offset));
        moveTask(t.id, cols[nextIndex]);
      }
      return;
    }

    const waBtn = e.target.closest("[data-wa-post]");
    if (waBtn) {
      const p = data.posts.find(x => x.id === waBtn.dataset.waPost);
      if (p) {
        window.open("https://wa.me/?text=" + encodeURIComponent(p.text || p.title), "_blank", "noopener");
      }
      return;
    }

    const newDay = e.target.closest("[data-newday]");
    if (newDay && !e.target.closest("[data-edit-post]")) {
      openPost();
      $("postDate").value = newDay.dataset.newday;
    }
  });

  $("exportBtn").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "e2ia-backup-" + new Date().toISOString().slice(0, 10) + ".json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast("Cópia de segurança exportada.");
  });

  $("importFile").addEventListener("change", async e => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const parsed = JSON.parse(await file.text());
      if (!parsed || !Array.isArray(parsed.tasks) || !Array.isArray(parsed.products)) throw new Error("Formato inválido");
      if (!confirm("A importação substituirá os dados atuais deste navegador. Deseja continuar?")) return;

      data = {
        version: 2,
        products: parsed.products,
        tasks: parsed.tasks,
        posts: Array.isArray(parsed.posts) ? parsed.posts : [],
        updatedAt: new Date().toISOString()
      };

      save();
      showToast("Dados importados.");
    } catch (err) {
      showToast("Arquivo inválido. Escolha uma cópia JSON exportada pela E2IA.");
    } finally {
      e.target.value = "";
    }
  });

  $("resetBtn").addEventListener("click", () => {
    if (confirm("Isso substituirá os dados atuais pelos exemplos iniciais. Faça uma cópia antes se precisar dos dados. Continue?")) {
      data = defaultData();
      save();
      showToast("Dados de exemplo restaurados.");
    }
  });

  let installEvent = null;

  window.addEventListener("beforeinstallprompt", e => {
    e.preventDefault();
    installEvent = e;
    $("installBtn").hidden = false;
    $("installHelp").textContent = "Toque em “Instalar o E2IA” para colocar o ícone na tela inicial.";
  });

  $("installBtn").addEventListener("click", async () => {
    if (!installEvent) return;
    installEvent.prompt();
    try {
      await installEvent.userChoice;
    } catch (e) {
      // ignora
    }
    installEvent = null;
    $("installBtn").hidden = true;
  });

  window.addEventListener("appinstalled", () => showToast("E2IA instalado."));

  if (/iphone|ipad/i.test(navigator.userAgent)) {
    $("installHelp").textContent = "No iPhone: abra no Safari, toque em Compartilhar e depois em “Adicionar à Tela de Início”.";
  }

  $("dateLabel").textContent = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long"
  }).format(new Date()).toLocaleUpperCase("pt-BR");

  const LINK = "https://eziolucio97.hotmart.host/mestredaebd";
  const TAGS = "#MestreDaEBD #EBD #EscolaBíblicaDominical #ProfessorDeEBD #EnsinoBíblico #Igreja";

  const today = () => new Date().toISOString().slice(0, 10);

  function dueTag(t) {
    if (!t.due) return "";
    const late = t.due < today() && t.status !== "done";
    return `<span class="tag" style="${late ? "background:#fde8e8;color:#b84040" : ""}">📅 ${fmtDate(t.due)}${late ? " · atrasada" : ""}</span>`;
  }

  const cols = ["pending", "doing", "waiting", "done"];

  function renderBoard() {
    $("board").innerHTML = cols.map(c => {
      const list = data.tasks.filter(t => t.status === c);
      return `<div class="col" data-col="${c}">
        <h4>${statusLabels[c]} <span>${list.length}</span></h4>
        ${list.map(t => `
          <div class="kcard ${safe(t.priority)}" draggable="true" data-id="${safe(t.id)}">
            <b>${safe(t.title)}</b>
            <small>${safe(t.product || "")}</small>
            ${dueTag(t)}
            <div class="kbtn">
              <button data-mv="${safe(t.id)}" data-d="-1" aria-label="Mover para trás">◀</button>
              <button data-edit-task="${safe(t.id)}" aria-label="Editar">✎</button>
              <button data-mv="${safe(t.id)}" data-d="1" aria-label="Mover para frente">▶</button>
            </div>
          </div>
        `).join("")}
      </div>`;
    }).join("");
  }

  function moveTask(id, nextStatus) {
    const task = data.tasks.find(x => x.id === id);
    if (!task || !nextStatus || !cols.includes(nextStatus)) return;
    if (task.status !== nextStatus) {
      task.status = nextStatus;
      save();
    }
  }

  function setMode(m) {
    $("board").hidden = m !== "board";
    $("allTasks").hidden = m === "board";
    $("listToolbar").hidden = m === "board";
    $("modeBoard").classList.toggle("on", m === "board");
    $("modeList").classList.toggle("on", m !== "board");
  }

  $("modeBoard").addEventListener("click", () => setMode("board"));
  $("modeList").addEventListener("click", () => setMode("list"));

  const board = $("board");
  let dragId = null;

  board.addEventListener("dragstart", e => {
    const card = e.target.closest(".kcard");
    if (card) {
      dragId = card.dataset.id;
      e.dataTransfer.effectAllowed = "move";
    }
  });

  board.addEventListener("dragover", e => {
    if (e.target.closest(".col")) e.preventDefault();
  });

  board.addEventListener("drop", e => {
    const column = e.target.closest(".col");
    if (column && dragId) {
      e.preventDefault();
      moveTask(dragId, column.dataset.col);
      dragId = null;
    }
  });

  $("launchTpl").addEventListener("click", () => {
    if (!confirm("Adicionar 8 tarefas do modelo “Lançamento de e-book”?")) return;

    [
      "Definir público e promessa honesta do e-book",
      "Revisar conteúdo, versículos e referências",
      "Fechar capa e diagramação",
      "Conferir página de venda e link da Hotmart",
      "Escrever 7 posts de divulgação",
      "Publicar nas 3 redes (Instagram, Facebook, WhatsApp)",
      "Responder dúvidas e pedir depoimentos reais",
      "Medir resultados e ajustar a oferta"
    ].forEach((title, i) => {
      data.tasks.push({
        id: "t-" + Date.now() + "-" + i,
        title,
        product: "Mestre da EBD",
        status: "pending",
        priority: i < 3 ? "high" : "medium",
        owner: "",
        notes: "",
        due: "",
        createdAt: Date.now()
      });
    });

    save();
    showToast("Modelo adicionado.");
  });

  let cal = new Date();
  cal.setDate(1);

  function renderCalendar() {
    const y = cal.getFullYear();
    const m = cal.getMonth();
    const first = cal.getDay();
    const n = new Date(y, m + 1, 0).getDate();

    let html = ["D", "S", "T", "Q", "Q", "S", "S"]
      .map(d => `<b class="wd">${d}</b>`)
      .join("") + "<i></i>".repeat(first);

    for (let d = 1; d <= n; d++) {
      const iso = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      html += `
        <div class="day${iso === today() ? " today" : ""}" data-newday="${iso}">
          <span>${d}</span>
          ${data.posts.filter(p => p.date === iso).map(p => `
            <button class="chip ${safe(p.status)}" data-edit-post="${safe(p.id)}">
              ${safe(p.channel.slice(0, 2))} ${safe(p.title.slice(0, 12))}
            </button>
          `).join("")}
        </div>
      `;
    }

    $("calGrid").innerHTML = html;
    $("calTitle").textContent = new Intl.DateTimeFormat("pt-BR", {
      month: "long",
      year: "numeric"
    }).format(cal);
  }

  $("calPrev").addEventListener("click", () => {
    cal.setMonth(cal.getMonth() - 1);
    renderCalendar();
  });

  $("calNext").addEventListener("click", () => {
    cal.setMonth(cal.getMonth() + 1);
    renderCalendar();
  });

  const tpl = {
    dica: (t, l) => `📖 Dica para quem ensina na EBD\n\n${t}\n\nQuer preparar suas aulas com mais clareza e segurança? Conheça o Mestre da EBD.\n👉 ${l}`,
    pergunta: (t, l) => `🤔 Pergunta para professores de EBD:\n\n${t}\n\nConta aqui nos comentários! E se você quer um guia prático para suas aulas:\n👉 ${l}`,
    reflexao: (t, l) => `✝️ Reflexão\n\n${t}\n\nEnsinar a Palavra é um chamado que merece preparo. Veja o Mestre da EBD:\n👉 ${l}`,
    oferta: (t, l) => `📘 Mestre da EBD\n\n${t}\n\nGuia prático para formação e preparação de professores da Escola Bíblica Dominical.\n👉 ${l}`,
    bastidores: (t, l) => `🛠️ Nos bastidores do Mestre da EBD\n\n${t}\n\nSe você ensina na igreja, esse material foi pensado para você.\n👉 ${l}`
  };

  $("genBtn").addEventListener("click", () => {
    const t = $("genTopic").value.trim();
    if (!t) {
      showToast("Escreva o tema do post primeiro.");
      return;
    }

    openPost();
    $("postTitle").value = t.slice(0, 140);
    $("postText").value = tpl[$("genTpl").value](t, LINK) + "\n\n" + TAGS;
    $("postText").dispatchEvent(new Event("input"));
  });

  $("postText").addEventListener("input", () => {
    $("postCount").textContent = $("postText").value.length + "/2000";
  });

  $("tagsBtn").addEventListener("click", () => {
    const field = $("postText");
    if (!field.value.includes("#MestreDaEBD")) {
      field.value = (field.value + "\n\n" + TAGS).trim();
    }
    field.dispatchEvent(new Event("input"));
  });

  setMode("board");
  renderAll();
})();
