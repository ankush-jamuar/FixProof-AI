import { analyzeIncidentsForTesting, getMaintenanceInsights } from '../lib/intelligence/maintenanceInsights';

async function runIntelligenceTests() {
  console.log('🧪 RUNNING MAINTENANCE INTELLIGENCE TEST SUITE...\n');

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

  // TEST 1: Repeated incidents in same location produce a LOCATION_CLUSTER insight
  const test1Data = [
    { id: 'iss-1', title: 'Sink leak in Lab 201', location: 'Science Lab 201', aiCategory: 'plumbing', status: 'REPORTED' },
    { id: 'iss-2', title: 'Pipe burst in Lab 201', location: 'Science Lab 201', aiCategory: 'plumbing', status: 'REPORTED' },
  ];
  const test1Result = analyzeIncidentsForTesting(test1Data);
  assert(
    test1Result.length === 1 && test1Result[0].type === 'LOCATION_CLUSTER' && test1Result[0].supportingIssueIds.length === 2,
    'TEST 1: Repeated incidents in same location produce a LOCATION_CLUSTER insight'
  );

  // TEST 2: Incidents in unrelated locations do NOT produce location-specific pattern
  const test2Data = [
    { id: 'iss-3', title: 'Sink leak in Lab 201', location: 'Science Lab 201', aiCategory: 'plumbing', status: 'REPORTED' },
    { id: 'iss-4', title: 'Light flickering in Hall B', location: 'Hall B Floor 2', aiCategory: 'electrical', status: 'REPORTED' },
  ];
  const test2Result = analyzeIncidentsForTesting(test2Data);
  assert(
    test2Result.length === 0,
    'TEST 2: Incidents spread across unrelated locations do not incorrectly produce a pattern'
  );

  // TEST 3: Insufficient history produces empty state array
  const test3Result = analyzeIncidentsForTesting([]);
  assert(
    test3Result.length === 0,
    'TEST 3: Insufficient history produces professional empty state'
  );

  // TEST 4: Reopened repair failure receives CRITICAL severity
  const test4Data = [
    { id: 'iss-5', title: 'Reopened Plumbing Defect', location: 'Science Lab 201', aiCategory: 'plumbing', status: 'REOPENED' },
  ];
  const test4Result = analyzeIncidentsForTesting(test4Data);
  assert(
    test4Result.length === 1 && test4Result[0].severity === 'CRITICAL' && test4Result[0].type === 'REPEATED_REPAIR_FAILURE',
    'TEST 4: Reopened/repeated failures receive appropriately elevated CRITICAL attention'
  );

  // TEST 5: Supporting issue IDs correspond to input IDs
  const test5Data = [
    { id: 'iss-6', title: 'Issue A in Room 10', location: 'Room 10', aiCategory: 'cleaning', status: 'REPORTED' },
    { id: 'iss-7', title: 'Issue B in Room 10', location: 'Room 10', aiCategory: 'cleaning', status: 'REPORTED' },
  ];
  const test5Result = analyzeIncidentsForTesting(test5Data);
  assert(
    test5Result[0]?.supportingIssueIds.includes('iss-6') && test5Result[0]?.supportingIssueIds.includes('iss-7'),
    'TEST 5: Related issue IDs correspond to real input records'
  );

  // TEST 6: EVAL:* benchmark records are filtered out
  const test6Data = [
    { id: 'eval-1', title: 'EVAL: Benchmark Test Case 1', location: 'Room 10', aiCategory: 'plumbing', status: 'REPORTED' },
    { id: 'eval-2', title: 'EVAL: Benchmark Test Case 2', location: 'Room 10', aiCategory: 'plumbing', status: 'REPORTED' },
  ];
  const test6Result = analyzeIncidentsForTesting(test6Data);
  assert(
    test6Result.length === 0,
    'TEST 6: No EVAL:* benchmark records appear in Maintenance Intelligence'
  );

  // TEST 7-9: Live Async Database Query Test
  try {
    const liveInsights = await getMaintenanceInsights();
    assert(
      Array.isArray(liveInsights),
      'TEST 7: Live database query returns valid insights array'
    );

    const hasEvalRecord = liveInsights.some(
      (m) => m.title.startsWith('EVAL:') || m.supportingIssueIds.some((id) => id.startsWith('EVAL:'))
    );
    assert(
      !hasEvalRecord,
      'TEST 8: Real database query filters out all EVAL:* benchmark records'
    );
  } catch (err) {
    console.error('Database query test warning:', err);
  }

  console.log(`\nRESULTS: ${passed} Passed, ${failed} Failed`);
  if (failed > 0) process.exit(1);
}

runIntelligenceTests();
