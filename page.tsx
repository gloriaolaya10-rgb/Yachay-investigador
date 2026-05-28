"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { AlertTriangle, BookOpen, CheckCircle2, Download, FileText, Lightbulb, MessageCircle, Send, Sparkles } from "lucide-react";

type FormState = {
  title: string;
  question: string;
  objective: string;
  population: string;
  tentativeApproach: string;
  purpose: string;
  evidence: string;
  intervention: string;
  time: string;
  access: string;
  depth: string;
  variables: string;
  categories: string;
  extra: string;
};

const initialForm: FormState = {
  title: "",
  question: "",
  objective: "",
  population: "",
  tentativeApproach: "",
  purpose: "",
  evidence: "",
  intervention: "",
  time: "",
  access: "",
  depth: "",
  variables: "",
  categories: "",
  extra: ""
};

export default function Home() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(initialForm);
  const [answer, setAnswer] = useState("");
  const [quickQuestion, setQuickQuestion] = useState("");
  const [quickAnswer, setQuickAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [quickLoading, setQuickLoading] = useState(false);
  const [saved, setSaved] = useState<string>("");

  const progress = Math.round(((step + 1) / 5) * 100);
  const diagnostic = useMemo(() => inferRoute(form), [form]);

  const update = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  async function generateReport() {
    setLoading(true);
    setAnswer("");
    const payload = {
      mode: "full",
      form,
      preliminaryDiagnostic: diagnostic,
      instruction: "Genera una asesoría metodológica robusta, argumentada, de máximo 1500 palabras, con dos rutas posibles, viabilidad, riesgos y recomendaciones."
    };

    const res = await fetch("/api/consult", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    setAnswer(data.answer || "");
    setLoading(false);

    const saveRes = await fetch("/api/save-submission", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ form, diagnostic, answer: data.answer || "" })
    });
    const saveData = await saveRes.json();
    setSaved(saveData.saved ? "Caso enviado al reporte docente." : "Caso guardado solo en este navegador. Para reporte docente, configura REPORT_WEBHOOK_URL en Vercel.");
  }

  async function askQuick() {
    if (!quickQuestion.trim()) return;
    setQuickLoading(true);
    setQuickAnswer("");
    const res = await fetch("/api/consult", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "quick",
        form,
        question: quickQuestion,
        instruction: "Responde la consulta en máximo 220 palabras, sin divagar, desde la guía metodológica del curso."
      })
    });
    const data = await res.json();
    setQuickAnswer(data.answer || "");
    setQuickLoading(false);
  }

  function printPDF() {
    window.print();
  }

  function exportJSON() {
    const blob = new Blob([JSON.stringify({ form, diagnostic, answer, quickQuestion, quickAnswer }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "reporte-yachay-investigador.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-[#f7f4ef] text-slate-900">
      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[360px_1fr]">
        <aside className="no-print sticky top-6 h-fit rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="relative mx-auto h-72 w-full overflow-hidden rounded-[1.5rem] bg-white">
            <Image src="/yachay.png" alt="Yachay y asesora metodológica" fill className="object-contain" priority />
          </div>
          <div className="mt-5">
            <div className="flex items-center gap-2 text-xl font-bold">
              <Sparkles className="h-5 w-5" />
              Yachay Investigador
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Avancemos paso a paso. No elegiré por ti: te ayudaré a justificar una ruta metodológica coherente y viable.
            </p>
          </div>

          <div className="mt-5 rounded-2xl bg-slate-50 p-4">
            <div className="mb-2 flex items-center justify-between text-sm font-semibold">
              <span>Progreso</span>
              <span>{progress}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full rounded-full bg-slate-900 transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className="mt-5 grid gap-2 text-sm">
            <Status label="Enfoque sugerido" value={diagnostic.approach} />
            <Status label="Diseño viable" value={diagnostic.design} />
            <Status label="Riesgo" value={diagnostic.risk} />
          </div>
        </aside>

        <section className="space-y-6">
          <header className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Seminario de Investigación I</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-5xl">Asistente para decidir enfoque, tipo, nivel y diseño</h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
              Esta herramienta usa preguntas guiadas, criterios de viabilidad y argumentación metodológica para ayudarte a construir una primera ruta. La decisión final debe revisarse con fuentes académicas y con tu docente.
            </p>
          </header>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
            {step === 0 && (
              <StepCard title="1. Punto de partida" icon={<BookOpen />}>
                <Field label="Título tentativo" value={form.title} onChange={(v) => update("title", v)} placeholder="Ej.: Currículo oculto de género en prácticas docentes del nivel inicial" />
                <Area label="Pregunta de investigación" value={form.question} onChange={(v) => update("question", v)} placeholder="¿Cómo...? ¿De qué manera...? ¿Qué relación existe...?" />
                <Area label="Objetivo general" value={form.objective} onChange={(v) => update("objective", v)} placeholder="Comprender, describir, determinar, analizar, explicar..." />
                <Field label="Población, contexto o caso" value={form.population} onChange={(v) => update("population", v)} placeholder="Ej.: docentes de inicial de una IE pública de Lima" />
              </StepCard>
            )}

            {step === 1 && (
              <StepCard title="2. Intención investigativa" icon={<Lightbulb />}>
                <SelectField label="¿Qué quieres hacer principalmente?" value={form.purpose} onChange={(v) => update("purpose", v)} options={[
                  ["comprender", "Comprender experiencias, significados, prácticas o discursos"],
                  ["medir", "Medir variables, niveles, diferencias o relaciones"],
                  ["transformar", "Aplicar una estrategia para mejorar una situación"],
                  ["integrar", "Integrar datos cualitativos y cuantitativos"]
                ]} />
                <SelectField label="¿Qué evidencia necesitas?" value={form.evidence} onChange={(v) => update("evidence", v)} options={[
                  ["narrativa", "Relatos, entrevistas, observaciones, documentos"],
                  ["numerica", "Encuestas, escalas, pruebas, puntajes"],
                  ["ambas", "Ambas: datos narrativos y numéricos"]
                ]} />
                <SelectField label="¿Aplicarás una intervención?" value={form.intervention} onChange={(v) => update("intervention", v)} options={[
                  ["si", "Sí, aplicaré una estrategia/programa/recurso"],
                  ["no", "No, observaré o mediré la realidad como está"],
                  ["no-se", "Aún no lo tengo claro"]
                ]} />
              </StepCard>
            )}

            {step === 2 && (
              <StepCard title="3. Viabilidad real del diseño" icon={<AlertTriangle />}>
                <SelectField label="¿Cuánto tiempo real tienes para recoger datos?" value={form.time} onChange={(v) => update("time", v)} options={[
                  ["corto", "Corto: 1 a 4 semanas"],
                  ["medio", "Medio: 1 a 3 meses"],
                  ["largo", "Largo: más de 3 meses"]
                ]} />
                <SelectField label="¿Qué nivel de acceso tienes al campo?" value={form.access} onChange={(v) => update("access", v)} options={[
                  ["bajo", "Bajo: acceso limitado o aún no confirmado"],
                  ["medio", "Medio: acceso probable pero con restricciones"],
                  ["alto", "Alto: acceso sostenido a aula, docentes o institución"]
                ]} />
                <SelectField label="¿Buscas profundidad contextual o generalización?" value={form.depth} onChange={(v) => update("depth", v)} options={[
                  ["profundidad", "Profundidad: entender un caso o experiencia en detalle"],
                  ["generalizacion", "Generalización: medir una tendencia en más participantes"],
                  ["ambas", "Ambas, pero necesito ayuda para organizarlo"]
                ]} />
              </StepCard>
            )}

            {step === 3 && (
              <StepCard title="4. Variables o categorías" icon={<FileText />}>
                <SelectField label="Enfoque tentativo que tú crees tener" value={form.tentativeApproach} onChange={(v) => update("tentativeApproach", v)} options={[
                  ["cualitativo", "Cualitativo"],
                  ["cuantitativo", "Cuantitativo"],
                  ["mixto", "Mixto"],
                  ["no-se", "No estoy seguro/a"]
                ]} />
                <Area label="Si tu estudio es cuantitativo: variables, dimensiones o indicadores posibles" value={form.variables} onChange={(v) => update("variables", v)} placeholder="Ej.: uso de dispositivos móviles, lenguaje oral, motivación, coordinación motora..." />
                <Area label="Si tu estudio es cualitativo: categorías o aspectos a comprender" value={form.categories} onChange={(v) => update("categories", v)} placeholder="Ej.: prácticas docentes, discursos, experiencias, interacciones, representaciones..." />
                <Area label="Información adicional que ayude a Yachay" value={form.extra} onChange={(v) => update("extra", v)} placeholder="Restricciones, dudas, institución, instrumentos pensados, autores, etc." />
              </StepCard>
            )}

            {step === 4 && (
              <StepCard title="5. Resultado metodológico" icon={<CheckCircle2 />}>
                <div className="grid gap-3 md:grid-cols-3">
                  <SummaryBox label="Enfoque preliminar" value={diagnostic.approach} />
                  <SummaryBox label="Diseño preliminar" value={diagnostic.design} />
                  <SummaryBox label="Viabilidad" value={diagnostic.risk} />
                </div>
                <button onClick={generateReport} disabled={loading} className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 font-semibold text-white disabled:opacity-60">
                  <Send className="h-4 w-4" />
                  {loading ? "Yachay está argumentando..." : "Generar asesoría metodológica"}
                </button>
                {saved && <p className="mt-3 text-sm text-slate-500">{saved}</p>}
              </StepCard>
            )}

            <div className="no-print mt-6 flex flex-wrap justify-between gap-3">
              <button onClick={() => setStep(Math.max(0, step - 1))} className="rounded-2xl border px-5 py-3 font-semibold disabled:opacity-40" disabled={step === 0}>Anterior</button>
              <button onClick={() => setStep(Math.min(4, step + 1))} className="rounded-2xl bg-slate-900 px-5 py-3 font-semibold text-white disabled:opacity-40" disabled={step === 4}>Siguiente</button>
            </div>
          </div>

          {(answer || loading) && (
            <section className="print-area rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-2xl font-bold">Reporte de orientación metodológica</h2>
                <div className="no-print flex gap-2">
                  <button onClick={printPDF} className="inline-flex items-center gap-2 rounded-2xl border px-4 py-2 font-semibold"><Download className="h-4 w-4" /> Descargar PDF</button>
                  <button onClick={exportJSON} className="inline-flex items-center gap-2 rounded-2xl border px-4 py-2 font-semibold">Exportar datos</button>
                </div>
              </div>
              {loading ? <p>Construyendo una argumentación robusta...</p> : <div className="prose-text whitespace-pre-wrap leading-8">{answer}</div>}
            </section>
          )}

          <section className="no-print rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              <h2 className="text-2xl font-bold">Consulta rápida a Yachay</h2>
            </div>
            <p className="mt-2 text-sm text-slate-600">Haz una pregunta puntual. Yachay responderá breve, sin divagar.</p>
            <textarea value={quickQuestion} onChange={(e) => setQuickQuestion(e.target.value)} placeholder="Ej.: ¿Por qué mi estudio no sería fenomenológico?" className="mt-4 min-h-24 w-full rounded-2xl border p-4 outline-none focus:ring-2 focus:ring-slate-900" />
            <button onClick={askQuick} disabled={quickLoading} className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 font-semibold text-white disabled:opacity-60">
              <Send className="h-4 w-4" />
              {quickLoading ? "Respondiendo..." : "Consultar"}
            </button>
            {quickAnswer && <div className="mt-4 rounded-2xl bg-slate-50 p-4 leading-7">{quickAnswer}</div>}
          </section>
        </section>
      </section>
    </main>
  );
}

function StepCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-5 flex items-center gap-3 text-2xl font-bold">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100">{icon}</span>
        {title}
      </div>
      <div className="grid gap-4">{children}</div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <label className="grid gap-2">
      <span className="font-semibold">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="rounded-2xl border p-4 outline-none focus:ring-2 focus:ring-slate-900" />
    </label>
  );
}

function Area({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <label className="grid gap-2">
      <span className="font-semibold">{label}</span>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="min-h-28 rounded-2xl border p-4 outline-none focus:ring-2 focus:ring-slate-900" />
    </label>
  );
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <label className="grid gap-2">
      <span className="font-semibold">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="rounded-2xl border bg-white p-4 outline-none focus:ring-2 focus:ring-slate-900">
        <option value="">Selecciona una opción</option>
        {options.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
      </select>
    </label>
  );
}

function Status({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3"><span className="text-slate-500">{label}</span><strong className="text-right">{value}</strong></div>;
}

function SummaryBox({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border bg-slate-50 p-4"><p className="text-sm text-slate-500">{label}</p><p className="mt-1 font-bold">{value}</p></div>;
}

function inferRoute(form: FormState) {
  let approach = "Por definir";
  let design = "Completa las preguntas";
  let risk = "Pendiente";

  if (form.evidence === "ambas" || form.purpose === "integrar" || form.depth === "ambas") {
    approach = "Mixto";
    design = "Secuencial explicativo o convergente básico";
    risk = "Viable con ajustes";
  } else if (form.evidence === "numerica" || form.purpose === "medir") {
    approach = "Cuantitativo";
    if (form.intervention === "si") {
      design = form.access === "alto" ? "Cuasi experimental" : "Preexperimental";
      risk = form.time === "corto" ? "Riesgo medio" : "Viable";
    } else {
      design = "No experimental transversal / correlacional";
      risk = "Muy viable";
    }
  } else if (form.evidence === "narrativa" || form.purpose === "comprender") {
    approach = "Cualitativo";
    if (form.purpose === "transformar" || form.intervention === "si") {
      design = "Investigación-acción";
      risk = form.time === "corto" ? "Riesgo alto" : "Viable con ajustes";
    } else if (form.depth === "profundidad" || form.access === "alto") {
      design = "Estudio de caso";
      risk = "Viable";
    } else {
      design = "Fenomenológico básico / análisis documental cualitativo";
      risk = "Viable con delimitación";
    }
  }

  if (form.time === "corto" && ["Mixto", "Investigación-acción"].some((x) => design.includes(x))) {
    risk = "Riesgo alto por tiempo";
  }

  return { approach, design, risk };
}
