/**
 * AUDIT SCRIPT: Extract all frontend API calls and match with backend
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function auditFrontendAPIs() {
    console.log('🔍 FRONTEND API CALL AUDIT\n');
    console.log('='.repeat(70));

    try {
        // Search for api.get, api.post, api.put, api.patch, api.delete
        const methods = ['get', 'post', 'put', 'patch', 'delete'];
        const allCalls = {};

        for (const method of methods) {
            const { stdout } = await execAsync(
                `grep -r "api\\.${method}(" ../../frontend/src --include="*.jsx" --include="*.js" -n || true`,
                { cwd: __dirname }
            );

            if (stdout) {
                const lines = stdout.trim().split('\n');
                allCalls[method] = lines.map(line => {
                    // Extract: file:line:code 
                    const parts = line.split(':');
                    if (parts.length >= 3) {
                        const file = parts[0];
                        const lineNum = parts[1];
                        const code = parts.slice(2).join(':');

                        // Extract endpoint from code
                        const endpointMatch = code.match(new RegExp(`api\\.${method}\\(['"\`]([^'"\`]+)['"\`]`));
                        if (endpointMatch) {
                            return {
                                file: file.replace(/.*frontend\/src\//, ''),
                                line: lineNum,
                                endpoint: endpointMatch[1]
                            };
                        }
                    }
                    return null;
                }).filter(Boolean);
            } else {
                allCalls[method] = [];
            }
        }

        // Display by method
        let totalCalls = 0;
        for (const [method, calls] of Object.entries(allCalls)) {
            if (calls.length > 0) {
                console.log(`\n📡 ${method.toUpperCase()} Requests (${calls.length})`);
                console.log('-'.repeat(70));
                calls.forEach(call => {
                    console.log(`   ${call.endpoint.padEnd(40)} ${call.file}:${call.line}`);
                });
                totalCalls += calls.length;
            }
        }

        console.log('\n' + '='.repeat(70));
        console.log(`📊 TOTAL API CALLS: ${totalCalls}`);
        console.log('='.repeat(70));

        // Group by endpoint prefix
        console.log('\n📋 GROUPED BY PREFIX:\n');
        const grouped = {};
        for (const calls of Object.values(allCalls)) {
            for (const call of calls) {
                const prefix = call.endpoint.split('/')[1] || 'root';
                if (!grouped[prefix]) grouped[prefix] = [];
                grouped[prefix].push(call);
            }
        }

        for (const [prefix, calls] of Object.entries(grouped).sort()) {
            console.log(`   /${prefix} - ${calls.length} calls`);
        }

    } catch (error) {
        console.error('Error:', error.message);
    }
}

auditFrontendAPIs();
