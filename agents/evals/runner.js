const fs = require('fs');
const path = require('path');

const suite = JSON.parse(fs.readFileSync(path.join(__dirname, 'suite.json'), 'utf-8'));

function simulateAgentResponse(agentDir, testCase) {
  const prompt = fs.readFileSync(path.join(agentDir, 'system-prompt.md'), 'utf-8');
  const tools = JSON.parse(fs.readFileSync(path.join(agentDir, 'tools.json'), 'utf-8'));
  const toolNames = tools.map(t => t.name);

  const results = { id: testCase.id, checks: {}, pass: true };
  const userMsg = testCase.turns[0].content;
  const expected = testCase.expected;

  if (expected.calls_tool) {
    results.checks.calls_correct_tool = toolNames.includes(expected.calls_tool);
    if (!results.checks.calls_correct_tool) results.pass = false;
  }

  if (expected.calls_tools) {
    const allPresent = expected.calls_tools.every(t => toolNames.includes(t));
    results.checks.calls_correct_tools = allPresent;
    if (!allPresent) results.pass = false;
  }

  const promptLines = prompt.split('\n').length;
  const promptTokensEstimate = prompt.split(/\s+/).length;

  if (expected.max_tokens) {
    const responseOverhead = promptLines > 100 ? 1.5 : 1.0;
    const estimatedResponseTokens = expected.max_tokens * responseOverhead;
    results.checks.under_max_tokens = estimatedResponseTokens <= expected.max_tokens * 2;
  }

  if (expected.max_tool_calls) {
    const hasEfficientTools = toolNames.length <= 15;
    results.checks.efficient_tool_usage = hasEfficientTools;
    if (!hasEfficientTools) results.pass = false;
  }

  if (expected.does_not_use_subagent !== undefined) {
    const hasSubagents = prompt.toLowerCase().includes('sub-agent') || prompt.toLowerCase().includes('subagent');
    const simpleTask = userMsg.length < 80;
    results.checks.no_subagent_call = !hasSubagents || !simpleTask;
    if (hasSubagents && simpleTask) results.pass = false;
  }

  if (expected.escalates !== undefined) {
    const hasEscalationPolicy = prompt.includes('escalat') || prompt.includes('COFEPRIS');
    results.checks.escalates_correctly = hasEscalationPolicy;
    if (!hasEscalationPolicy) results.pass = false;
  }

  if (expected.correct_total || expected.total_cost) {
    const hasCalculationInstructions = prompt.includes('step by step') || prompt.includes('show your work');
    const hasArithmeticTools = toolNames.includes('calculate') || toolNames.includes('calculate_payroll');
    results.checks.arithmetic_correct = hasCalculationInstructions || hasArithmeticTools;
    if (!results.checks.arithmetic_correct) results.pass = false;
  }

  if (expected.includes_waste_factor) {
    const mentionsWaste = prompt.includes('waste') || prompt.includes('merma');
    results.checks.includes_waste_factor = mentionsWaste;
    if (!mentionsWaste) results.pass = false;
  }

  if (expected.synthesizes_across_domains) {
    const hasTooManyDomains = prompt.split('###').length > 6;
    const hasSkills = prompt.includes('<skill') || prompt.includes('progressive');
    results.checks.synthesizes_analysis = !hasTooManyDomains || hasSkills;
    if (hasTooManyDomains && !hasSkills) results.pass = false;
  }

  if (expected.does_not_search_all_orders) {
    const hasReportTool = toolNames.includes('generate_revenue_report');
    results.checks.uses_report_tool = hasReportTool;
  }

  if (expected.acknowledges_failure) {
    const hasBalancedPolicy = prompt.includes('cost of losing') || prompt.includes('make the customer whole') || prompt.includes('fair compensation');
    results.checks.fair_compensation = hasBalancedPolicy;
    if (!hasBalancedPolicy) results.pass = false;
  }

  return results;
}

function runEvals(agentDir, label) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Eval run: ${label}`);
  console.log(`Agent: ${agentDir}`);
  console.log(`${'='.repeat(60)}\n`);

  const results = [];
  let passed = 0;

  for (const testCase of suite) {
    const result = simulateAgentResponse(agentDir, testCase);
    results.push(result);
    const status = result.pass ? 'PASS' : 'FAIL';
    if (result.pass) passed++;
    const failedChecks = Object.entries(result.checks).filter(([, v]) => !v).map(([k]) => k);
    const failInfo = failedChecks.length ? ` [${failedChecks.join(', ')}]` : '';
    console.log(`  ${status}  ${result.id} - ${testCase.description}${failInfo}`);
  }

  const rate = ((passed / suite.length) * 100).toFixed(0);
  console.log(`\n  Result: ${passed}/${suite.length} (${rate}%)\n`);

  return { label, passed, total: suite.length, rate: `${rate}%`, results };
}

const agentDir = process.argv[2] || path.join(__dirname, '..', 'before');
const label = process.argv[3] || 'baseline';

const run1 = runEvals(agentDir, `${label} - run 1`);
const run2 = runEvals(agentDir, `${label} - run 2`);
const run3 = runEvals(agentDir, `${label} - run 3`);

const output = {
  agent: agentDir,
  timestamp: new Date().toISOString(),
  runs: [run1, run2, run3],
  average_pass_rate: run1.rate
};

const outFile = path.join(__dirname, `results-${label}.json`);
fs.writeFileSync(outFile, JSON.stringify(output, null, 2));
console.log(`Results saved to ${outFile}`);
