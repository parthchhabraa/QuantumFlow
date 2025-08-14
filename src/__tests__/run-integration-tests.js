#!/usr/bin/env node

/**
 * Integration Test Runner
 * Runs integration tests in smaller batches to avoid memory issues
 */

const { execSync } = require('child_process');

const testGroups = [
  {
    name: 'Text File Compression',
    pattern: 'Text File Compression'
  },
  {
    name: 'Binary File Compression', 
    pattern: 'Binary File Compression'
  },
  {
    name: 'Mixed Content and File Sizes',
    pattern: 'Mixed Content Compression|File Size Variations'
  },
  {
    name: 'Compression Benchmarking',
    pattern: 'Compression Ratio Benchmarking'
  },
  {
    name: 'Data Integrity Verification',
    pattern: 'Data Integrity Verification'
  },
  {
    name: 'CLI Integration',
    pattern: 'CLI Integration Tests'
  },
  {
    name: 'Stress Testing',
    pattern: 'Stress Testing'
  },
  {
    name: 'Error Recovery',
    pattern: 'Error Recovery and Graceful Degradation'
  },
  {
    name: 'Quantum Algorithm Validation',
    pattern: 'Quantum Algorithm Validation'
  }
];

async function runTestGroup(group) {
  console.log(`\n🧪 Running ${group.name} tests...`);
  
  try {
    const command = `npm test -- --testPathPattern=integration.test.ts --testNamePattern="${group.pattern}" --verbose --runInBand`;
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${group.name} tests passed`);
    return true;
  } catch (error) {
    console.error(`❌ ${group.name} tests failed`);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting Integration Test Suite');
  console.log('=====================================');
  
  let passed = 0;
  let failed = 0;
  
  for (const group of testGroups) {
    const success = await runTestGroup(group);
    if (success) {
      passed++;
    } else {
      failed++;
    }
    
    // Add a small delay between test groups to help with memory management
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n📊 Integration Test Summary');
  console.log('===========================');
  console.log(`✅ Passed: ${passed} test groups`);
  console.log(`❌ Failed: ${failed} test groups`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('\n🎉 All integration tests passed!');
    process.exit(0);
  }
}

if (require.main === module) {
  runAllTests().catch(error => {
    console.error('Test runner error:', error);
    process.exit(1);
  });
}

module.exports = { runAllTests, runTestGroup };