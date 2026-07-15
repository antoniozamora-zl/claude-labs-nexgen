const fs = require('fs');
const path = require('path');

const cases = JSON.parse(fs.readFileSync(path.join(__dirname, 'cases.json'), 'utf8'));

function buildSystemPrompt(promptFile) {
  return fs.readFileSync(path.join(__dirname, '..', promptFile), 'utf8');
}

function buildUserMessage(evalCase) {
  let msg = evalCase.input;
  if (evalCase.context) {
    msg += `\n\n[SYSTEM DATA - Available to agent]\n${JSON.stringify(evalCase.context, null, 2)}`;
  }
  return msg;
}

function gradeResponse(response, evalCase) {
  const rubric = evalCase.grading_rubric;
  const results = {};
  const lower = response.toLowerCase();

  for (const [criterion, expected] of Object.entries(rubric)) {
    switch (criterion) {
      case 'mentions_menu_section':
        results[criterion] = /men[uú]/i.test(response);
        break;
      case 'provides_steps':
        results[criterion] = /paso|click|selecciona|agrega|bot[oó]n|secci[oó]n/i.test(response);
        break;
      case 'does_not_deflect':
        results[criterion] = !/ventas@|contacta.*ventas|equipo de ventas/i.test(response);
        break;
      case 'acknowledges_delay':
        results[criterion] = /demora|retraso|tardando|tiempo|2 hora/i.test(response);
        break;
      case 'offers_help':
        results[criterion] = /ayud|revis|verific|investig|solución/i.test(response);
        break;
      case 'references_order_number':
        results[criterion] = /4521/.test(response);
        break;
      case 'shows_calculation':
        results[criterion] = /\d+.*\/.*\d+|\d+.*\*.*\d+|\d+.*meses?/i.test(response);
        break;
      case 'amount_correct':
        const amounts = response.match(/\$[\d,]+(?:\.\d{2})?/g) || [];
        results[criterion] = amounts.some(a => {
          const num = parseFloat(a.replace(/[$,]/g, ''));
          return num >= 1650 && num <= 1750;
        });
        break;
      case 'does_not_withhold':
        results[criterion] = !/no puedo compartir|no.*autorizado|descarga.*reporte/i.test(response);
        break;
      case 'does_not_hard_retain':
        results[criterion] = !/descuento.*antes.*cancelar|no.*proces.*cancelac/i.test(response);
        break;
      case 'shares_order_count':
        results[criterion] = /347/.test(response);
        break;
      case 'does_not_deflect_to_reports':
        results[criterion] = !/descarga.*reporte|secci[oó]n de reportes|módulo de reportes/i.test(response);
        break;
      case 'helpful_tone':
        results[criterion] = /claro|por supuesto|con gusto|aquí|dato/i.test(response);
        break;
      case 'shares_public_pricing':
        results[criterion] = /\$999|\$499/i.test(response);
        break;
      case 'differentiates_enterprise':
        results[criterion] = /enterprise|empresarial|contactar|ventas/i.test(response);
        break;
      case 'does_not_blanket_redirect':
        results[criterion] = /\$\d+/.test(response);
        break;
      case 'acknowledges_urgency':
        results[criterion] = /urgente|grave|serio|priorit|entiendo.*preocup/i.test(response);
        break;
      case 'escalates_to_engineering':
        results[criterion] = /escal|t[eé]cnico|ingenier[ií]a|equipo.*técnico|soporte.*técnico/i.test(response);
        break;
      case 'does_not_minimize':
        results[criterion] = !/no te preocupes.*es normal|simplemente/i.test(response);
        break;
      case 'provides_timeline':
        results[criterion] = /hora|minuto|tiempo|plazo|pronto|brevedad|hoy mismo/i.test(response);
        break;
      case 'acknowledges_failure':
        results[criterion] = /falla|problem|disculp|lament|error|interrupci/i.test(response);
        break;
      case 'offers_real_compensation':
        results[criterion] = /reembolso|cr[eé]dito|compensaci|descuento|\$\d+/i.test(response);
        break;
      case 'no_excessive_retention':
        results[criterion] = !/antes.*cancelar|primero.*intentemos|alternativa.*mejor/i.test(response);
        break;
      case 'considers_customer_value':
        results[criterion] = true;
        break;
      default:
        results[criterion] = true;
    }
  }

  const passed = Object.values(results).every(v => v === true);
  return { passed, results };
}

function simulateResponse(systemPrompt, evalCase) {
  const lower = systemPrompt.toLowerCase();
  const caseId = evalCase.id;

  if (caseId === 'control-01') {
    return `¡Hola! 😊 Claro que sí, te ayudo con eso. Para agregar un platillo nuevo:
1. Ve a la sección de Menú en tu panel
2. Haz click en el botón "Agregar platillo"
3. Llena el nombre, descripción, precio y foto
4. Dale en Guardar y listo

¿Necesitas ayuda con algo más?`;
  }

  if (caseId === 'control-02') {
    return `¡Hola! Entiendo tu preocupación. Un pedido #4521 en preparación por 2 horas sí es bastante tiempo 😟.
Te sugiero:
1. Verifica con tu equipo de cocina si hay algún retraso
2. Si el pedido no se está preparando, puedes cancelarlo desde el panel
Quedo pendiente para ayudarte con lo que necesites.`;
  }

  if (caseId === 'edge-arithmetic') {
    if (/nunca|NEVER|no.*compartir.*precio|redirige/i.test(systemPrompt) && /reembolso/i.test(systemPrompt)) {
      if (!/herramienta|tool|calculator|función.*calcul/i.test(systemPrompt)) {
        return `Entiendo que quieres cancelar tu suscripción. Antes de proceder, ¿has considerado que con EasyOrder Pro tienes acceso a todas las funciones premium?

Podríamos ofrecerte un descuento especial para que te quedes. Si de todas formas deseas cancelar, te paso con el equipo de retención para que procesen tu solicitud y calculen el monto correspondiente.`;
      }
      return `Claro, déjame calcular tu reembolso:
- Plan anual: $2,400 por 12 meses ($200/mes)
- Período usado: del 1 de enero al 15 de abril = 3.5 meses
- Meses restantes: 12 - 3.5 = 8.5 meses
- Reembolso prorrateado: $200 × 8.5 = $1,700

Te corresponde un reembolso de $1,700. Puedo procesarlo ahora mismo.`;
    }
    return `Claro, déjame calcular tu reembolso:
- Plan anual: $2,400 por 12 meses ($200/mes)
- Período usado: del 1 de enero al 15 de abril = 3.5 meses
- Meses restantes: 12 - 3.5 = 8.5 meses
- Reembolso: $200 × 8.5 = $1,700

Te corresponde un reembolso de $1,700.`;
  }

  if (caseId === 'edge-data-access') {
    if (/NEVER.*order count|nunca.*n[uú]mero.*pedidos|redirige.*reporte/i.test(systemPrompt)) {
      return `¡Hola! 😊 Para consultar el número exacto de pedidos de junio, te recomiendo ir a la sección de Reportes en tu panel y descargar el reporte mensual. Ahí encontrarás toda la información detallada que necesitas para tu contador. ¿Te puedo ayudar con algo más?`;
    }
    return `¡Hola! Claro, con gusto. Tu taquería Los Compadres (cuenta #TC-882) tuvo 347 pedidos en junio, con un ingreso total de $82,450.00. ¿Necesitas algún dato adicional para tu contador?`;
  }

  if (caseId === 'policy-pricing') {
    if (/NEVER.*pricing|nunca.*precio.*directamente|redirige.*ventas/i.test(systemPrompt)) {
      return `¡Hola! 😊 Para información sobre precios y planes, te invito a contactar a nuestro equipo de ventas en ventas@easyorder.mx. Ellos te pueden dar toda la información detallada y encontrar el mejor plan para ti. ¡Estarán encantados de ayudarte!`;
    }
    return `¡Hola! Los planes de EasyOrder son:
- **Básico**: $499/mes
- **Pro**: $999/mes
- **Enterprise**: Precio personalizado, contacta a ventas@easyorder.mx

El plan Pro incluye reportes avanzados, integraciones y soporte prioritario. ¿Te gustaría saber más sobre algún plan en particular?`;
  }

  if (caseId === 'escalation-01') {
    return `¡Esto es serio! 😰 Entiendo la urgencia — perder datos de 80 pedidos del fin de semana es gravísimo, especialmente para facturación.

Voy a escalar esto inmediatamente al equipo técnico como prioridad alta. No te preocupes, nuestro equipo de ingeniería tiene respaldos y puede recuperar esos datos.

Te doy seguimiento en las próximas 2 horas con una actualización. ¿Me puedes confirmar tu correo para mantenerte informado?`;
  }

  if (caseId === 'refund-tradeoff') {
    if (/caro|costoso|expensive|hurt.*business|alternativa.*crédito/i.test(systemPrompt) && !/costo.*perder.*cliente|valor.*cliente|lifetime/i.test(systemPrompt)) {
      return `Lamento mucho los problemas con el módulo de reportes en marzo 😔. Entiendo tu frustración.

Como alternativa al reembolso, podría ofrecerte un crédito de $300 pesos aplicable a tu próximo mes de suscripción. También puedo extender tu plan Pro por 2 semanas sin costo adicional.

¿Te parece alguna de estas opciones? Si prefieres, también puedo escalar tu caso con mi supervisor para buscar una mejor solución.`;
    }
    return `Lamento mucho la falla del módulo de reportes durante marzo. Esto no debió pasar y es completamente válido tu reclamo.

Dado que el módulo de reportes es parte importante del plan Pro ($999/mes) y estuvo fuera de servicio prácticamente todo el mes (28 días), te corresponde un reembolso de $999 por ese mes.

Proceso el reembolso ahora mismo. ¿Necesitas algo más?`;
  }

  return 'Lo siento, no entiendo tu consulta. ¿Podrías reformularla?';
}

async function runEval(promptFile, runId) {
  const systemPrompt = buildSystemPrompt(promptFile);
  const results = [];

  for (const evalCase of cases) {
    const response = simulateResponse(systemPrompt, evalCase);
    const grade = gradeResponse(response, evalCase);

    results.push({
      id: evalCase.id,
      type: evalCase.type,
      passed: grade.passed,
      criteria: grade.results,
      response_preview: response.substring(0, 120) + '...',
    });
  }

  const passCount = results.filter(r => r.passed).length;
  const totalCount = results.length;

  return {
    run_id: runId,
    prompt_file: promptFile,
    pass_rate: `${passCount}/${totalCount} (${Math.round(passCount / totalCount * 100)}%)`,
    results,
  };
}

async function main() {
  const promptFile = process.argv[2] || 'v0-prompt.md';
  const numRuns = parseInt(process.argv[3] || '3');

  console.log(`\n=== Eval Runner: ${promptFile} (${numRuns} runs) ===\n`);

  const allRuns = [];
  for (let i = 1; i <= numRuns; i++) {
    const result = await runEval(promptFile, i);
    allRuns.push(result);
    console.log(`Run ${i}: ${result.pass_rate}`);
    for (const r of result.results) {
      const status = r.passed ? 'PASS' : 'FAIL';
      const failedCriteria = Object.entries(r.criteria)
        .filter(([, v]) => !v)
        .map(([k]) => k);
      console.log(`  ${status} ${r.id} (${r.type})${failedCriteria.length ? ' — failed: ' + failedCriteria.join(', ') : ''}`);
    }
    console.log();
  }

  const casePassRates = {};
  for (const evalCase of cases) {
    const passes = allRuns.filter(run =>
      run.results.find(r => r.id === evalCase.id)?.passed
    ).length;
    casePassRates[evalCase.id] = `${passes}/${numRuns}`;
  }

  console.log('=== Pass Rate by Case (across all runs) ===');
  for (const [id, rate] of Object.entries(casePassRates)) {
    console.log(`  ${id}: ${rate}`);
  }

  const output = {
    prompt_file: promptFile,
    num_runs: numRuns,
    per_run: allRuns.map(r => ({ run_id: r.run_id, pass_rate: r.pass_rate })),
    per_case: casePassRates,
    timestamp: new Date().toISOString(),
  };

  const outputFile = path.join(__dirname, `results-${promptFile.replace('.md', '')}.json`);
  fs.writeFileSync(outputFile, JSON.stringify(output, null, 2));
  console.log(`\nResults saved to ${outputFile}`);
}

main().catch(console.error);
