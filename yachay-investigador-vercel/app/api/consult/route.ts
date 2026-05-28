import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `
Eres Yachay Investigador, un asistente metodológico para estudiantes de Seminario de Investigación I en educación.
Tu tono es conversacional, académico, claro, formativo y directo. No reemplazas la asesoría docente; orientas y problematizas.

BASE PEDAGÓGICA:
- El enfoque define cómo se concibe y produce conocimiento.
- Cuantitativo: mide variables, dimensiones e indicadores; usa estadística; busca describir, correlacionar, explicar o contrastar hipótesis.
- Cualitativo: trabaja con categorías y subcategorías; interpreta significados, prácticas, experiencias, discursos y contextos.
- Mixto: integra datos cuantitativos y cualitativos; exige justificar cómo se integran ambas fases.
- Tipo básica: genera conocimiento teórico. Tipo aplicada: resuelve un problema práctico educativo.
- Niveles: exploratorio, descriptivo, correlacional, explicativo.
- Diseños cuantitativos: no experimental transversal, no experimental longitudinal, descriptivo, correlacional, explicativo no experimental, preexperimental, cuasi experimental, experimental puro.
- Diseños cualitativos: estudio de caso, fenomenológico, investigación-acción, etnográfico, teoría fundamentada, biográfico-narrativo, análisis documental cualitativo.
- Diseños mixtos: convergente, secuencial exploratorio, secuencial explicativo, incrustado.
- Considera viabilidad: tiempo, acceso a campo, dificultad analítica, necesidad de intervención, dominio estadístico/cualitativo, ética y disponibilidad de participantes.
- En pregrado/Seminario I, prioriza rutas viables. Advierte cuando etnografía, teoría fundamentada, longitudinal, experimental puro o mixto complejo pueden entrampares por tiempo o complejidad.

AUTORES DE REFERENCIA:
Puedes mencionar de forma orientadora a Hernández-Sampieri y Mendoza, Creswell, Yin, Stake, Flick, Bisquerra, Maxwell, Taylor y Bogdan, Strauss y Corbin, según corresponda. No inventes citas textuales ni páginas.

REGLAS DE RESPUESTA:
- Máximo 1500 palabras para una asesoría metodológica completa.
- Máximo 220 palabras si el modo es "consulta rápida".
- Ofrece al menos dos rutas metodológicas posibles.
- Argumenta robustamente: interpreta el problema, vincula pregunta-objetivo-enfoque-diseño, explica por qué sí, por qué no, riesgos y viabilidad.
- No dictamines de manera absoluta. Usa: "una ruta metodológica coherente podría ser...".
- Señala que la IA debe citarse si se utiliza en la elaboración del trabajo y que toda sugerencia debe contrastarse con bibliografía metodológica y con la docente asesora.
- Si faltan datos, entrega una orientación provisional y pide 1 o 2 datos clave, no más.
- Nunca inventes resultados, muestra ni instrumentos validados.
`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        answer: fallbackAnswer(body)
      });
    }

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
        temperature: 0.35,
        max_output_tokens: body.mode === "quick" ? 650 : 2200,
        input: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: JSON.stringify(body, null, 2) }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ answer: fallbackAnswer(body), warning: errorText }, { status: 200 });
    }

    const data = await response.json();
    const answer = data.output_text || data.output?.[0]?.content?.[0]?.text || fallbackAnswer(body);
    return NextResponse.json({ answer });
  } catch (error) {
    return NextResponse.json({ answer: "No pude procesar la consulta en este momento. Revisa los datos ingresados e intenta nuevamente." }, { status: 200 });
  }
}

function fallbackAnswer(body: any) {
  if (body.mode === "quick") {
    return "Como orientación breve: revisa si tu pregunta busca comprender significados, medir variables o integrar ambas rutas. Si buscas comprender prácticas o experiencias en contexto, probablemente sea cualitativa. Si buscas medir relación o efecto entre variables, será cuantitativa. Si combinas ambos tipos de evidencia y explicas cómo se integran, podría ser mixta. Contrasta esta orientación con bibliografía metodológica y cita el uso de IA si empleas esta respuesta.";
  }

  return `Una ruta metodológica preliminar debe partir de la relación entre la pregunta y el objetivo. Si el estudio busca comprender experiencias, prácticas o significados, conviene valorar un enfoque cualitativo con diseños como estudio de caso o fenomenológico. Si busca medir variables, comparar resultados o establecer relaciones, conviene un enfoque cuantitativo con diseño no experimental transversal, correlacional, preexperimental o cuasi experimental, según exista o no intervención. Si combina datos narrativos y numéricos, podría ser mixto, aunque exige mayor planificación.

Primera alternativa: estudio cualitativo de caso si el fenómeno depende de un aula, institución o grupo específico. Esta ruta es viable cuando se requiere profundidad contextual y se pueden triangular entrevistas, observación y documentos.

Segunda alternativa: diseño cuantitativo no experimental transversal o correlacional si el objetivo es medir variables en un momento específico y analizar asociación entre ellas. Esta ruta suele ser más viable en Seminario I porque demanda menos tiempo de campo que un diseño longitudinal o experimental puro.

Advertencia metodológica: diseños como etnografía, teoría fundamentada, longitudinal o experimental puro pueden ser rigurosos, pero también más complejos por tiempo, acceso y análisis. Toda decisión debe contrastarse con autores de metodología, revisarse con la docente asesora y citar el uso de IA si esta orientación se incorpora al trabajo.`;
}
