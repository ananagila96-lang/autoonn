import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BarChart3,
  Box,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Flame,
  LayoutDashboard,
  Plus,
  Rocket,
  Settings,
  ShoppingBag,
  Sparkles,
  Target,
  Upload,
  Video,
} from "lucide-react";
import "./styles.css";
import "./upload.css";
import { load, save } from "./lib/store";
import { api } from "./lib/api";

const seed = [
  {
    id: 1,
    name: "Produto exemplo A",
    price: 79.9,
    commission: 12.5,
    score: 86,
    status: "Pronto",
    hook: "O achado que resolve isso em segundos",
  },
  {
    id: 2,
    name: "Produto exemplo B",
    price: 49.9,
    commission: 8,
    score: 74,
    status: "Roteiro",
    hook: "Eu não esperava que isso funcionasse tão bem",
  },
];

function money(value) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function App() {
  const persisted = load();
  const [tab, setTab] = useState("Visão geral");
  const [tiktok, setTiktok] = useState({ connected: false, loading: true });
  const [upload, setUpload] = useState({ loading: false, publishId: "", status: "" });
  const [products, setProducts] = useState(persisted.products?.length ? persisted.products : seed);
  const [queue, setQueue] = useState(
    persisted.queue?.length
      ? persisted.queue
      : [
          { title: "Produto A — demonstração", time: "Hoje · 19:30", status: "Aguardando aprovação" },
          { title: "Produto B — problema/solução", time: "Amanhã · 12:15", status: "Rascunho" },
        ],
  );

  useEffect(() => save({ products, queue }), [products, queue]);
  useEffect(() => {
    api
      .tiktokStatus()
      .then((value) => setTiktok({ ...value, loading: false }))
      .catch(() => setTiktok({ connected: false, loading: false }));
  }, []);

  const connectTikTok = async () => {
    try {
      const result = await api.tiktokAuth();
      if (result.authorize_url) location.href = result.authorize_url;
    } catch (error) {
      alert(error.message);
    }
  };

  const uploadToTikTok = async (event) => {
    event.preventDefault();
    const file = event.currentTarget.elements.video.files[0];
    if (!file) return;
    setUpload({ loading: true, publishId: "", status: "Enviando para o TikTok…" });
    try {
      const result = await api.uploadDraft(file);
      setUpload({ loading: false, publishId: result.publish_id, status: result.status });
      setQueue((items) => [
        {
          title: file.name,
          time: "Agora",
          status: "Enviado ao TikTok",
          publishId: result.publish_id,
        },
        ...items,
      ]);
    } catch (error) {
      setUpload({ loading: false, publishId: "", status: error.message });
    }
  };

  const refreshUploadStatus = async () => {
    if (!upload.publishId) return;
    try {
      const result = await api.publishStatus(upload.publishId);
      setUpload((current) => ({ ...current, status: result.status || "PROCESSING_UPLOAD" }));
    } catch (error) {
      setUpload((current) => ({ ...current, status: error.message }));
    }
  };

  const stats = useMemo(
    () => ({
      prod: products.length,
      ready: products.filter((item) => item.status === "Pronto").length,
      comm: products.reduce((sum, item) => sum + item.commission, 0),
    }),
    [products],
  );
  const add = () =>
    setProducts((items) => [
      ...items,
      {
        id: Date.now(),
        name: "Novo produto",
        price: 0,
        commission: 5,
        score: 50,
        status: "Roteiro",
        hook: "Crie um gancho forte para este produto",
      },
    ]);
  const nav = [
    ["Visão geral", LayoutDashboard],
    ["Produtos", ShoppingBag],
    ["Conteúdo", Video],
    ["Fila", CalendarDays],
    ["Métricas", BarChart3],
    ["Configurações", Settings],
  ];

  return (
    <div className="shell">
      <aside>
        <div className="brand">
          <div className="bolt">A</div>
          <div><b>AUTOONN</b><small>TikTok Growth OS</small></div>
        </div>
        <nav>
          {nav.map(([name, Icon]) => (
            <button className={tab === name ? "active" : ""} onClick={() => setTab(name)} key={name}>
              <Icon size={19} />{name}
            </button>
          ))}
        </nav>
        <div className="sidecard">
          <Sparkles size={18} /><b>Modo MVP</b>
          <span>Menos trabalho manual. Mais teste, métrica e repetição.</span>
        </div>
      </aside>
      <main>
        <header>
          <div><span className="eyebrow">CENTRAL DE OPERAÇÃO</span><h1>{tab}</h1></div>
          <button className="primary" onClick={add}><Plus size={18} />Adicionar produto</button>
        </header>

        {tab === "Visão geral" && (
          <>
            <section className="hero">
              <div>
                <span className="pill"><Flame size={14} />FOCO DA SEMANA</span>
                <h2>Publicar, medir,<br />repetir o que funciona.</h2>
                <p>O Autoonn organiza produtos, roteiros e fila de conteúdo. A publicação usa apenas o fluxo oficial autorizado pelo TikTok.</p>
                <button className="primary" onClick={() => setTab("Produtos")}>Começar operação <ChevronRight size={18} /></button>
              </div>
              <div className="score"><Target /><strong>86</strong><span>melhor score atual</span></div>
            </section>
            <section className="cards">
              <Card icon={Box} label="Produtos monitorados" value={stats.prod} />
              <Card icon={CheckCircle2} label="Prontos para conteúdo" value={stats.ready} />
              <Card icon={Rocket} label="Comissão potencial" value={money(stats.comm)} />
            </section>
            <div className="grid">
              <Panel title="Próximas publicações"><Queue items={queue} /></Panel>
              <Panel title="Regra do Autoonn">
                <Rule number="1" title="Teste rápido">Poucos produtos e múltiplos ganchos.</Rule>
                <Rule number="2" title="Leia os sinais">Retenção, cliques e conversão.</Rule>
                <Rule number="3" title="Escale vencedores">Pare de insistir no que não responde.</Rule>
              </Panel>
            </div>
          </>
        )}

        {tab === "Produtos" && (
          <Panel title="Ranking de produtos">
            <div className="table">
              {products.map((product) => (
                <div className="prow" key={product.id}>
                  <div><b>{product.name}</b><span>{product.hook}</span></div>
                  <span>{money(product.price)}</span><span>+ {money(product.commission)}</span>
                  <strong>{product.score}/100</strong><em>{product.status}</em>
                </div>
              ))}
            </div>
          </Panel>
        )}

        {tab === "Conteúdo" && (
          <Panel title="Fábrica de conteúdo">
            <Empty icon={Sparkles} title="Roteiros curtos, não complicação" text="A V1 prepara gancho, roteiro, CTA e legenda sem expor segredos no navegador." />
          </Panel>
        )}

        {tab === "Fila" && (
          <>
            <Panel title="Enviar rascunho ao TikTok">
              {tiktok.connected ? (
                <form className="upload-form" onSubmit={uploadToTikTok}>
                  <label>
                    <span>Vídeo para revisão no TikTok</span>
                    <input name="video" type="file" accept="video/mp4,video/quicktime,video/webm" required />
                  </label>
                  <button className="primary" disabled={upload.loading}>
                    <Upload size={17} />{upload.loading ? "Enviando…" : "Enviar como rascunho"}
                  </button>
                </form>
              ) : (
                <div className="connect-callout">
                  <p>Conecte sua conta TikTok antes de enviar o primeiro rascunho.</p>
                  <button className="primary" onClick={connectTikTok}>Conectar TikTok</button>
                </div>
              )}
              {upload.status && (
                <div className="upload-status">
                  <b>{upload.status}</b>
                  {upload.publishId && <span>ID: {upload.publishId}</span>}
                  {upload.publishId && <button onClick={refreshUploadStatus}>Atualizar status</button>}
                  {upload.publishId && <p>Abra a notificação no aplicativo TikTok para revisar e publicar.</p>}
                </div>
              )}
            </Panel>
            <Panel title="Fila de publicação"><Queue items={queue} /></Panel>
          </>
        )}

        {tab === "Métricas" && (
          <Panel title="Métricas que importam">
            <Empty icon={BarChart3} title="Sem vaidade" text="O ranking será guiado por retenção, cliques, conversões e comissão." />
          </Panel>
        )}

        {tab === "Configurações" && (
          <Panel title="Integrações">
            <div className="integration">
              <div className="tiktok">♪</div>
              <div>
                <b>TikTok</b>
                <span>{tiktok.loading ? "Verificando…" : tiktok.connected ? "Conectado" : "Não conectado"}</span>
              </div>
              <button onClick={connectTikTok} disabled={tiktok.loading || tiktok.connected}>
                {tiktok.connected ? "Conectado" : "Conectar TikTok"}
              </button>
            </div>
            <p className="notice">Tokens e Client Secret ficam somente no servidor. O Autoonn usa OAuth e o Content Posting API oficiais.</p>
          </Panel>
        )}
      </main>
    </div>
  );
}

function Card({ icon: Icon, label, value }) {
  return <div className="card"><Icon /><span>{label}</span><strong>{value}</strong></div>;
}

function Panel({ title, children }) {
  return <section className="panel"><h3>{title}</h3>{children}</section>;
}

function Empty({ icon: Icon, title, text }) {
  return <div className="empty"><Icon size={40} /><h2>{title}</h2><p>{text}</p></div>;
}

function Rule({ number, title, children }) {
  return <div className="rule"><span>{number}</span><p><b>{title}</b><br />{children}</p></div>;
}

function Queue({ items }) {
  return items.map((item, index) => (
    <div className="row" key={`${item.title}-${index}`}>
      <div className="thumb"><CalendarDays /></div>
      <div><b>{item.title}</b><span>{item.time}</span></div>
      <em>{item.status}</em>
    </div>
  ));
}

createRoot(document.getElementById("root")).render(<App />);
