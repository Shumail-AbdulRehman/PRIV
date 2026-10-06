import {readFile,writeFile} from 'node:fs/promises';
import {benchmarkReport} from '../src/services/verification-v2/evaluatorBenchmark.js';
const [input,output]=process.argv.slice(2);
const json=JSON.stringify(benchmarkReport(input?JSON.parse(await readFile(input,'utf8')):[]),null,2)+'\n';
if(output)await writeFile(output,json,{flag:'wx'});else process.stdout.write(json);
