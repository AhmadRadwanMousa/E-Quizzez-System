// Quick test to verify score calculation and database schema
const axios = require('axios');

const BASE_URL = 'http://localhost:5000';
let adminToken = '';

async function testScoreCalculation() {
  console.log('🔍 Testing Score Calculation and Database Schema...\n');
  
  try {
    // 1. Test admin login
    console.log('1. Testing admin login...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/admin/login`, {
      email: 'admin@equizzez.com',
      password: 'admin123'
    });
    
    adminToken = loginResponse.data.data.token;
    console.log('   ✅ Admin login successful');
    
    // 2. Check current results
    console.log('\n2. Checking current results...');
    const resultsResponse = await axios.get(`${BASE_URL}/api/admin/results`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    const results = resultsResponse.data.data;
    console.log(`   📊 Found ${results.length} results`);
    
    if (results.length > 0) {
      const firstResult = results[0];
      console.log('\n   📋 Sample Result Data:');
      console.log(`      Student: ${firstResult.student_name}`);
      console.log(`      Exam: ${firstResult.exam_title}`);
      console.log(`      Score: ${firstResult.score}`);
      console.log(`      Total Questions: ${firstResult.total_questions}`);
      console.log(`      Total Marks: ${firstResult.total_marks || 'NOT SET'}`);
      console.log(`      Percentage: ${firstResult.percentage || 'NOT SET'}`);
      
      // Check if total_marks column exists
      if (firstResult.total_marks === undefined) {
        console.log('\n   ❌ PROBLEM: total_marks column does not exist in results table!');
        console.log('   This means the database schema was not updated.');
      } else {
        console.log('\n   ✅ total_marks column exists');
        
        // Check score calculation
        if (firstResult.total_marks > 0) {
          const calculatedPercentage = Math.round((firstResult.score / firstResult.total_marks) * 100);
          console.log(`   📊 Score Calculation: ${firstResult.score} / ${firstResult.total_marks} = ${calculatedPercentage}%`);
          
          if (firstResult.percentage === calculatedPercentage) {
            console.log('   ✅ Percentage calculation is correct!');
          } else {
            console.log(`   ❌ Percentage mismatch: Backend says ${firstResult.percentage}%, Calculated: ${calculatedPercentage}%`);
          }
        } else {
          console.log('   ⚠️  total_marks is 0, cannot calculate percentage');
        }
      }
    } else {
      console.log('   ℹ️  No results found to test');
    }
    
    // 3. Check database schema
    console.log('\n3. Testing database schema...');
    try {
      const subjectsResponse = await axios.get(`${BASE_URL}/api/admin/subjects`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.log('   ✅ Subjects API working - new schema active');
    } catch (error) {
      console.log('   ❌ Subjects API failed - old schema still active');
      console.log(`      Error: ${error.response?.data?.message || error.message}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
  }
}

testScoreCalculation().catch(console.error);
