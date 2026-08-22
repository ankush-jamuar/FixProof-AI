import { validateStatusTransition } from '../lib/agent/stateMachine';
import { analyzeIncidentsForTesting } from '../lib/intelligence/maintenanceInsights';
import { getAvailableTechniciansByCategory } from '../lib/db/queries';

async function runWorkflowBugTests() {
  console.log('🧪 RUNNING WORKFLOW BUG & STATE MACHINE VERIFICATION SUITE...\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      if (detail) console.error(`   Details: ${detail}`);
      failed++;
    }
  }

  // TEST 1: PENDING_REVIEW -> VERIFIED is accepted through state-machine
  try {
    const isValid1 = validateStatusTransition('PENDING_REVIEW', 'VERIFIED');
    assert(isValid1 === true, 'TEST 1: PENDING_REVIEW -> VERIFIED transition is valid in state machine');
  } catch (err: any) {
    assert(false, 'TEST 1: PENDING_REVIEW -> VERIFIED transition is valid in state machine', err.message);
  }

  // TEST 2: PENDING_REVIEW -> REOPENED is accepted through state-machine
  try {
    const isValid2 = validateStatusTransition('PENDING_REVIEW', 'REOPENED');
    assert(isValid2 === true, 'TEST 2: PENDING_REVIEW -> REOPENED transition is valid in state machine');
  } catch (err: any) {
    assert(false, 'TEST 2: PENDING_REVIEW -> REOPENED transition is valid in state machine', err.message);
  }

  // TEST 3: VERIFIED -> CLOSED transition flow
  try {
    const isValid3 = validateStatusTransition('VERIFIED', 'CLOSED');
    assert(isValid3 === true, 'TEST 3: VERIFIED -> CLOSED transition is valid in state machine');
  } catch (err: any) {
    assert(false, 'TEST 3: VERIFIED -> CLOSED transition is valid in state machine', err.message);
  }

  // TEST 4: REOPENED -> IN_PROGRESS transition flow (Technician Retry)
  try {
    const isValid4 = validateStatusTransition('REOPENED', 'IN_PROGRESS');
    assert(isValid4 === true, 'TEST 4: REOPENED -> IN_PROGRESS transition is valid in state machine');
  } catch (err: any) {
    assert(false, 'TEST 4: REOPENED -> IN_PROGRESS transition is valid in state machine', err.message);
  }

  // TEST 5: Illegal transitions remain strictly rejected
  try {
    validateStatusTransition('CLOSED', 'IN_PROGRESS');
    assert(false, 'TEST 5: Illegal transition CLOSED -> IN_PROGRESS must be rejected');
  } catch (err: any) {
    assert(
      err.message.includes('Invalid status transition') || err.message.includes('cannot transition'),
      'TEST 5: Illegal transition CLOSED -> IN_PROGRESS remains strictly rejected'
    );
  }

  try {
    validateStatusTransition('REPORTED', 'VERIFIED');
    assert(false, 'TEST 5b: Illegal transition REPORTED -> VERIFIED must be rejected');
  } catch (err: any) {
    assert(
      err.message.includes('Invalid status transition') || err.message.includes('cannot transition'),
      'TEST 5b: Illegal transition REPORTED -> VERIFIED remains strictly rejected'
    );
  }

  // TEST 6: Category-Strict Technician Assignment
  const plumbingTechs = await getAvailableTechniciansByCategory('plumbing');
  const electricalTechs = await getAvailableTechniciansByCategory('electrical');
  const cleaningTechs = await getAvailableTechniciansByCategory('cleaning');

  const plumbingOk = plumbingTechs.every((t) => t.category === 'plumbing');
  const electricalOk = electricalTechs.every((t) => t.category === 'electrical');
  const cleaningOk = cleaningTechs.every((t) => t.category === 'cleaning');

  assert(
    plumbingOk && electricalOk && cleaningOk,
    'TEST 6: Category-strict technician assignment enforced (No category leakage)'
  );

  // TEST 7: Maintenance Intelligence tests still pass
  const sampleData = [
    { id: 'i-1', title: 'Sink leak in Lab 1', location: 'Lab 1', aiCategory: 'plumbing', status: 'REPORTED' },
    { id: 'i-2', title: 'Pipe burst in Lab 1', location: 'Lab 1', aiCategory: 'plumbing', status: 'REPORTED' },
  ];
  const intelligenceResult = analyzeIncidentsForTesting(sampleData);
  assert(
    intelligenceResult.length === 1 && intelligenceResult[0].type === 'LOCATION_CLUSTER',
    'TEST 7: Maintenance Intelligence pattern detection still passes'
  );

  console.log(`\nRESULTS: ${passed} Passed, ${failed} Failed`);
  if (failed > 0) process.exit(1);
}

runWorkflowBugTests();
